"use client";

import { FormEvent, useState } from "react";
import { formatINRFromPaise } from "@/lib/course";

type CouponQuote = {
  code: string;
  originalTotalPaise: number;
  discountPaise: number;
  totalPaise: number;
};

type PayUCreateResponse = {
  completed?: boolean;
  action?: string;
  method?: "POST";
  fields?: Record<string, string>;
  error?: string;
  code?: string;
};

function submitPayUForm(action: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.style.display = "none";

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5A2.5 2.5 0 0 0 5.5 6h13A2.5 2.5 0 0 0 21 8.5v2a1.5 1.5 0 0 0 0 3v2A2.5 2.5 0 0 0 18.5 18h-13A2.5 2.5 0 0 0 3 15.5v-2a1.5 1.5 0 0 0 0-3v-2Z" />
      <path d="M12 7.5v1m0 2v3m0 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}

export default function CheckoutButton({
  courseName,
  basePricePaise,
  gstPaise,
  originalTotalPaise,
  gstRate,
  defaultName,
  email,
  defaultPhone,
}: {
  courseName: string;
  basePricePaise: number;
  gstPaise: number;
  originalTotalPaise: number;
  gstRate: number;
  defaultName: string;
  email: string;
  defaultPhone: string;
}) {
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponQuote | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const totalPaise = coupon?.totalPaise ?? originalTotalPaise;
  const totalLabel = formatINRFromPaise(totalPaise, true);

  async function applyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (couponLoading || coupon || loading) return;
    if (!couponInput.trim()) {
      setCouponError("Enter a coupon code to apply it.");
      return;
    }
    setCouponLoading(true);
    setCouponError("");
    setError("");
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ couponCode: couponInput }),
        cache: "no-store",
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not validate the coupon. Please retry.");
      if (data.code !== "DAX100" || data.originalTotalPaise !== originalTotalPaise || !Number.isInteger(data.discountPaise) || !Number.isInteger(data.totalPaise) || data.totalPaise !== Math.max(0, originalTotalPaise - data.discountPaise)) {
        throw new Error("Course pricing changed. Please refresh checkout and try again.");
      }
      setCoupon(data as CouponQuote);
      setCouponInput("DAX100");
    } catch (err) {
      setCouponError(err instanceof Error && err.name === "AbortError" ? "Coupon check took too long. Please retry." : err instanceof Error ? err.message : "Could not validate the coupon. Please retry.");
    } finally {
      window.clearTimeout(timeoutId);
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    if (loading) return;
    setCoupon(null);
    setCouponInput("");
    setCouponError("");
    setError("");
  }

  async function startCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || couponLoading) return;
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      firstname: String(formData.get("firstname") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      couponCode: coupon?.code,
    };
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch("/api/payu/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({})) as PayUCreateResponse;
      if (response.ok && data.completed && totalPaise === 0) {
        window.location.assign("/thank-you");
        return;
      }
      if (!response.ok || !data.action || !data.fields) {
        throw new Error(`${data.error || "Could not create the PayU checkout request."}${data.code ? ` Reference: ${data.code}.` : ""}`);
      }
      if (data.fields.amount !== (totalPaise / 100).toFixed(2)) {
        throw new Error("Course pricing changed. Please refresh checkout and try again.");
      }

      submitPayUForm(data.action, data.fields);
    } catch (err) {
      setError(err instanceof Error && err.name === "AbortError" ? "Checkout took too long. Please retry." : err instanceof Error ? err.message : "Something went wrong while opening checkout.");
      setLoading(false);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  return (
    <>
      <div className="checkoutPriceBreakdown" aria-label="Course price and tax">
        <span>Course price <strong>{formatINRFromPaise(basePricePaise, true)}</strong></span>
        <span>GST ({Math.round(gstRate * 100)}%) <strong>{formatINRFromPaise(gstPaise, true)}</strong></span>
      </div>

      <div className={`couponBox${coupon ? " couponBoxApplied" : ""}`}>
        {coupon ? (
          <div className="couponAppliedState" role="status" aria-live="polite">
            <span className="couponCheck"><CheckIcon /></span>
            <div className="couponAppliedText"><strong>{coupon.code} applied</strong><span>You saved {formatINRFromPaise(coupon.discountPaise)}!</span></div>
            <button type="button" className="couponRemove" onClick={removeCoupon} disabled={loading}>Remove</button>
            <span className="couponFloat" aria-hidden="true">{formatINRFromPaise(coupon.discountPaise)} OFF Applied!</span>
            <span className="couponSparkles" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
          </div>
        ) : (
          <>
            <div className="couponHeading">
              <span className="couponTicket"><TicketIcon /></span>
              <div><strong>Have a coupon?</strong><span>Apply your code below</span></div>
            </div>
            <form className="couponForm" onSubmit={applyCoupon}>
              <label className="couponInputWrap">
                <span className="srOnly">Coupon code</span>
                <input value={couponInput} onChange={event => { setCouponInput(event.target.value); setCouponError(""); }} placeholder="Enter coupon code" autoComplete="off" maxLength={32} disabled={couponLoading || loading} aria-invalid={!!couponError} aria-describedby={couponError ? "coupon-error" : undefined} />
              </label>
              <button type="submit" disabled={couponLoading || loading}>{couponLoading ? "CHECKING…" : "APPLY"}</button>
            </form>
          </>
        )}
        {couponError ? <p id="coupon-error" className="couponError" role="alert">{couponError}</p> : null}
      </div>

      <div className={`orderSummary${coupon ? " orderSummaryApplied" : ""}`} aria-live="polite">
        <div className="orderLine orderOriginal">
          <span>Original course price</span>
          <span className={coupon ? "orderOldPrice" : ""}>{formatINRFromPaise(originalTotalPaise, true)}</span>
        </div>
        {coupon ? <div className="orderLine orderDiscount"><span>Coupon discount ({coupon.code})</span><strong>−{formatINRFromPaise(coupon.discountPaise, true)}</strong></div> : null}
        <div className="orderTotal">
          <span>Final payable amount</span>
          <strong key={totalPaise}>{totalLabel}</strong>
        </div>
      </div>

      <form
        id="course-checkout-form"
        className="checkoutCustomerForm"
        onSubmit={startCheckout}
        onInvalidCapture={event => {
          const field = event.target as HTMLInputElement;
          setError(field.name === "phone" ? "Enter a valid 10-digit phone number." : "Enter your full name.");
        }}
        onInputCapture={() => { if (error) setError(""); }}
      >
        <label>
          <span>Full name</span>
          <input name="firstname" type="text" defaultValue={defaultName} placeholder="Your name" autoComplete="name" minLength={2} maxLength={60} required />
        </label>
        <label>
          <span>Phone number</span>
          <input name="phone" type="tel" inputMode="numeric" defaultValue={defaultPhone} placeholder="98765 43210" autoComplete="tel" minLength={10} maxLength={18} required />
        </label>
        <p className="checkoutAccountNote">Course access for <strong>{email}</strong></p>
        <button className="checkoutButton" disabled={loading || couponLoading} type="submit" aria-label={totalPaise === 0 ? `Unlock ${courseName} with coupon` : `Pay ${totalLabel} securely for ${courseName}`}>
          {loading ? "COMPLETING CHECKOUT..." : totalPaise === 0 ? "UNLOCK COURSE FOR FREE →" : `PAY ${totalLabel} SECURELY →`}
        </button>
        {error ? <p className="checkoutError" role="alert">{error}</p> : null}
      </form>
      <div className="mobileCheckoutBar" aria-live="polite">
        {error ? <p className="mobileCheckoutError">{error}</p> : null}
        <span>PAYABLE <strong>{totalLabel}</strong></span>
        <button type="submit" form="course-checkout-form" disabled={loading || couponLoading} aria-label={totalPaise === 0 ? `Unlock ${courseName} with coupon` : `Pay ${totalLabel} securely for ${courseName}`}>
          {loading ? "PLEASE WAIT…" : totalPaise === 0 ? "UNLOCK NOW →" : "PAY SECURELY →"}
        </button>
      </div>
    </>
  );
}
