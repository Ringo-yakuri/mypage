import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VideosClient from "@/components/VideosClient";
import { VideoItem } from "@/types/video";

type Props = {
  videos: VideoItem[];
  initialCount?: number;
  step?: number;
};

// Server component; receives videos fetched at build time
export default function YouTubeVideos({ videos, initialCount = 24, step = 8 }: Props) {
  return (
    <Card className="md:col-span-3 p-6 shadow-lg bg-gradient-to-br from-[#09171F] to-[#2C3A45]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#CEA17A]">出演動画</h2>
        <Button
          asChild
          size="sm"
          className="bg-[#CEA17A] hover:bg-[#B69D74] text-[#1F2839]"
        >
          <a href="/playlist" target="_blank" rel="noopener noreferrer">
            プレイリスト
          </a>
        </Button>
      </div>
      <VideosClient videos={videos} initialCount={initialCount} step={step} />
    </Card>
  );
}
