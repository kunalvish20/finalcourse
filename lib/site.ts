import { COURSE_BASE_PRICE_PAISE, formatINRFromPaise } from "@/lib/course";

export const defaultVideoUrl = "";

export const siteConfig = {
  creator: process.env.NEXT_PUBLIC_CREATOR_NAME || "YOUR CHANNEL NAME",
  badge: process.env.NEXT_PUBLIC_COURSE_BADGE || "GAMING CREATOR MASTERCLASS",
  titleTop: "TURN YOUR GAMING PASSION",
  titleAccent: "INTO A DREAM JOB.",
  description:
    "Dattrax Gaming reveals powerful gaming secrets, proven strategies, hidden techniques, and practical tips learned through years of experience. If you want to improve your skills, understand gaming better, and grow seriously as a gamer, this course is built for you.",
  courseName: process.env.NEXT_PUBLIC_COURSE_NAME || "YouTube Gaming Blueprint",
  priceLabel: formatINRFromPaise(COURSE_BASE_PRICE_PAISE),
  mrpLabel: process.env.NEXT_PUBLIC_COURSE_MRP || "₹1,999",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@yourdomain.com",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME || "Your Business Name",
  businessAddress: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "",
  guarantee: "Instant access after successful payment verification",
};

export const modules = [
  ["01", "Creator Journey", "Start with the right mindset and setup. Know what to build first and what to avoid."],
  ["02", "Mobile Growth", "Learn mobile gaming content ideas that work. Turn simple gameplay into watchable videos."],
  ["03", "PC Growth", "Build PC gaming videos with stronger hooks. Make your content feel bigger and more professional."],
  ["04", "Best Resources", "Get the tools, sites and assets that save time. Use them to plan, record and improve faster."],
  ["05", "Titles & Description", "Write titles that create curiosity and reach. Build descriptions that support search and clicks."],
  ["06", "Thumbnail Formula", "Use a high-CTR thumbnail structure. Make viewers understand the video in one quick look."],
  ["07", "Fast Monetization", "Learn the monetization path and basic setup. See what to prepare so your channel can earn sooner."],
  ["08", "Views Trick #1", "Use the first master method to find better video angles. Make uploads easier to discover."],
  ["09", "Views Trick #2", "Use the second master method to push more views. Repeat the process for future videos."],
] as const;
