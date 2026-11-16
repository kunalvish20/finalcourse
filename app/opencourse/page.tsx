import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import VideoFrame from "@/components/VideoFrame";
import SignOutButton from "@/components/SignOutButton";
import { getCurrentUser, hasLifetimeCourseAccess } from "@/lib/auth";
import { signMuxPlayerUrl } from "@/lib/mux/signPlaybackUrl";
import { modules, siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const lessonUrls = [
  process.env.COURSE_VIDEO_1_URL || "",
  process.env.COURSE_VIDEO_2_URL || "",
  process.env.COURSE_VIDEO_3_URL || "",
  process.env.COURSE_VIDEO_4_URL || "",
  process.env.COURSE_VIDEO_5_URL || "",
  process.env.COURSE_VIDEO_6_URL || "",
  process.env.COURSE_VIDEO_7_URL || "",
  process.env.COURSE_VIDEO_8_URL || "",
  process.env.COURSE_VIDEO_9_URL || "",
];

export const metadata: Metadata = {
  title: `Course | ${siteConfig.courseName}`,
  robots: { index: false, follow: false, nocache: true },
};

function LockedCourse() {
  return <main className="lockedPage"><div className="lockedCard" data-reveal=""><div className="lockBadge">PAID ACCESS ONLY</div><div className="lockIcon" aria-hidden="true">LOCK</div><span className="sectionNo">PROTECTED COURSE AREA</span><h1>THIS CONTENT IS <em>LOCKED.</em></h1><p>This Google account does not have a verified paid lifetime entitlement for this course.</p><Link className="buyButton" href="/buy"><span>UNLOCK THE COURSE</span><span>-&gt;</span></Link><Link className="backHome" href="/">Back to website</Link></div></main>;
}

export default async function OpenCoursePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/opencourse");
  if (!(await hasLifetimeCourseAccess(user.id))) return <LockedCourse />;

  const courseVideos = modules.map(([number, title, description], index) => ({
    number,
    title,
    description,
    url: signMuxPlayerUrl(lessonUrls[index] || ""),
    duration: `MODULE ${number}`,
  }));
  const gtaMasterUrl =
    process.env.COURSE_GTA_MASTER_VIDEO_URL ||
    "https://player.mux.com/moGwbIVjvj77g6TZIzd4n01AzlX0001Dexvt1SBgpSijnA";

  return <main className="coursePage">
    <header className="courseNav container"><Link href="/" className="logo"><img src="/Logo_dattrax.jpg" alt="Dattrax" className="logoImg" /><span>DATTRAX GAMING</span></Link><div className="courseAccount"><span><i className="accessDot" /> LIFETIME ACCESS</span><SignOutButton /></div></header>
    <section className="courseHero container" data-reveal=""><div className="sectionNo">WELCOME TO THE COURSE</div><h1>YOUR GAMING CHANNEL<br /><em>GROWTH SYSTEM.</em></h1><p>Your verified purchase is linked to your Google account, so you can log in again later and keep lifetime access.</p><div className="courseAccessMeta"><span>PAYMENT VERIFIED</span><span>LIFETIME ACCOUNT ACCESS</span><span>PRIVATE COURSE AREA</span></div></section>
    <section className="gtaMasterSection container" aria-labelledby="gta-master-title" data-reveal="">
      <div className="gtaMasterHeading"><div><span className="sectionNo">START HERE · MASTER LESSON</span><h2 id="gta-master-title">GTA <em>MASTER VIDEO.</em></h2></div><p>Watch the GTA master video first, then continue with the rest of your course below.</p></div>
      <article className="courseVideoCard gtaMasterCard"><div className="courseVideoCardTop"><span>GTA MASTER VIDEO</span><small>FEATURED LESSON</small></div><div className="courseVideoShell"><div className="videoTopbar"><div className="dots" aria-hidden="true"><i /><i /><i /></div><span>PRIVATE LESSON PLAYER</span><b>VERIFIED</b></div><VideoFrame url={gtaMasterUrl} title="GTA Master Video" locked /></div><div className="courseVideoText"><h3>GTA Master Video</h3><p>Your featured GTA lesson. Start here before moving through the course modules.</p></div></article>
    </section>
    <section className="singleCourse container" aria-labelledby="course-lessons-title" data-reveal=""><div className="singleCourseMeta"><span className="sectionNo">CONTINUE THE COURSE</span><h2 id="course-lessons-title">More Course Videos</h2><p>Continue with the original lessons from {siteConfig.courseName} in order.</p></div><div className="courseVideoList" data-stagger="">{courseVideos.map(video => <article className="courseVideoCard" key={video.number}><div className="courseVideoCardTop"><span>{video.number}</span><small>{video.duration}</small></div><div className="courseVideoShell"><div className="videoTopbar"><div className="dots" aria-hidden="true"><i /><i /><i /></div><span>PRIVATE LESSON PLAYER</span><b>VERIFIED</b></div><VideoFrame url={video.url} title={video.title} locked /></div><div className="courseVideoText"><h3>{video.title}</h3><p>{video.description}</p></div></article>)}</div></section>
    <section className="courseOutline container" aria-label="Course lesson outline" data-stagger=""><article className="courseOutlineItem"><span>START</span><div><h3>GTA Master Video</h3><p>Watch the featured GTA lesson before the original course modules.</p></div></article>{modules.map(([num,title,desc]) => <article className="courseOutlineItem" key={num}><span>{num}</span><div><h3>{title}</h3><p>{desc}</p></div></article>)}</section>
    <section className="courseFooter container" data-reveal=""><div><span className="sectionNo">YOU&apos;VE GOT THE SYSTEM</span><h2>NOW GO & BECOME <em>  A GAMER.</em></h2></div><Link href="/" className="backHome">Back to main website</Link></section>
  </main>;
}
