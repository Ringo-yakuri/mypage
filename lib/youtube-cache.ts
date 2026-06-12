import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import { VideoItem } from "@/types/video";

export type YoutubeCache = {
  updatedAt: string | null;
  playlistUrl: string | null;
  totalViews: number;
  videos: VideoItem[];
};

const FALLBACK_CACHE: YoutubeCache = {
  updatedAt: null,
  playlistUrl: null,
  totalViews: 0,
  videos: [],
};

function isVideoItem(value: unknown): value is VideoItem {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.title === "string" &&
    typeof candidate.publishedAt === "string" &&
    typeof candidate.thumbnailUrl === "string" &&
    typeof candidate.url === "string" &&
    (candidate.viewCount === undefined || typeof candidate.viewCount === "number")
  );
}

export async function readYoutubeCache(): Promise<YoutubeCache> {
  const cachePath = path.join(process.cwd(), "data", "youtube-videos.json");

  try {
    const raw = await readFile(cachePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<YoutubeCache>;
    const videos = Array.isArray(parsed.videos) ? parsed.videos.filter(isVideoItem) : [];

    return {
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
      playlistUrl: typeof parsed.playlistUrl === "string" ? parsed.playlistUrl : null,
      totalViews: Number.isFinite(parsed.totalViews) ? Number(parsed.totalViews) : 0,
      videos,
    };
  } catch (error) {
    console.error("Failed to read YouTube cache", error);
    return FALLBACK_CACHE;
  }
}
