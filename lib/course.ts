export const COURSE_SLUG = "youtube-gaming-blueprint";

const configuredPrice = Number(process.env.COURSE_PRICE_INR || "499");
const safePriceInr = Number.isFinite(configuredPrice) && configuredPrice > 0 ? configuredPrice : 499;

export const COURSE_BASE_PRICE_PAISE = Math.round(safePriceInr * 100);
export const COURSE_GST_PERCENT = 18;
export const COURSE_GST_PAISE = Math.round((COURSE_BASE_PRICE_PAISE * COURSE_GST_PERCENT) / 100);
export const COURSE_TOTAL_PAISE = COURSE_BASE_PRICE_PAISE + COURSE_GST_PAISE;

export function paiseToRupees(paise: number) {
  return (paise / 100).toFixed(2);
}

export function formatINRFromPaise(paise: number, showPaise = false) {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showPaise ? 2 : Number.isInteger(rupees) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}
