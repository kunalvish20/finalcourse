import { COURSE_TOTAL_PAISE } from "@/lib/course";

export const COUPON_CODE = "DAX100";
export const COUPON_DISCOUNT_PAISE = 10_000;

export function normalizeCouponCode(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, "").toUpperCase() : "";
}

export function getCouponQuote(value: unknown) {
  const code = normalizeCouponCode(value);
  if (code !== COUPON_CODE) return null;

  const discountPaise = Math.min(COUPON_DISCOUNT_PAISE, COURSE_TOTAL_PAISE);
  return {
    code: COUPON_CODE,
    originalTotalPaise: COURSE_TOTAL_PAISE,
    discountPaise,
    totalPaise: Math.max(0, COURSE_TOTAL_PAISE - discountPaise),
  };
}
