import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_MAX_VIDEOS,
  buildCache,
  dedupeById,
  resolveMaxVideos,
  sortVideos,
  toVideoItem,
} from "./youtube-cache-lib.mjs";

const video = (id, publishedAt) => ({
  id,
  title: `title-${id}`,
  publishedAt,
  thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  url: `https://www.youtube.com/watch?v=${id}`,
});

test("sortVideos pins the two newest videos first, rest keeps playlist order", () => {
  const playlist = [
    video("a", "2024-01-01T00:00:00Z"),
    video("b", "2026-05-15T00:00:00Z"), // 最新
    video("c", "2023-06-01T00:00:00Z"),
    video("d", "2026-04-29T00:00:00Z"), // 2番目に新しい
    video("e", "2025-01-01T00:00:00Z"),
  ];
  const sorted = sortVideos(playlist);
  assert.deepEqual(
    sorted.map((v) => v.id),
    ["b", "d", "a", "c", "e"]
  );
});

test("sortVideos with two or fewer videos sorts by date descending", () => {
  const playlist = [video("old", "2020-01-01T00:00:00Z"), video("new", "2024-01-01T00:00:00Z")];
  assert.deepEqual(
    sortVideos(playlist).map((v) => v.id),
    ["new", "old"]
  );
  assert.deepEqual(sortVideos([]), []);
});

test("sortVideos leaves videos with invalid dates in playlist position", () => {
  const playlist = [
    video("a", "2024-01-01T00:00:00Z"),
    video("broken", "not-a-date"),
    video("b", "2026-01-01T00:00:00Z"),
    video("c", "2025-01-01T00:00:00Z"),
  ];
  // ピンは b(2026) と c(2025)。broken はピン候補から除外され、元の並びに残る。
  assert.deepEqual(
    sortVideos(playlist).map((v) => v.id),
    ["b", "c", "a", "broken"]
  );
});

test("dedupeById keeps the first playlist occurrence", () => {
  const playlist = [video("a", "2024-01-01T00:00:00Z"), video("b", "2024-02-01T00:00:00Z")];
  const duplicated = [...playlist, { ...playlist[0], title: "duplicate-later" }];
  const deduped = dedupeById(duplicated);
  assert.equal(deduped.length, 2);
  assert.equal(deduped[0].title, "title-a");
});

test("resolveMaxVideos falls back to the default for invalid values", () => {
  assert.equal(resolveMaxVideos(undefined), DEFAULT_MAX_VIDEOS);
  assert.equal(resolveMaxVideos(""), DEFAULT_MAX_VIDEOS);
  assert.equal(resolveMaxVideos("abc"), DEFAULT_MAX_VIDEOS);
  assert.equal(resolveMaxVideos("0"), DEFAULT_MAX_VIDEOS);
  assert.equal(resolveMaxVideos("-5"), DEFAULT_MAX_VIDEOS);
  assert.equal(resolveMaxVideos("2.5"), DEFAULT_MAX_VIDEOS);
  assert.equal(resolveMaxVideos("30"), 30);
});

test("toVideoItem extracts fields and prefers larger thumbnails", () => {
  const item = {
    snippet: {
      title: "t",
      publishedAt: "2024-01-01T00:00:00Z",
      resourceId: { videoId: "xyz" },
      thumbnails: {
        default: { url: "default.jpg" },
        high: { url: "high.jpg" },
      },
    },
    contentDetails: { videoId: "xyz", videoPublishedAt: "2024-02-01T00:00:00Z" },
  };
  const result = toVideoItem(item);
  assert.equal(result.id, "xyz");
  assert.equal(result.publishedAt, "2024-02-01T00:00:00Z");
  assert.equal(result.thumbnailUrl, "high.jpg");
  assert.equal(toVideoItem({ snippet: { title: "no id" } }), null);
});

test("buildCache assembles schema v1 with view counts and playlist url", () => {
  const items = [
    video("a", "2024-01-01T00:00:00Z"),
    video("b", "2026-05-15T00:00:00Z"),
    video("c", "2026-04-29T00:00:00Z"),
  ];
  const viewCounts = new Map([
    ["a", 100],
    ["b", 200],
    ["c", 50],
  ]);
  const cache = buildCache({
    items,
    viewCounts,
    playlistId: "PL123",
    now: "2026-06-12T00:00:00.000Z",
  });

  assert.equal(cache.schemaVersion, 1);
  assert.equal(cache.updatedAt, "2026-06-12T00:00:00.000Z");
  assert.equal(cache.playlistUrl, "https://www.youtube.com/playlist?list=PL123");
  assert.equal(cache.totalViews, 350);
  assert.deepEqual(
    cache.videos.map((v) => v.id),
    ["b", "c", "a"]
  );
  assert.equal(cache.videos[0].viewCount, 200);
});
