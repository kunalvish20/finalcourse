import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="footer container">
      <Link href="/" className="logo">
        <img src="/Logo_dattrax.jpg" alt="Dattrax" className="logoImg" />
        <span>DATTRAX GAMING</span>
      </Link>
      <p>&copy; 2026 - {siteConfig.courseName}</p>
      <div className="footerLinks">
        <Link href="/about">About</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/contact">Contact</Link>
      </div>
      <Link href="/#top">BACK TO TOP</Link>
    </footer>
  );
}
