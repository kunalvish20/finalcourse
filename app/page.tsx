import Image from "next/image";
import BuyButton from "@/components/BuyButton";
import Navbar from "@/components/Navbar";
import VideoFrame from "@/components/VideoFrame";
import { defaultVideoUrl, modules, siteConfig } from "@/lib/site";
import { formatCompactNumber, getYouTubeChannels, type YouTubeChannel } from "@/lib/youtube/getChannels";

const heroGridCells = Array.from({ length: 14 });

export const revalidate = 21600;

function MetricIcon({ type }: { type: "youtube" | "play" | "views" }) {
  if (type === "youtube") {
    return (
      <span className="channelMetricIcon channelMetricIcon-youtube" aria-hidden="true">
        <svg viewBox="0 0 28 20" focusable="false">
          <path d="M27.4 3.1A3.5 3.5 0 0 0 25 .6C22.9 0 14 0 14 0S5.1 0 3 .6A3.5 3.5 0 0 0 .6 3.1 36.3 36.3 0 0 0 0 10c0 2.3.2 4.6.6 6.9A3.5 3.5 0 0 0 3 19.4c2.1.6 11 .6 11 .6s8.9 0 11-.6a3.5 3.5 0 0 0 2.4-2.5c.4-2.3.6-4.6.6-6.9 0-2.3-.2-4.6-.6-6.9Z" />
          <path d="M11.2 14.3V5.7L18.5 10l-7.3 4.3Z" />
        </svg>
      </span>
    );
  }

  if (type === "views") {
    return (
      <span className="channelMetricIcon channelMetricIcon-views" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M2.2 12s3.6-6 9.8-6 9.8 6 9.8 6-3.6 6-9.8 6-9.8-6-9.8-6Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </span>
    );
  }

  return (
    <span className="channelMetricIcon channelMetricIcon-play" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <circle cx="12" cy="12" r="10" />
        <path d="M10 7.8v8.4l6.6-4.2L10 7.8Z" />
      </svg>
    </span>
  );
}

function ChannelAvatar({ channel }: { channel: YouTubeChannel }) {
  if (!channel.avatarUrl) {
    return (
      <span className="channelAvatarFallback" aria-hidden="true">
        {channel.title.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={channel.avatarUrl}
      alt={`${channel.title} avatar`}
      width={64}
      height={64}
      className="channelAvatar"
    />
  );
}

function ChannelMetric({
  icon,
  value,
  label,
  ariaLabel,
}: {
  icon: "youtube" | "play" | "views";
  value: string;
  label: string;
  ariaLabel?: string;
}) {
  return (
    <div className="channelMetric" aria-label={ariaLabel || `${value} ${label}`}>
      <MetricIcon type={icon} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ChannelCard({ channel, index }: { channel: YouTubeChannel; index: number }) {
  const subscriberValue = channel.subscriberCount === null ? "Hidden" : formatCompactNumber(channel.subscriberCount);

  return (
    <article className="channelCard">
      <div className="channelIdentityRow">
        <span className="channelIndex">{String(index + 1).padStart(2, "0")}</span>
        <ChannelAvatar channel={channel} />
        <div className="channelIdentity">
          <h3>{channel.title}</h3>
          {channel.handle ? <p>{channel.handle}</p> : null}
        </div>
      </div>

      <div className="channelMetrics" aria-label={`${channel.title} YouTube statistics`}>
        <ChannelMetric
          icon="youtube"
          value={subscriberValue}
          label={channel.subscriberCount === null ? "Subscribers hidden" : "Subscribers"}
          ariaLabel={channel.subscriberCount === null ? "Subscribers hidden" : `${subscriberValue} subscribers`}
        />
        <ChannelMetric icon="play" value={formatCompactNumber(channel.videoCount)} label="Videos" />
        <ChannelMetric icon="views" value={formatCompactNumber(channel.viewCount)} label="Views" />
      </div>

      <a
        className="channelCta"
        href={channel.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${channel.title} on YouTube`}
      >
        View Channel <span aria-hidden="true">&#8599;</span>
      </a>
    </article>
  );
}

function CreatorNetworkPanel({ channels }: { channels: YouTubeChannel[] }) {
  return (
    <div className="channelShowcase" data-reveal="right">
      <div className="channelShowcaseTop">
        <div>
          <span>LIVE CREATOR NETWORK</span>
          <small>FROM YOUTUBE</small>
        </div>
        <div className="liveDataBadge"><i aria-hidden="true" /> LIVE DATA</div>
      </div>

      {channels.length > 0 ? (
        <div className="channelGrid" data-stagger="">
          {channels.map((channel, index) => (
            <ChannelCard channel={channel} index={index} key={channel.id} />
          ))}
        </div>
      ) : (
        <div className="channelUnavailable" role="status">
          Channel stats are temporarily unavailable.
        </div>
      )}

      
    </div>
  );
}

export default async function Home() {
  const channels = await getYouTubeChannels();

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
              <span className="heroEdition">2026 EDITION &middot; 9 MODULES</span>
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
            <div className="sectionNo">01 &mdash; YOUR MENTOR</div>
            <h2>LEARN FROM<br />INDIA&apos;S ONE OF <br /><em> THE BIGGEST<br />GAMER</em></h2>
            <p className="mentorLead">
              You&apos;re not just learning from someone who talks about YouTube.
              You&apos;re learning from a creator operating multiple real channels &mdash;
              building content, audiences and systems every day.
            </p>
            <BuyButton label="LEARN THE SYSTEM" />
          </div>

          <CreatorNetworkPanel channels={channels} />
        </div>
      </section>
      <section id="modules" className="section modulesSection">
        <div className="moduleGlow" data-parallax="6" aria-hidden="true" />
        <div className="container">
          <div className="modulesHeading" data-reveal="">
            <div>
              <div className="sectionNo">02 — COURSE MODULES</div>
              <h2>How to REALLY  <br />Grow a <br /> <em>Gaming Channel</em></h2>
            </div>
            <p>Nine simple modules. Short, practical lessons for mobile gaming, PC gaming, thumbnails, reach, monetization and more views.</p>
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
            <span>9 MODULES &middot; ACTION-FIRST CURRICULUM</span>
            <BuyButton label="UNLOCK ALL MODULES" />
          </div>
        </div>
      </section>

      <section className="section priceSection">
        <div className="priceGlow" data-parallax="5" aria-hidden="true" />
        <div className="container priceCard" data-reveal="">
          <div className="priceCopy">
            <div className="sectionNo">03 — INSTANT ACCESS</div>
            <h2>BUILD YOUR GAMING<br /><em>CARRER NOW</em></h2>
            <p>Get the complete {siteConfig.courseName}, future lesson updates, and immediate access after successful server-side payment verification.</p>
            <div className="priceProof">
              <span>&#10003; One-time payment</span>
              <span>&#10003; 9 complete modules</span>
              <span>&#10003; 2 master ways to get views</span>
              <span>&#10003; Lifetime account access</span>
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
            <div className="sectionNo">04 — FAQ</div>
            <h2>QUESTIONS.<br /><em>ANSWERED.</em></h2>
            <p>Course access, live YouTube proof, modules and payment answers in one place.</p>
          </div>
          <div className="faqList" data-stagger="">
            <details open><summary><span>01</span>What is inside the course?</summary><p>You get 9 focused modules: creator journey, mobile growth, PC growth, resources, titles, descriptions, thumbnails, monetization and two view-growth methods.</p></details>
            <details><summary><span>02</span>Are the channel stats real?</summary><p>Dattrax Gaming operates 6 active YouTube channels, building a strong and growing presence across the gaming community.
Each channel consistently reaches viewers through engaging gaming content, regular uploads, and an expanding audience.</p></details>
            <details><summary><span>03</span>How do I get access?</summary><p>Continue with Google to create your account and complete your payment securely.
Once confirmed, you’ll get lifetime access to the complete course.</p></details>
            <details><summary><span>04</span>Is this a subscription?</summary><p>No. This is a one-time course purchase. Your verified access stays linked to the Google account used at checkout.</p></details>
            <details><summary><span>05</span>Can I watch on mobile?</summary><p>Yes. The website, checkout and protected course area are designed for desktop, tablet and mobile screens.</p></details>
          </div>
        </div>
      </section>

      <section className="finalCta">
        <div className="finalOrb" data-parallax="6" aria-hidden="true" />
        <div className="container" data-reveal="">
          <span>READY WHEN YOU ARE.</span>
          <h2>STOP POSTING BLIND.<br /><em>START BUILDING.</em></h2>
          <p>One operating system. Nine modules. A better way to build your gaming channel.</p>
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
