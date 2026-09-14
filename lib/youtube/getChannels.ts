import "server-only";

export type YouTubeChannel = {
  id: string;
  title: string;
  handle: string | null;
  description: string;
  avatarUrl: string | null;
  subscriberCount: number | null;
  videoCount: number;
  viewCount: number;
  url: string;
};

type YouTubeThumbnail = {
  url?: string;
};

type YouTubeApiChannel = {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
    customUrl?: string;
    thumbnails?: {
      high?: YouTubeThumbnail;
      medium?: YouTubeThumbnail;
      default?: YouTubeThumbnail;
    };
  };
  statistics?: {
    subscriberCount?: string;
    videoCount?: string;
    viewCount?: string;
    hiddenSubscriberCount?: boolean;
  };
};

type YouTubeChannelsResponse = {
  items?: YouTubeApiChannel[];
};

const YOUTUBE_CHANNELS_ENDPOINT = "https://www.googleapis.com/youtube/v3/channels";
const SIX_HOURS_IN_SECONDS = 21600;

function getConfiguredChannelIds() {
  return (process.env.YOUTUBE_CHANNEL_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function parseCount(value: string | undefined) {
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeHandle(customUrl: string | undefined) {
  if (!customUrl) return null;

  const normalized = customUrl.trim();
  if (!normalized) return null;

  return normalized.startsWith("@") ? normalized : `@${normalized}`;
}

function getAvatarUrl(channel: YouTubeApiChannel) {
  return (
    channel.snippet?.thumbnails?.high?.url ||
    channel.snippet?.thumbnails?.medium?.url ||
    channel.snippet?.thumbnails?.default?.url ||
    null
  );
}

function toYouTubeChannel(channel: YouTubeApiChannel): YouTubeChannel | null {
  if (!channel.id || !channel.snippet?.title) return null;

  const statistics = channel.statistics;
  const subscriberCount = statistics?.hiddenSubscriberCount ? null : parseCount(statistics?.subscriberCount);

  return {
    id: channel.id,
    title: channel.snippet.title,
    handle: normalizeHandle(channel.snippet.customUrl),
    description: channel.snippet.description || "",
    avatarUrl: getAvatarUrl(channel),
    subscriberCount,
    videoCount: parseCount(statistics?.videoCount) ?? 0,
    viewCount: parseCount(statistics?.viewCount) ?? 0,
    url: `https://www.youtube.com/channel/${channel.id}`,
  };
}

export function formatCompactNumber(value: number) {
  const absValue = Math.abs(value);
  const units = [
    { value: 1_000_000_000, suffix: "B" },
    { value: 1_000_000, suffix: "M" },
    { value: 1_000, suffix: "K" },
  ] as const;

  const unit = units.find((item) => absValue >= item.value);
  if (!unit) return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

  const scaled = value / unit.value;
  const absScaled = Math.abs(scaled);
  const fractionDigits = absScaled < 10 ? 2 : absScaled < 100 ? 1 : 0;
  const formatted = scaled
    .toFixed(fractionDigits)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*[1-9])0+$/, "$1");

  return `${formatted}${unit.suffix}`;
}

export async function getYouTubeChannels(): Promise<YouTubeChannel[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelIds = getConfiguredChannelIds();

  if (!apiKey || channelIds.length === 0) {
    return [];
  }

  const url = new URL(YOUTUBE_CHANNELS_ENDPOINT);
  url.searchParams.set("part", "snippet,statistics");
  url.searchParams.set("id", channelIds.join(","));
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url, {
      next: {
        revalidate: SIX_HOURS_IN_SECONDS,
      },
    });

    if (!response.ok) {
      console.error(`YouTube channels request failed with status ${response.status}.`);
      return [];
    }

    const data = (await response.json()) as YouTubeChannelsResponse;
    const channelsById = new Map<string, YouTubeChannel>();

    for (const item of data.items || []) {
      const channel = toYouTubeChannel(item);
      if (channel) channelsById.set(channel.id, channel);
    }

    return channelIds.flatMap((id) => {
      const channel = channelsById.get(id);
      return channel ? [channel] : [];
    });
  } catch (error) {
    console.error("YouTube channels request failed.", error instanceof Error ? error.message : "Unknown error");
    return [];
  }
}
