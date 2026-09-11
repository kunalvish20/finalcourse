import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Contact & Support" };

export default function ContactPage() {
  return (
    <LegalPage eyebrow="SUPPORT — 01" title="CONTACT & SUPPORT">
      <h2>Course, login and payment support</h2>
      <p>If you need help with Google login, checkout, a verified payment, or accessing your course, email <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>. Please contact us from the same email address used for your course account whenever possible.</p>

      <h2>What to include</h2>
      <p>Send your full name, account email, phone number used at checkout, and PayU transaction ID if the issue is payment-related. A screenshot of the visible error can help us diagnose the problem faster.</p>

      <h2>Account access issues</h2>
      <p>If you have already paid, do not create a second payment just because the course is not visible immediately. Contact support first so the existing transaction and Supabase entitlement can be checked.</p>

      <h2>Security</h2>
      <p>Never send us your OTP, UPI PIN, CVV, card PIN, card password, banking password, Google password, or any other authentication secret. We will never ask for these credentials.</p>

      <h2>Business enquiries</h2>
      <p>For partnerships, creator collaborations, or other business enquiries, use <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>{siteConfig.supportPhone ? <> or contact <a href={`tel:${siteConfig.supportPhone}`}>{siteConfig.supportPhone}</a></> : null}.</p>

      <h2>Business information</h2>
      <p>{siteConfig.legalName}{siteConfig.businessAddress ? <><br />{siteConfig.businessAddress}</> : null}</p>
    </LegalPage>
  );
}
