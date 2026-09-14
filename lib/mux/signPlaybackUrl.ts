import "server-only";
import { createSign } from "crypto";

type MuxAudience = "v" | "t" | "s";

const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60 * 12;

function base64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function getMuxPrivateKey() {
  const rawKey = process.env.MUX_PRIVATE_KEY || "";
  const normalized = rawKey.trim().replace(/^"|"$/g, "").replace(/\\n/g, "\n");

  if (normalized.includes("BEGIN")) return normalized;

  try {
    const decoded = Buffer.from(normalized, "base64").toString("utf8").trim();
    return decoded.includes("BEGIN") ? decoded : normalized;
  } catch {
    return normalized;
  }
}

function getPlaybackId(url: URL) {
  if (url.hostname !== "player.mux.com" && url.hostname !== "stream.mux.com") {
    return null;
  }

  const firstPathPart = url.pathname.split("/").filter(Boolean)[0];
  return firstPathPart?.replace(/\.m3u8$/, "") || null;
}

function signMuxToken(playbackId: string, audience: MuxAudience, ttlSeconds = DEFAULT_TOKEN_TTL_SECONDS) {
  const keyId = process.env.MUX_SIGNING_KEY_ID;
  const privateKey = getMuxPrivateKey();

  if (!keyId || !privateKey) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: keyId,
  };
  const payload = {
    sub: playbackId,
    aud: audience,
    exp: now + ttlSeconds,
  };

  try {
    const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
    const signer = createSign("RSA-SHA256");
    signer.update(unsignedToken);
    signer.end();

    return `${unsignedToken}.${base64Url(signer.sign(privateKey))}`;
  } catch (error) {
    console.error("Mux playback token signing failed.", error instanceof Error ? error.message : "Unknown error");
    return null;
  }
}

export function signMuxPlayerUrl(rawUrl: string) {
  if (!rawUrl) return rawUrl;

  try {
    const originalUrl = new URL(rawUrl);
    const playbackId = getPlaybackId(originalUrl);

    if (!playbackId) return rawUrl;

    const playbackToken = signMuxToken(playbackId, "v");
    const thumbnailToken = signMuxToken(playbackId, "t");
    const storyboardToken = signMuxToken(playbackId, "s");

    if (!playbackToken) {
      console.error("Mux signing is not configured. Add MUX_SIGNING_KEY_ID and MUX_PRIVATE_KEY.");
      return rawUrl;
    }

    const signedUrl = new URL(`https://player.mux.com/${playbackId}`);

    originalUrl.searchParams.forEach((value, key) => {
      if (!["token", "playback-token", "thumbnail-token", "storyboard-token"].includes(key)) {
        signedUrl.searchParams.set(key, value);
      }
    });

    signedUrl.searchParams.set("playback-token", playbackToken);
    if (thumbnailToken) signedUrl.searchParams.set("thumbnail-token", thumbnailToken);
    if (storyboardToken) signedUrl.searchParams.set("storyboard-token", storyboardToken);

    return signedUrl.toString();
  } catch {
    return rawUrl;
  }
}
