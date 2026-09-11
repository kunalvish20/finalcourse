import Link from "next/link";
import BuyButton from "./BuyButton";

export default function Navbar() {
  return (
    <header className="navWrap">
      <nav className="nav container">
        <Link href="/" className="logo">
          <img src="/Logo_dattrax.jpg" alt="Dattrax" className="logoImg" />
          <span>DATTRAX GAMING</span>
        </Link>
        <div className="navLinks">
          <Link href="/#learn">Mentor</Link>
          <Link href="/#modules">Modules</Link>
          <Link href="/#faq">FAQ</Link>
        </div>
        <BuyButton label="BUY COURSE" className="navBuy" />
      </nav>
    </header>
  );
}
