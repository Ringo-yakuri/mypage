import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const PLAYLIST_ITEMS_API = "https://www.googleapis.com/youtube/v3/playlistItems";
const VIDEOS_API = "https://www.googleapis.com/youtube/v3/videos";

const rootDir = process.cwd();
const cacheDir = path.join(rootDir, "data");
const publicCacheDir = path.join(rootDir, "public", "data");
const cachePath = path.join(cacheDir, "youtube-videos.json");
const publicCachePath = path.join(publicCacheDir, "youtube-videos.json");

const fallbackCache = {
  updatedAt: null,
  totalViews: 0,
  videos: [],
};

async function readCache() {
  try {
    const raw = await readFile(cachePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallbackCache;
  }
}

async function loadLocalEnv() {
  const envPath = path.join(rootDir, ".env.local");

  try {
    const raw = await readFile(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Netlify provides environment variables directly, so a missing local file is fine.
  }
}

async function writeCache(cache) {
  const serialized = `${JSON.stringify(cache, null, 2)}\n`;
  await mkdir(cacheDir, { recursive: true });
  await mkdir(publicCacheDir, { recursive: true });
  await writeFile(cachePath, serialized, "utf8");
  await writeFile(publicCachePath, serialized, "utf8");
}

async function fetchViewCounts(videoIds, key) {
  const viewCounts = new Map();
  if (videoIds.length === 0) return viewCounts;

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const params = new URLSearchParams({
      key,
      part: "statistics",
      id: batch.join(","),
    });

    const response = await fetch(`${VIDEOS_API}?${params.toString()}`, { cache: "no-store" });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`videos.list failed: ${response.status} ${response.statusText} ${text}`);
    }

    const data = await response.json();
    for (const item of data.items ?? []) {
      const videoId = item.id;
      if (!videoId) continue;
      const viewCount = Number(item.statistics?.viewCount ?? 0);
      viewCounts.set(videoId, Number.isNaN(viewCount) ? 0 : viewCount);
    }
  }

  return viewCounts;
}

async function fetchPlaylistCache() {
  const key = process.env.YOUTUBE_API_KEY;
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID;
  const maxOverall = Number(process.env.MAX_VIDEOS ?? 100);

  if (!key || !playlistId) {
    throw new Error("Missing YOUTUBE_API_KEY or YOUTUBE_PLAYLIST_ID");
  }

  const results = [];
  let pageToken = undefined;

  while (results.length < maxOverall) {
    const params = new URLSearchParams({
      key,
      playlistId,
      part: "snippet,contentDetails",
      maxResults: "50",
    });

    if (pageToken) params.set("pageToken", pageToken);

    const response = await fetch(`${PLAYLIST_ITEMS_API}?${params.toString()}`, { cache: "no-store" });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`playlistItems failed: ${response.status} ${response.statusText} ${text}`);
    }

    const data = await response.json();
    for (const item of data.items ?? []) {
      const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      if (!videoId) continue;

      const thumbnailUrl =
        item.snippet?.thumbnails?.maxres?.url ||
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        "";

      results.push({
        id: videoId,
        title: item.snippet?.title || "",
        publishedAt: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt || "",
        thumbnailUrl,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      });

      if (results.length >= maxOverall) break;
    }

    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  const toTime = (value) => {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? -Infinity : timestamp;
  };

  const latestFirst = [...results].sort((a, b) => toTime(b.publishedAt) - toTime(a.publishedAt));
  const pinned = latestFirst.slice(0, 2);
  const pinnedIds = new Set(pinned.map((video) => video.id));
  const ordered = [...pinned, ...results.filter((video) => !pinnedIds.has(video.id))];

  const viewCounts = await fetchViewCounts(
    Array.from(new Set(ordered.map((video) => video.id))),
    key
  );

  return {
    updatedAt: new Date().toISOString(),
    totalViews: Array.from(viewCounts.values()).reduce((sum, count) => sum + count, 0),
    videos: ordered.map((video) => ({
      ...video,
      viewCount: viewCounts.get(video.id),
    })),
  };
}

try {
  await loadLocalEnv();
  const cache = await fetchPlaylistCache();
  await writeCache(cache);
  console.log(`Updated YouTube cache with ${cache.videos.length} videos.`);
} catch (error) {
  console.warn("Failed to refresh YouTube cache, using existing snapshot instead.");
  console.warn(error);
  await writeCache(await readCache());
}
