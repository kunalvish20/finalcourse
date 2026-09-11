import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="LEGAL — 02" title="PRIVACY POLICY">
      <p><strong>Last updated:</strong> September 12, 2026</p>

      <h2>1. Who operates this website</h2>
      <p>This course website is operated by {siteConfig.legalName}. Questions about this policy can be sent to <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.</p>

      <h2>2. Information we collect</h2>
      <p>When you sign in or purchase the course, we may process your name, Google account email, profile image, phone number, account identifier, payment transaction identifiers, payment status, course entitlement status, and support communications.</p>

      <h2>3. Google sign-in and Supabase</h2>
      <p>Google is used to authenticate your identity and Supabase is used to maintain your account session, profile, payment-order records, and lifetime course entitlement. We do not receive your Google password.</p>

      <h2>4. Payments</h2>
      <p>Payments are processed through PayU. Sensitive payment credentials such as your full card details, UPI PIN, banking password, or CVV are handled by the payment provider and are not intentionally stored by this website. We receive only the payment information needed to create, verify, reconcile, and support your course purchase.</p>

      <h2>5. How we use information</h2>
      <p>We use information to authenticate users, create checkout orders, verify payments, provide and restore course access, prevent fraud and duplicate entitlements, respond to support requests, maintain security, and operate or improve the course service.</p>

      <h2>6. Cookies and session storage</h2>
      <p>Necessary authentication cookies may be used to keep you signed in securely. These cookies support account authentication and protected course access. We may also use essential technical storage required for normal website operation.</p>

      <h2>7. Sharing and service providers</h2>
      <p>Information may be processed by service providers required to operate the website, including Google for authentication, Supabase for authentication and database services, PayU for payment processing, and the hosting infrastructure used to deliver the website. We do not sell your personal information.</p>

      <h2>8. Data retention</h2>
      <p>Account, payment-verification and entitlement records may be retained for as long as reasonably necessary to provide lifetime course access, maintain transaction records, resolve disputes, comply with legal or accounting obligations, and protect the service from abuse.</p>

      <h2>9. Security</h2>
      <p>We use reasonable technical and organisational safeguards, including server-side payment verification, protected server credentials, authenticated database access, and row-level security where applicable. No internet service can guarantee absolute security.</p>

      <h2>10. Your choices</h2>
      <p>You may contact us to ask about the personal information associated with your course account or to request correction of inaccurate profile information. Some transaction records may need to be retained for legitimate legal, accounting, fraud-prevention, or entitlement purposes.</p>

      <h2>11. Children</h2>
      <p>If you are not legally able to enter into a purchase in your jurisdiction, use the website only with the involvement and permission of a parent or legal guardian.</p>

      <h2>12. External services and links</h2>
      <p>The website may link to YouTube and other third-party services. Their handling of personal information is governed by their own terms and privacy policies.</p>

      <h2>13. Policy changes</h2>
      <p>We may update this policy when the website, payment flow, legal requirements, or service providers change. The current version will be published on this page with an updated date.</p>
    </LegalPage>
  );
}
