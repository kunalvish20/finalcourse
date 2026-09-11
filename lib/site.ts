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

export const mentorChannels = Array.from({ length: 6 }, (_, index) => {
  const number = index + 1;
  return {
    number: String(number).padStart(2, "0"),
    name: process.env[`NEXT_PUBLIC_CHANNEL_${number}_NAME`] || `CHANNEL ${String(number).padStart(2, "0")}`,
    url: process.env[`NEXT_PUBLIC_CHANNEL_${number}_URL`] || "",
  };
});

export const modules = [
  ["01", "Channel Positioning", "Pick a gaming niche, viewer promise and content angle that is actually memorable."],
  ["02", "Video Ideas That Click", "Build a repeatable idea system around trends, curiosity, challenges and searchable demand."],
  ["03", "Titles + Thumbnails", "Create packaging that earns the click with curiosity, clarity and strong visual hierarchy."],
  ["04", "Retention Editing", "Structure intros, pacing, pattern interrupts and payoffs to hold viewers longer."],
  ["05", "Upload & Growth System", "Create a weekly operating system for publishing, studying analytics and improving."],
  ["06", "Channel Analytics", "Read the numbers that matter and turn audience behaviour into better next-video decisions."],
  ["07", "Community & Brand Building", "Build repeat viewers, a recognisable creator identity and a community that comes back."],
  ["08", "Monetisation", "Turn attention into income through sponsors, affiliates, products and community."],
] as const;
