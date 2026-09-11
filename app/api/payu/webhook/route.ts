import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeInactiveStatus, payUPaymentIsActiveSuccess, payUPaymentMatchesOrder, verifyPayUPayment, verifyPayURefund, verifyPayUResponseHash, type PayUResponseParams } from "@/lib/payu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readBody(request: NextRequest) {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) return { kind: "json" as const, body: await request.json().catch(() => ({})) as Record<string, unknown> };
  const form = await request.formData(); const body: PayUResponseParams = {};
  form.forEach((value, key) => { body[key] = String(value); });
  return { kind: "form" as const, body };
}

export async function POST(request: NextRequest) {
  try {
    const incoming = await readBody(request);
    const admin = createAdminClient();

    if (incoming.kind === "json" && String(incoming.body.action || "").toLowerCase() === "refund") {
      const txnid = String(incoming.body.merchantTxnId || "");
      const requestId = String(incoming.body.request_id || "");
      if (!txnid.startsWith("YTC_") || String(incoming.body.status || "").toLowerCase() !== "success") return NextResponse.json({ ok: true, ignored: true });
      const { data: order } = await admin.from("payment_orders").select("txnid,total_paise,payu_mihpayid").eq("txnid", txnid).maybeSingle();
      if (!order) return NextResponse.json({ ok: true });
      const refund = await verifyPayURefund(requestId);
      if (refund.status === "success" && refund.action === "refund" && refund.mihpayid === String(order.payu_mihpayid || "").trim() && refund.amountPaise >= order.total_paise) {
        await admin.rpc("mark_course_payment_inactive", { p_txnid: txnid, p_status: "refunded" });
        await admin.from("payment_events").insert({ txnid, event_type: "refund_verified", payload: { request_id: requestId, mihpayid: refund.mihpayid, amount_paise: refund.amountPaise } });
      }
      return NextResponse.json({ ok: true });
    }

    if (incoming.kind !== "form") return NextResponse.json({ ok: true, ignored: true });
    const params = incoming.body; const txnid = String(params.txnid || "");
    if (!txnid.startsWith("YTC_")) return NextResponse.json({ ok: true, ignored: true });
    if (!params.hash || !verifyPayUResponseHash(params)) return NextResponse.json({ ok: true });

    const { data: order } = await admin.from("payment_orders").select("txnid,total_paise,customer_email").eq("txnid", txnid).maybeSingle();
    if (!order) return NextResponse.json({ ok: true });
    const payment = await verifyPayUPayment(txnid);
    if (!payUPaymentMatchesOrder(payment, { txnid, amountPaise: order.total_paise, email: order.customer_email })) return NextResponse.json({ ok: true });

    if (payUPaymentIsActiveSuccess(payment)) await admin.rpc("finalize_course_purchase", { p_txnid: txnid, p_mihpayid: payment.mihpayid || null, p_verified_status: payment.status });
    else await admin.rpc("mark_course_payment_inactive", { p_txnid: txnid, p_status: normalizeInactiveStatus(payment) });
    await admin.from("payment_events").insert({ txnid, event_type: "webhook_verified", payload: { status: payment.status, unmappedstatus: payment.unmappedstatus, mihpayid: payment.mihpayid } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PAYU_WEBHOOK_FAILED", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
export async function GET() { return NextResponse.json({ ok: true, service: "payu-course-webhook" }); }
