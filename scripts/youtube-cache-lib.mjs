// YouTube キャッシュ生成の純粋関数群。I/O は sync-youtube-cache.mjs 側に置く。

export const DEFAULT_MAX_VIDEOS = 100;

export function resolveMaxVideos(raw) {
  if (raw === undefined || raw === null || raw === "") return DEFAULT_MAX_VIDEOS;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    console.warn(
      `Invalid MAX_VIDEOS value ${JSON.stringify(raw)}; falling back to ${DEFAULT_MAX_VIDEOS}.`
    );
    return DEFAULT_MAX_VIDEOS;
  }
  return value;
}

// playlistItems API のレスポンス1件を VideoItem に変換する。videoId が無ければ null。
export function toVideoItem(item) {
  const videoId = item?.contentDetails?.videoId || item?.snippet?.resourceId?.videoId;
  if (!videoId) return null;

  const thumbnails = item?.snippet?.thumbnails ?? {};
  const thumbnailUrl =
    thumbnails.maxres?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    "";

  return {
    id: videoId,
    title: item?.snippet?.title || "",
    publishedAt: item?.contentDetails?.videoPublishedAt || item?.snippet?.publishedAt || "",
    thumbnailUrl,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

// プレイリスト順を保つため、重複 ID は最初の出現を残す。
export function dedupeById(videos) {
  const seen = new Set();
  return videos.filter((video) => {
    if (seen.has(video.id)) return false;
    seen.add(video.id);
    return true;
  });
}

const toTime = (value) => {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
};

// 表示順の仕様: プレイリスト定義順を基準に、公開日が最新の2本だけを先頭に固定する
// (固定2本の間は新しい順)。publishedAt が不正な動画はピン対象から除外し、
// プレイリスト順の位置に残す。2本以下の場合は公開日降順のみ。
export function sortVideos(playlistOrderedVideos) {
  if (playlistOrderedVideos.length <= 2) {
    return [...playlistOrderedVideos].sort(
      (a, b) => (toTime(b.publishedAt) ?? -Infinity) - (toTime(a.publishedAt) ?? -Infinity)
    );
  }

  const dated = playlistOrderedVideos
    .map((video, index) => ({ video, index, time: toTime(video.publishedAt) }))
    .filter((entry) => entry.time !== null);

  const pinned = [...dated].sort((a, b) => b.time - a.time).slice(0, 2);
  const pinnedIndexes = new Set(pinned.map((entry) => entry.index));

  return [
    ...pinned.map((entry) => entry.video),
    ...playlistOrderedVideos.filter((_, index) => !pinnedIndexes.has(index)),
  ];
}

// キャッシュ JSON (schemaVersion 1) を組み立てる。
export function buildCache({ items, viewCounts, playlistId, now }) {
  const videos = sortVideos(dedupeById(items));
  const totalViews = Array.from(viewCounts.values()).reduce((sum, count) => sum + count, 0);

  return {
    schemaVersion: 1,
    updatedAt: now,
    playlistUrl: `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`,
    totalViews,
    videos: videos.map((video) => ({
      ...video,
      viewCount: viewCounts.get(video.id),
    })),
  };
}
