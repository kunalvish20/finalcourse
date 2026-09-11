import { NextResponse } from "next/server";
import { getCurrentUser, hasLifetimeCourseAccess } from "@/lib/auth";
import { COURSE_BASE_PRICE_PAISE, COURSE_GST_PAISE, COURSE_SLUG, COURSE_TOTAL_PAISE } from "@/lib/course";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPayUCheckoutFields, createPayUTxnId, getPayUEndpoints } from "@/lib/payu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cleanName = (v: unknown) => String(v ?? "").trim().replace(/[|\r\n\t]+/g, " ").replace(/\s+/g, " ").slice(0, 60);
const cleanPhone = (v: unknown) => String(v ?? "").replace(/\D/g, "").slice(-10);

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) return NextResponse.json({ error: "Please sign in with Google first." }, { status: 401 });
    if (await hasLifetimeCourseAccess(user.id)) return NextResponse.json({ error: "Course is already unlocked on this account." }, { status: 409 });

    const body = await request.json().catch(() => ({}));
    const firstname = cleanName(body.firstname || user.user_metadata?.full_name || user.user_metadata?.name || "");
    const phone = cleanPhone(body.phone);
    if (firstname.length < 2) return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
    if (phone.length !== 10) return NextResponse.json({ error: "Enter a valid 10-digit phone number." }, { status: 400 });

    const admin = createAdminClient();
    const { error: profileError } = await admin.from("profiles").upsert({
      id: user.id,
      email: user.email.toLowerCase(),
      full_name: firstname,
      phone,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    if (profileError) throw new Error(`Could not save customer profile: ${profileError.message}`);

    const txnid = createPayUTxnId();
    const { error: orderError } = await admin.from("payment_orders").insert({
      txnid,
      user_id: user.id,
      course_slug: COURSE_SLUG,
      subtotal_paise: COURSE_BASE_PRICE_PAISE,
      gst_paise: COURSE_GST_PAISE,
      total_paise: COURSE_TOTAL_PAISE,
      currency: "INR",
      status: "pending",
      customer_name: firstname,
      customer_email: user.email.toLowerCase(),
      customer_phone: phone,
    });
    if (orderError) throw new Error(`Could not create payment order: ${orderError.message}`);

    const fields = createPayUCheckoutFields({ txnid, customer: { firstname, email: user.email.toLowerCase(), phone } });
    return NextResponse.json({ action: getPayUEndpoints().checkout, method: "POST", fields }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("PAYU_CREATE_FAILED", error);
    const message = error instanceof Error ? error.message : "Unknown payment initialization error.";
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? message : "Unable to start secure checkout. Please retry." },
      { status: 500 },
    );
  }
}
