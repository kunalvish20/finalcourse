import type { Metadata } from "next";
import Link from "next/link";
import BuyButton from "@/components/BuyButton";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Harvest Dewaangan",
  description:
    "Meet Harvest Dewaangan, the creator behind Dattrax Gaming, and learn about his gaming content, creator journey, and official contact address.",
};

const channels = [
  { label: "Dattrax Plays", href: "https://www.youtube.com/@Dattraxplays" },
  { label: "Dattrax Gaming", href: "https://www.youtube.com/@DattraxGaming" },
  { label: "Dattrax Vlogs", href: "https://www.youtube.com/@DattraxVlogss" },
];

export default function AboutPage() {
  return (
    <main id="top" className="aboutPage siteShell">
      <Navbar />

      <section className="aboutHero" aria-labelledby="about-title">
        <div className="aboutGrid" aria-hidden="true" />
        <div className="aboutGlow aboutGlowOne" data-parallax="8" aria-hidden="true" />
        <div className="aboutGlow aboutGlowTwo" data-parallax="5" aria-hidden="true" />

        <div className="container aboutHeroInner">
          <div className="aboutHeroCopy" data-reveal="">
            <div className="eyebrow"><span /> ABOUT THE CREATOR</div>
            <h1 id="about-title">
              Harvest Dewaangan,
              <em> known as Dattrax Gaming.</em>
            </h1>
            <p>
              Harvest Dewaangan built Dattrax Gaming around the energy that first made gaming feel exciting:
              honest reactions, sharp gameplay instincts, and a creator voice that feels close to the audience.
              His content blends gaming entertainment, practical growth lessons, and a direct, confident style
              that helps viewers feel like they are part of the journey.
            </p>
            <div className="aboutHeroActions">
              <BuyButton label="LEARN FROM DATTRAX" />
              <Link href="#contact" className="aboutGhostButton">CONTACT DETAILS</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section aboutStorySection">
        <div className="container aboutStoryGrid">
          <div className="aboutStoryIntro" data-reveal="left">
            <div className="sectionNo">01 - STORY</div>
            <h2>Built for gamers who want to grow.</h2>
          </div>

          <div className="aboutStoryBody" data-stagger="">
            <article>
              <span>Origin</span>
              <p>
                Harvest started as a gamer who understood the small details viewers notice: timing, thumbnails,
                titles, consistency, and the feeling of watching someone who genuinely enjoys the game.
              </p>
            </article>
            <article>
              <span>Creator Style</span>
              <p>
                Dattrax Gaming carries a bold but approachable personality. The content is focused, fast-moving,
                and made for people who want entertainment with useful creator insight.
              </p>
            </article>
            <article>
              <span>Audience First</span>
              <p>
                Every upload, course lesson, and creator update is shaped around the community: helping new
                gamers understand what works, stay consistent, and build confidence on YouTube.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section aboutBrandSection">
        <div className="container aboutBrandGrid">
          <div className="aboutBrandCard" data-reveal="">
            <div className="aboutBrandTop">
              <div className="aboutBrandMark" aria-hidden="true">YT</div>
              <div>
                <span>ONLINE IDENTITY</span>
                <strong>Dattrax Gaming</strong>
              </div>
            </div>
            <p>
              A creator brand centered on gaming videos, YouTube growth, real creator experience, and a loyal
              audience that follows the Dattrax journey across channels.
            </p>
          </div>

          <div className="aboutSocialPanel" data-reveal="right">
            <div className="sectionNo">02 - SOCIAL / YOUTUBE</div>
            <h2>Follow the Dattrax creator network.</h2>
            <div className="aboutSocialLinks">
              {channels.map((channel) => (
                <a href={channel.href} target="_blank" rel="noopener noreferrer" key={channel.href}>
                  <span aria-hidden="true">YT</span>
                  {channel.label}
                  <b>OPEN</b>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="section aboutContactSection">
        <div className="container aboutContactCard" data-reveal="">
          <div>
            <div className="sectionNo">03 - CONTACT / ADDRESS</div>
            <h2>Official creator contact.</h2>
            <p>
              For support, collaborations, business enquiries, and course-related communication, use the official
              details below.
            </p>
          </div>

          <div className="aboutContactDetails">
            <div>
              <span>Name</span>
              <strong>Harvest Dewangan</strong>
            </div>
            <div>
              <span>Creator Brand</span>
              <strong>Dattrax Gaming</strong>
            </div>
            <div>
              <span>Email</span>
              <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>
            </div>
            <address>
              <span>Address</span>
              HIG - 11, Ward No. 07, Anwarabhata,<br />
              Anwarabhata, Dakshin Bastar Dantewada,<br />
              Chhattisgarh, 494449, India
            </address>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
