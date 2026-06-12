import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VideosClient from "@/components/VideosClient";
import { VideoItem } from "@/types/video";

type Props = {
  videos: VideoItem[];
  totalViews?: number;
  playlistUrl: string | null;
  initialCount?: number;
  step?: number;
};

const viewFormatter = new Intl.NumberFormat("ja-JP");

// Server component; videos はビルド時にキャッシュ JSON から渡される
export default function YouTubeVideos({
  videos,
  totalViews,
  playlistUrl,
  initialCount = 24,
  step = 8,
}: Props) {
  const hasTotal = typeof totalViews === "number" && Number.isFinite(totalViews) && totalViews > 0;
  const formattedTotal = hasTotal ? viewFormatter.format(totalViews ?? 0) : null;
  return (
    <Card className="md:col-span-3 p-6 shadow-lg bg-gradient-to-br from-[#09171F] to-[#2C3A45]">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#CEA17A]">出演動画</h2>
          {formattedTotal && (
            <p className="text-sm text-[#C7CCCF]/80 mt-1">
              総再生回数 {formattedTotal} 回
            </p>
          )}
        </div>
        <Button
          asChild
          size="sm"
          className="bg-[#CEA17A] hover:bg-[#B69D74] text-[#1F2839]"
        >
          <a href={playlistUrl ?? "https://www.youtube.com"} target="_blank" rel="noopener noreferrer">
            プレイリスト
          </a>
        </Button>
      </div>
      <VideosClient videos={videos} initialCount={initialCount} step={step} />
    </Card>
  );
}
