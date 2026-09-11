import crypto from "node:crypto";
import {
  COURSE_SLUG,
  COURSE_TOTAL_PAISE,
  paiseToRupees,
} from "@/lib/course";

export const PAYU_PRODUCT_INFO = COURSE_SLUG;

type PayUEnv = "test" | "live";

export type PayUCustomer = {
  firstname: string;
  email: string;
  phone: string;
};

export type PayUFormFields = {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1: string;
  udf2: string;
  udf3: string;
  udf4: string;
  udf5: string;
  hash: string;
};

export type PayUResponseParams = Record<string, string>;

export type PayUVerifiedPayment = {
  txnid: string;
  mihpayid: string;
  amount: string;
  amountPaise: number;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  status: string;
  unmappedstatus: string;
  error: string;
  errorMessage: string;
  raw: Record<string, unknown>;
};

function sha512(value: string) {
  return crypto.createHash("sha512").update(value).digest("hex");
}

function timingSafeEqualText(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function getPayUCredentials() {
  const key = process.env.PAYU_KEY?.trim();
  const salt = process.env.PAYU_SALT?.trim();
  if (!key || !salt) throw new Error("PAYU_KEY and PAYU_SALT must be configured.");
  return { key, salt };
}

function getPayUEnv(): PayUEnv {
  return process.env.PAYU_ENV?.toLowerCase() === "live" ? "live" : "test";
}

export function getPayUEndpoints() {
  return getPayUEnv() === "live"
    ? {
        checkout: "https://secure.payu.in/_payment",
        verify: "https://info.payu.in/merchant/postservice.php?form=2",
      }
    : {
        checkout: "https://test.payu.in/_payment",
        verify: "https://test.payu.in/merchant/postservice.php?form=2",
      };
}

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) throw new Error("NEXT_PUBLIC_SITE_URL must be configured.");
  return new URL(raw).origin;
}

export function getPayUCallbackUrl() {
  return `${getSiteUrl()}/api/payu/callback`;
}

export function createPayUTxnId() {
  return `YTC_${Date.now()}_${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}

export function createPayURequestHash(fields: Omit<PayUFormFields, "hash">) {
  const { salt } = getPayUCredentials();
  return sha512([
    fields.key,
    fields.txnid,
    fields.amount,
    fields.productinfo,
    fields.firstname,
    fields.email,
    fields.udf1,
    fields.udf2,
    fields.udf3,
    fields.udf4,
    fields.udf5,
    "",
    "",
    "",
    "",
    "",
    salt,
  ].join("|"));
}

export function createPayUCheckoutFields(input: {
  txnid: string;
  customer: PayUCustomer;
}) {
  const { key } = getPayUCredentials();
  const fields: Omit<PayUFormFields, "hash"> = {
    key,
    txnid: input.txnid,
    amount: paiseToRupees(COURSE_TOTAL_PAISE),
    productinfo: PAYU_PRODUCT_INFO,
    firstname: input.customer.firstname,
    email: input.customer.email,
    phone: input.customer.phone,
    surl: getPayUCallbackUrl(),
    furl: getPayUCallbackUrl(),
    udf1: COURSE_SLUG,
    udf2: String(COURSE_TOTAL_PAISE),
    udf3: "",
    udf4: "",
    udf5: "",
  };

  return { ...fields, hash: createPayURequestHash(fields) };
}

export function verifyPayUResponseHash(params: PayUResponseParams) {
  const { key, salt } = getPayUCredentials();
  const received = params.hash || "";
  if (!received || params.key !== key) return false;

  const values = [
    salt,
    params.status || "",
    "",
    "",
    "",
    "",
    "",
    params.udf5 || "",
    params.udf4 || "",
    params.udf3 || "",
    params.udf2 || "",
    params.udf1 || "",
    params.email || "",
    params.firstname || "",
    params.productinfo || "",
    params.amount || "",
    params.txnid || "",
    params.key || "",
  ];

  const genericHash = sha512(values.join("|"));
  const additionalCharges = params.additional_charges || params.additionalCharges || "";
  const chargedHash = additionalCharges ? sha512([additionalCharges, ...values].join("|")) : "";

  return timingSafeEqualText(genericHash, received) || (!!chargedHash && timingSafeEqualText(chargedHash, received));
}

function parseAmountPaise(value: unknown) {
  const amount = Number(String(value ?? "0"));
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function normalizePayUPayment(txnid: string, raw: Record<string, unknown>): PayUVerifiedPayment {
  const amount = String(raw.amt ?? raw.amount ?? raw.transaction_amount ?? "0");
  return {
    txnid: String(raw.txnid ?? txnid),
    mihpayid: String(raw.mihpayid ?? raw.payuid ?? ""),
    amount,
    amountPaise: parseAmountPaise(amount),
    productinfo: String(raw.productinfo ?? ""),
    firstname: String(raw.firstname ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? raw.contact ?? ""),
    status: String(raw.status ?? "").toLowerCase(),
    unmappedstatus: String(raw.unmappedstatus ?? "").toLowerCase(),
    error: String(raw.error ?? raw.error_code ?? "").toLowerCase(),
    errorMessage: String(raw.error_Message ?? raw.error_message ?? ""),
    raw,
  };
}

export async function verifyPayUPayment(txnid: string): Promise<PayUVerifiedPayment> {
  if (!txnid.startsWith("YTC_")) throw new Error("Invalid PayU course transaction ID.");

  const { key, salt } = getPayUCredentials();
  const command = "verify_payment";
  const hash = sha512([key, command, txnid, salt].join("|"));
  const body = new URLSearchParams({ key, command, var1: txnid, hash });
  const response = await fetch(getPayUEndpoints().verify, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const text = await response.text();
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error("PayU verification returned an invalid response.");
  }

  if (!response.ok) throw new Error("Could not verify payment with PayU.");

  const transactionDetails = data.transaction_details as Record<string, unknown> | undefined;
  const details = transactionDetails?.[txnid] as Record<string, unknown> | undefined;
  if (!details || String(details.status ?? "").toLowerCase() === "not found") {
    throw new Error("PayU transaction was not found.");
  }

  return normalizePayUPayment(txnid, details);
}

export function payUPaymentMatchesOrder(
  payment: PayUVerifiedPayment,
  expected: { txnid: string; amountPaise: number; email?: string },
) {
  const sameEmail = !expected.email || !payment.email || payment.email.toLowerCase() === expected.email.toLowerCase();
  return (
    payment.txnid === expected.txnid &&
    payment.amountPaise === expected.amountPaise &&
    payment.productinfo === PAYU_PRODUCT_INFO &&
    sameEmail
  );
}

export function payUPaymentIsActiveSuccess(payment: PayUVerifiedPayment) {
  const status = payment.status.toLowerCase();
  const unmappedstatus = payment.unmappedstatus.toLowerCase();
  const error = payment.error.toLowerCase();
  const inactiveStatuses = ["refund", "refunded", "failed", "failure", "dispute", "chargeback", "bounced", "cancelled"];

  if (status !== "success") return false;
  if (inactiveStatuses.some((value) => status.includes(value) || unmappedstatus.includes(value))) return false;
  if (unmappedstatus && !["captured", "success"].includes(unmappedstatus)) return false;
  if (error && !["e000", "0"].includes(error)) return false;
  return true;
}

export type PayURefundVerification = {
  requestId: string;
  mihpayid: string;
  amountPaise: number;
  action: string;
  status: string;
};

export async function verifyPayURefund(requestId: string): Promise<PayURefundVerification> {
  if (!/^\d+$/.test(requestId)) throw new Error("Invalid PayU refund request ID.");
  const { key, salt } = getPayUCredentials();
  const command = "check_action_status";
  const hash = sha512([key, command, requestId, salt].join("|"));
  const body = new URLSearchParams({ key, command, var1: requestId, hash });
  const response = await fetch(getPayUEndpoints().verify, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, cache: "no-store"
  });
  const data = await response.json() as Record<string, unknown>;
  if (!response.ok) throw new Error("Could not verify refund with PayU.");
  const transactionDetails = data.transaction_details as Record<string, unknown> | undefined;
  const outer = transactionDetails?.[requestId] as Record<string, unknown> | undefined;
  const details = (outer?.[requestId] ?? outer) as Record<string, unknown> | undefined;
  if (!details || typeof details !== "object") throw new Error("PayU refund status was not found.");
  return {
    requestId,
    mihpayid: String(details.mihpayid ?? "").trim(),
    amountPaise: parseAmountPaise(details.amt ?? details.amount ?? 0),
    action: String(details.action ?? "").toLowerCase(),
    status: String(details.status ?? "").toLowerCase(),
  };
}

export function normalizeInactiveStatus(payment: PayUVerifiedPayment) {
  const text = `${payment.status} ${payment.unmappedstatus}`.toLowerCase();
  if (text.includes("refund")) return "refunded";
  if (text.includes("chargeback")) return "chargeback";
  if (text.includes("dispute")) return "disputed";
  if (text.includes("cancel")) return "cancelled";
  return "failed";
}
