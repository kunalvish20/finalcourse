import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, hasLifetimeCourseAccess } from "@/lib/auth";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: `Purchase complete | ${siteConfig.courseName}`,
  robots: { index: false, follow: false, nocache: true },
};

export default async function ThankYouPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/thank-you");
  if (!(await hasLifetimeCourseAccess(user.id))) redirect("/buy?payment=unverified");

  return (
    <main className="lockedPage thankYouPage">
      <div className="lockedCard">
        <div className="lockBadge thankYouBadge">PURCHASE COMPLETE</div>
        <div className="lockIcon thankYouIcon" aria-hidden="true">✓</div>
        <span className="sectionNo">LIFETIME ACCESS UNLOCKED</span>
        <h1>YOU&apos;RE IN. <em>LET&apos;S BEGIN.</em></h1>
        <p>Thank you for joining {siteConfig.courseName}. Your course access is ready on this account.</p>
        <Link className="buyButton" href="/opencourse"><span>OPEN YOUR COURSE</span><span aria-hidden="true">→</span></Link>
        <Link className="backHome" href="/">Back to website</Link>
      </div>
    </main>
  );
}
