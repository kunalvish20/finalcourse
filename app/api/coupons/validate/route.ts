import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCouponQuote } from "@/lib/coupon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to apply a coupon." }, { status: 401 });

  const body: unknown = await request.json().catch(() => ({}));
  const couponCode = body && typeof body === "object" && "couponCode" in body ? body.couponCode : undefined;
  const quote = getCouponQuote(couponCode);
  if (!quote) return NextResponse.json({ error: "That coupon code isn't valid. Please check and try again." }, { status: 400 });

  return NextResponse.json(quote, { headers: { "Cache-Control": "no-store" } });
}
