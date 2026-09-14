function getYouTubeVideoId(url: URL) {
  const hostname = url.hostname.replace(/^www\./, "");

  if (hostname === "youtu.be") {
    return url.pathname.split("/").filter(Boolean)[0] || null;
  }

  if (!hostname.endsWith("youtube.com")) {
    return null;
  }

  if (url.pathname === "/watch") {
    return url.searchParams.get("v");
  }

  const [type, videoId] = url.pathname.split("/").filter(Boolean);
  if (["embed", "shorts", "live"].includes(type)) {
    return videoId || null;
  }

  return null;
}

function getYouTubeStartSeconds(url: URL) {
  const start = url.searchParams.get("start") || url.searchParams.get("t");
  if (!start) return null;

  const simpleSeconds = start.match(/^(\d+)s?$/);
  if (simpleSeconds) return simpleSeconds[1];

  const timeParts = start.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
  if (!timeParts) return null;

  const hours = Number(timeParts[1] || 0);
  const minutes = Number(timeParts[2] || 0);
  const seconds = Number(timeParts[3] || 0);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds > 0 ? String(totalSeconds) : null;
}

function getEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const videoId = getYouTubeVideoId(parsed);

    if (videoId) {
      const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
      const playlist = parsed.searchParams.get("list");
      const start = getYouTubeStartSeconds(parsed);
      const si = parsed.searchParams.get("si");

      if (playlist) embedUrl.searchParams.set("list", playlist);
      if (start) embedUrl.searchParams.set("start", start);
      if (si) embedUrl.searchParams.set("si", si);

      return embedUrl.toString();
    }
  } catch {
    return url;
  }

  return url;
}

export default function VideoFrame({ url, title, locked = false }: { url?: string; title: string; locked?: boolean }) {
  if (!url) {
    return (
      <div className="videoPlaceholder">
        <div className="playIcon">▶</div>
        <strong>{locked ? "Paid lesson video" : "Course trailer"}</strong>
        <span>{locked ? "Add the lesson URL in .env.local" : "Add NEXT_PUBLIC_HERO_VIDEO_URL in .env.local"}</span>
      </div>
    );
  }

  return (
    <div className="videoRatio">
      <iframe
        src={getEmbedUrl(url)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
