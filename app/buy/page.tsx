import Link from "next/link";
import { redirect } from "next/navigation";
import CheckoutButton from "@/components/CheckoutButton";
import SignOutButton from "@/components/SignOutButton";
import { getCurrentProfile, getCurrentUser, hasLifetimeCourseAccess } from "@/lib/auth";
import { COURSE_BASE_PRICE_PAISE, COURSE_GST_PAISE, COURSE_GST_RATE, COURSE_TOTAL_PAISE } from "@/lib/course";
import { modules, siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BuyPage({ searchParams }: { searchParams: Promise<{ payment?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/buy");
  if (await hasLifetimeCourseAccess(user.id)) redirect("/opencourse");

  const profile = await getCurrentProfile(user.id);
  const params = await searchParams;
  const name = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "";
  const email = user.email || profile?.email || "";
  const phone = profile?.phone || "";
  const paymentMessage = params.payment
    ? ({
        failed: "Payment was not completed. You can safely try again.",
        unverified: "Payment could not be verified yet. If money was debited, do not pay again; contact support with your transaction ID.",
        tampered: "Payment response validation failed. Please restart checkout.",
        error: "We could not finish payment verification. If money was debited, do not pay again.",
      } as Record<string, string>)[params.payment]
    : "";

  return (
    <main className="checkoutPage">
      <div className="checkoutNav container">
        <Link href="/" className="logo">
          <img src="/Logo_dattrax.jpg" alt="Dattrax" className="logoImg" />
          <span>DATTRAX GAMING</span>
        </Link>
        <div className="accountMini">
          <span>{email}</span>
          <SignOutButton />
        </div>
      </div>

      <div className="checkoutLayout container">
        <aside className="orderCard" data-reveal="left">
          <span className="orderLabel">PAY FIRST</span>
          <h2>{siteConfig.courseName}</h2>
          <p>Confirm your details and continue to secure PayU checkout.</p>

          {paymentMessage ? <div className="paymentBanner">{paymentMessage}</div> : null}

          <CheckoutButton
            courseName={siteConfig.courseName}
            basePricePaise={COURSE_BASE_PRICE_PAISE}
            gstPaise={COURSE_GST_PAISE}
            originalTotalPaise={COURSE_TOTAL_PAISE}
            gstRate={COURSE_GST_RATE}
            defaultName={name}
            email={email}
            defaultPhone={phone}
          />

          <div className="secureNote">
            Payment details are handled by PayU. Access is granted only after server-side hash and transaction verification.
          </div>
          <div className="checkoutLegal">
            By paying, you agree to our <Link href="/terms">Terms</Link> and acknowledge our <Link href="/privacy">Privacy Policy</Link>.
          </div>
        </aside>

        <section className="checkoutLeft" data-reveal="right" aria-label="Course benefits">
          <div className="eyebrow"><span /> YOUR NEXT LEVEL STARTS HERE</div>
          <h1>YOUR GAMING CHANNEL, BUILT WITH A PLAN.</h1>
          <p>Get lifetime access to a practical creator blueprint. Your course unlocks on this account after PayU verifies your payment.</p>
          <div className="checkoutBenefits">
            {[modules[1], modules[4], modules[6]].map(([number, title]) => (
              <div key={number}><b>{number}</b><span>{title}</span><i aria-hidden="true">↗</i></div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
