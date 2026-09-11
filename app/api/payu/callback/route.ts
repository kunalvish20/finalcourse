import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl, payUPaymentIsActiveSuccess, payUPaymentMatchesOrder, verifyPayUPayment, verifyPayUResponseHash, type PayUResponseParams } from "@/lib/payu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readParams(request: NextRequest) {
  const form = await request.formData();
  const params: PayUResponseParams = {};
  form.forEach((value, key) => { params[key] = String(value); });
  return params;
}
const go = (path: string) => NextResponse.redirect(new URL(path, getSiteUrl()), { status: 303 });

async function verifyWithRetry(txnid: string, expected: { amountPaise: number; email: string }) {
  let lastError: unknown;
  let lastPayment: Awaited<ReturnType<typeof verifyPayUPayment>> | null = null;
  for (let i = 0; i < 4; i++) {
    try {
      lastPayment = await verifyPayUPayment(txnid);
      if (payUPaymentMatchesOrder(lastPayment, { txnid, amountPaise: expected.amountPaise, email: expected.email }) && payUPaymentIsActiveSuccess(lastPayment)) return lastPayment;
    } catch (e) { lastError = e; }
    if (i < 3) await new Promise(r => setTimeout(r, 700 * (i + 1)));
  }
  if (lastPayment) return lastPayment;
  throw lastError instanceof Error ? lastError : new Error("PayU verification did not complete.");
}

export async function POST(request: NextRequest) {
  try {
    const params = await readParams(request);
    const txnid = String(params.txnid || "");
    if (!txnid.startsWith("YTC_") || !verifyPayUResponseHash(params)) return go("/buy?payment=tampered");

    const admin = createAdminClient();
    const { data: order } = await admin.from("payment_orders").select("txnid,user_id,total_paise,customer_email").eq("txnid", txnid).maybeSingle();
    if (!order) return go("/buy?payment=unverified");
    if (String(params.status || "").toLowerCase() !== "success") {
      await admin.from("payment_orders").update({ status: "failed", updated_at: new Date().toISOString() }).eq("txnid", txnid);
      return go("/buy?payment=failed");
    }

    const payment = await verifyWithRetry(txnid, { amountPaise: order.total_paise, email: order.customer_email });
    if (!payUPaymentMatchesOrder(payment, { txnid, amountPaise: order.total_paise, email: order.customer_email }) || !payUPaymentIsActiveSuccess(payment)) {
      return go("/buy?payment=unverified");
    }

    const { error } = await admin.rpc("finalize_course_purchase", {
      p_txnid: txnid,
      p_mihpayid: payment.mihpayid || null,
      p_verified_status: payment.status,
    });
    if (error) throw error;
    await admin.from("payment_events").insert({ txnid, event_type: "callback_verified", payload: { status: payment.status, unmappedstatus: payment.unmappedstatus, mihpayid: payment.mihpayid } });
    return go("/opencourse?payment=success");
  } catch (error) {
    console.error("PAYU_CALLBACK_FAILED", error);
    return go("/buy?payment=error");
  }
}

export async function GET() { return go("/buy"); }
