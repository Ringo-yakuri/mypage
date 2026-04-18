import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import { VideoItem } from "@/types/video";

export type YoutubeCache = {
  updatedAt: string | null;
  totalViews: number;
  videos: VideoItem[];
};

const FALLBACK_CACHE: YoutubeCache = {
  updatedAt: null,
  totalViews: 0,
  videos: [],
};

export async function readYoutubeCache(): Promise<YoutubeCache> {
  const cachePath = path.join(process.cwd(), "data", "youtube-videos.json");

  try {
    const raw = await readFile(cachePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<YoutubeCache>;

    return {
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
      totalViews: Number.isFinite(parsed.totalViews) ? Number(parsed.totalViews) : 0,
      videos: Array.isArray(parsed.videos) ? parsed.videos : [],
    };
  } catch (error) {
    console.error("Failed to read YouTube cache", error);
    return FALLBACK_CACHE;
  }
}
