import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <LegalPage eyebrow="LEGAL — 01" title="TERMS & CONDITIONS">
      <p><strong>Last updated:</strong> September 12, 2026</p>
      <h2>1. Digital course purchase</h2>
      <p>By purchasing {siteConfig.courseName}, you receive a personal, non-transferable right to access the digital course content made available by {siteConfig.legalName}, subject to these terms.</p>
      <h2>2. Account and lifetime access</h2>
      <p>Course access is linked to the authenticated account used for purchase. “Lifetime access” means access for the commercial lifetime of this course offering and service, subject to these terms, platform availability, security controls, and applicable law.</p>
      <h2>3. Payment verification</h2>
      <p>Access is provided only after payment has been successfully verified by the server. Access may be withheld or disabled when a payment is failed, reversed, disputed, fraudulent, refunded by the payment provider, or cannot be verified.</p>
      <h2>4. Personal use only</h2>
      <p>You may not resell, redistribute, publicly upload, copy for redistribution, share paid lesson links, bypass access controls, or provide your account or entitlement to another person.</p>
      <h2>5. Educational information</h2>
      <p>The course is educational material. YouTube growth, views, subscribers, income, monetisation, sponsorships, or other results are not guaranteed. Outcomes depend on your execution, market conditions, audience response, platform changes, and factors outside our control.</p>
      <h2>6. Course updates and availability</h2>
      <p>We may update lessons, curriculum, hosting, playback technology, features, or course structure. Temporary interruptions may occur for maintenance, provider outages, security verification, or technical issues.</p>
      <h2>7. Acceptable use</h2>
      <p>You must not attempt to compromise the website, scrape protected course content, interfere with authentication or payment systems, misuse another user&apos;s account, or use the service for unlawful activity.</p>
      <h2>8. Third-party services</h2>
      <p>Google, Supabase, PayU, YouTube, hosting providers, and other third-party services may be used to operate parts of the experience. Their own terms may also apply to your use of those services.</p>
      <h2>9. Contact</h2>
      <p>Questions about these terms can be sent to <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.</p>
    </LegalPage>
  );
}
