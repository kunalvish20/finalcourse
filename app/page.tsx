import BuyButton from "@/components/BuyButton";
import Navbar from "@/components/Navbar";
import VideoFrame from "@/components/VideoFrame";
import { defaultVideoUrl, mentorChannels, modules, siteConfig } from "@/lib/site";

const heroGridCells = Array.from({ length: 14 });

export default function Home() {
  return (
    <main id="top" className="siteShell">
      <Navbar />

      <section className="hero" aria-labelledby="hero-title">
        <div className="heroBoxGrid" aria-hidden="true">
          {heroGridCells.map((_, index) => <span key={index} />)}
        </div>
        <div className="heroGlow heroGlowOne" data-parallax="8" aria-hidden="true" />
        <div className="heroGlow heroGlowTwo" data-parallax="5" aria-hidden="true" />

        <div className="container heroInner">
          <div className="heroContent">
            <div className="heroTopline" data-hero-item="">
              <div className="eyebrow"><span /> {siteConfig.badge}</div>
              <span className="heroEdition">2026 EDITION · 8 MODULES</span>
            </div>

            <h1 id="hero-title" data-hero-item="">
              <span>{siteConfig.titleTop}</span>
              <em>{siteConfig.titleAccent}</em>
            </h1>

            <div className="heroBottom" data-hero-item="">
              <p className="heroText">{siteConfig.description}</p>
              <div className="heroActions">
                <BuyButton label={`GET THE COURSE · ${siteConfig.priceLabel}`} />
                <span className="microcopy"><b>Secure PayU checkout.</b> One-time payment. Instant verified access.</span>
              </div>
            </div>
          </div>

          <div className="heroVideoStage">
            <div className="videoAtmosphere" aria-hidden="true" />
            <div className="heroVideoShell" data-hero-video="">
              <div className="videoTopbar">
                <div className="dots" aria-hidden="true"><i /><i /><i /></div>
                <span>COURSE PREVIEW · 02:00</span>
                <b>PLAY</b>
              </div>
              <VideoFrame url={process.env.NEXT_PUBLIC_HERO_VIDEO_URL || defaultVideoUrl} title="Gaming YouTube Course Preview" />
            </div>
            <div className="videoCaption" data-hero-item="">
              <span>SCROLL TO ENTER</span>
              <div className="videoCaptionLine" />
              <span>01 / 05</span>
            </div>
          </div>
        </div>
      </section>

      <section id="learn" className="section mentorSection">
        <div className="mentorGlow" aria-hidden="true" />
        <div className="container mentorLayout">
          <div className="mentorCopy" data-reveal="left">
            <div className="sectionNo">01 — YOUR MENTOR</div>
            <h2>LEARN FROM SOMEONE<br />RUNNING <em>6 CHANNELS.</em></h2>
            <p className="mentorLead">
              You are not learning from someone who only talks about YouTube. You get the operating system of a creator managing six channels at the same time — ideas, packaging, retention, analytics and execution.
            </p>
            <blockquote>
              <strong>What works once can be luck.</strong>
              <span>What keeps working across six channels is a system.</span>
            </blockquote>
            <div className="mentorStats" aria-label="Mentor highlights">
              <div><strong>06</strong><span>CHANNELS RUN IN PARALLEL</span></div>
              <div><strong>01</strong><span>REPEATABLE OPERATING SYSTEM</span></div>
              <div><strong>100%</strong><span>BUILT AROUND REAL EXECUTION</span></div>
            </div>
            <BuyButton label="LEARN THE SYSTEM" />
          </div>

          <div className="channelShowcase" data-reveal="right">
            <div className="channelShowcaseTop">
              <span>LIVE OPERATING PROOF</span>
              <span>YOUTUBE / 06</span>
            </div>
            <div className="channelGrid" data-stagger="">
              {mentorChannels.map((channel) => {
                const content = (
                  <>
                    <div className="channelCardTop"><span>{channel.number}</span><i aria-hidden="true" /></div>
                    <strong>{channel.name}</strong>
                    <span className="channelAction">{channel.url ? "OPEN CHANNEL ↗" : "ADD CHANNEL LINK"}</span>
                  </>
                );
                return channel.url ? (
                  <a className="channelCard" key={channel.number} href={channel.url} target="_blank" rel="noreferrer">{content}</a>
                ) : (
                  <div className="channelCard channelCardPending" key={channel.number}>{content}</div>
                );
              })}
            </div>
            <p className="channelHint">Add your six channel names and URLs in <code>.env.local</code>. The cards become clickable automatically.</p>
          </div>
        </div>
      </section>

      <section id="modules" className="section modulesSection">
        <div className="moduleGlow" data-parallax="6" aria-hidden="true" />
        <div className="container">
          <div className="modulesHeading" data-reveal="">
            <div>
              <div className="sectionNo">02 — COURSE MODULES</div>
              <h2>FROM RANDOM UPLOADS<br />TO A <em>GROWTH ENGINE.</em></h2>
            </div>
            <p>Eight focused modules. No filler. Every lesson is built to give you something concrete to implement on your next upload.</p>
          </div>

          <div className="moduleList" data-stagger="">
            {modules.map(([num, title, desc]) => (
              <article className="moduleRow" key={num}>
                <span className="moduleNo">{num}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
                <span className="moduleArrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>

          <div className="moduleFooter" data-reveal="">
            <span>8 MODULES · ACTION-FIRST CURRICULUM</span>
            <BuyButton label="UNLOCK ALL MODULES" />
          </div>
        </div>
      </section>

      <section className="section audienceSection">
        <div className="container audience">
          <div className="audienceVisual" data-reveal="left">
            <div className="audienceGrid" aria-hidden="true" />
            <img className="audiencePhoto" src="/Harvest.png" alt="Gaming creator in a red studio setup" />
            <div className="crosshair" aria-hidden="true"><span /><span /></div>
            <span className="tag tag1">CREATOR MODE</span>
            <span className="tag tag2">GAMING / YOUTUBE</span>
            <div className="bigNumber" aria-hidden="true">99</div>
            <div className="audienceSignal"><i /> SYSTEM ONLINE</div>
            <p>Uploads get easier when the system behind them gets better.</p>
          </div>

          <div className="audienceCopy" data-reveal="right">
            <div className="sectionNo">03 — WHO THIS IS FOR</div>
            <h2>BUILT FOR PASSIONATE GAMERS<br />WHO WANT TO <em>GO PRO.</em></h2>
            <p className="audienceLead">Not another “go viral” checklist. This is for gamers who are serious about turning passion into a disciplined creator journey.</p>
            <ul data-stagger="">
              <li><b>01</b><span>You already post gaming content but growth feels random.</span></li>
              <li><b>02</b><span>You want stronger video ideas, thumbnails and retention.</span></li>
              <li><b>03</b><span>You want a repeatable workflow instead of chasing hacks.</span></li>
              <li><b>04</b><span>You want to turn a channel into a long-term creator business.</span></li>
            </ul>
            <BuyButton label="START BUILDING" />
          </div>
        </div>
      </section>

      <section className="section priceSection">
        <div className="priceGlow" data-parallax="5" aria-hidden="true" />
        <div className="container priceCard" data-reveal="">
          <div className="priceCopy">
            <div className="sectionNo">04 — INSTANT ACCESS</div>
            <h2>BUILD YOUR NEXT<br /><em>BREAKOUT VIDEO.</em></h2>
            <p>Get the complete {siteConfig.courseName}, future lesson updates, and immediate access after successful server-side payment verification.</p>
            <div className="priceProof">
              <span>✓ One-time payment</span>
              <span>✓ 8 complete modules</span>
              <span>✓ Lifetime account access</span>
            </div>
          </div>

          <div className="priceBox">
            <div className="priceBoxTop">
              <span>COMPLETE COURSE</span>
              <span className="pricePill">INSTANT ACCESS</span>
            </div>
            <div className="priceValue">
              <span className="oldPrice">{siteConfig.mrpLabel}</span>
              <strong>{siteConfig.priceLabel}</strong>
            </div>
            <div className="priceSave"><span>LAUNCH PRICE</span><b>LIMITED ACCESS OFFER</b></div>
            <small>COURSE FEE · GST ADDED SECURELY AT CHECKOUT</small>
            <BuyButton label={`BUY COURSE · ${siteConfig.priceLabel}`} />
            <p>Secure checkout powered by PayU. Access unlocks only after payment verification.</p>
          </div>
        </div>
      </section>

      <section id="faq" className="section faqSection">
        <div className="container faq">
          <div className="faqHeading" data-reveal="left">
            <div className="sectionNo">05 — FAQ</div>
            <h2>QUESTIONS.<br /><em>ANSWERED.</em></h2>
            <p>Everything you need to know before you unlock the course.</p>
          </div>
          <div className="faqList" data-stagger="">
            <details open><summary><span>01</span>How do I get access?</summary><p>Continue with Google, complete the PayU checkout, and the server verifies the payment before lifetime course access is attached to your account.</p></details>
            <details><summary><span>02</span>Is this a subscription?</summary><p>No. This is a one-time course purchase. Your verified access stays linked to the Google account used at checkout.</p></details>
            <details><summary><span>03</span>Can I watch on mobile?</summary><p>Yes. The landing page, login, checkout and protected course area are designed for desktop, tablet and mobile.</p></details>
            <details><summary><span>04</span>Can someone open the course link without paying?</summary><p>No. Protected content requires an authenticated account with a valid lifetime entitlement stored in Supabase.</p></details>
          </div>
        </div>
      </section>

      <section className="finalCta">
        <div className="finalOrb" data-parallax="6" aria-hidden="true" />
        <div className="container" data-reveal="">
          <span>READY WHEN YOU ARE.</span>
          <h2>STOP POSTING BLIND.<br /><em>START BUILDING.</em></h2>
          <p>One operating system. Eight modules. A better way to build your gaming channel.</p>
          <BuyButton label={`GET THE FULL COURSE · ${siteConfig.priceLabel}`} />
        </div>
      </section>

      <footer className="footer container">
        <div className="logo"><img src="/Logo_dattrax.jpg" alt="Dattrax" className="logoImg" /><span>DATTRAX GAMING</span></div>
        <p>© 2026 · {siteConfig.courseName}</p>
        <div className="footerLinks"><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/contact">Contact</a></div>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>

      <div className="mobileSticky"><BuyButton label={`BUY COURSE · ${siteConfig.priceLabel}`} /></div>
    </main>
  );
}
