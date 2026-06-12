// YouTube Data API v3 から再生リストの動画情報を取得し、data/youtube-videos.json を更新する。
// ローカル: npm run refresh:youtube (.env.local を --env-file で読み込む)
// CI:       npm run refresh:youtube:ci (--strict: 失敗時に exit 1)
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { buildCache, dedupeById, resolveMaxVideos, toVideoItem } from "./youtube-cache-lib.mjs";

const PLAYLIST_ITEMS_API = "https://www.googleapis.com/youtube/v3/playlistItems";
const VIDEOS_API = "https://www.googleapis.com/youtube/v3/videos";

const strict = process.argv.includes("--strict");

const rootDir = process.cwd();
const cacheDir = path.join(rootDir, "data");
const publicCacheDir = path.join(rootDir, "public", "data");
const cachePath = path.join(cacheDir, "youtube-videos.json");
const publicCachePath = path.join(publicCacheDir, "youtube-videos.json");

async function readExistingCache() {
  const raw = await readFile(cachePath, "utf8");
  return JSON.parse(raw);
}

async function writeCache(cache) {
  const serialized = `${JSON.stringify(cache, null, 2)}\n`;
  await mkdir(cacheDir, { recursive: true });
  await mkdir(publicCacheDir, { recursive: true });
  await writeFile(cachePath, serialized, "utf8");
  await writeFile(publicCachePath, serialized, "utf8");
}

async function fetchJson(endpoint, params) {
  const response = await fetch(`${endpoint}?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${endpoint} failed: ${response.status} ${response.statusText} ${text}`);
  }
  return response.json();
}

// プレイリスト順のまま VideoItem の配列を返す。
async function fetchPlaylistItems(key, playlistId, maxVideos) {
  const items = [];
  let pageToken;

  while (items.length < maxVideos) {
    const params = new URLSearchParams({
      key,
      playlistId,
      part: "snippet,contentDetails",
      maxResults: "50",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const data = await fetchJson(PLAYLIST_ITEMS_API, params);
    for (const item of data.items ?? []) {
      const video = toVideoItem(item);
      if (!video) continue;
      items.push(video);
      if (items.length >= maxVideos) break;
    }

    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  return items;
}

async function fetchViewCounts(key, videoIds) {
  const viewCounts = new Map();

  for (let i = 0; i < videoIds.length; i += 50) {
    const params = new URLSearchParams({
      key,
      part: "statistics",
      id: videoIds.slice(i, i + 50).join(","),
    });

    const data = await fetchJson(VIDEOS_API, params);
    for (const item of data.items ?? []) {
      if (!item.id) continue;
      const viewCount = Number(item.statistics?.viewCount ?? 0);
      viewCounts.set(item.id, Number.isNaN(viewCount) ? 0 : viewCount);
    }
  }

  return viewCounts;
}

async function refreshCache() {
  const key = process.env.YOUTUBE_API_KEY;
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID;
  if (!key || !playlistId) {
    throw new Error("Missing YOUTUBE_API_KEY or YOUTUBE_PLAYLIST_ID");
  }

  const maxVideos = resolveMaxVideos(process.env.MAX_VIDEOS);
  const items = await fetchPlaylistItems(key, playlistId, maxVideos);
  const uniqueIds = dedupeById(items).map((video) => video.id);
  const viewCounts = await fetchViewCounts(key, uniqueIds);

  const cache = buildCache({
    items,
    viewCounts,
    playlistId,
    now: new Date().toISOString(),
  });

  if (cache.videos.length === 0) {
    throw new Error("Refusing to write an empty video list");
  }

  return cache;
}

try {
  const cache = await refreshCache();
  await writeCache(cache);
  console.log(`Updated YouTube cache with ${cache.videos.length} videos.`);
} catch (error) {
  if (strict) {
    console.error("Failed to refresh YouTube cache (--strict).");
    console.error(error);
    process.exit(1);
  }
  console.warn("Failed to refresh YouTube cache, using existing snapshot instead.");
  console.warn(error);
  await writeCache(await readExistingCache());
}
