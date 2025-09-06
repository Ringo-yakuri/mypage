"use client";
import { useState } from "react";
import VideoCard from "@/components/VideoCard";
import { VideoItem } from "@/types/video";
import { Button } from "@/components/ui/button";

type Props = {
  videos: VideoItem[];
  initialCount?: number;
  step?: number;
};

export default function VideosClient({ videos, initialCount = 4, step = 4 }: Props) {
  const [visible, setVisible] = useState(Math.min(initialCount, videos.length));
  const showMore = () => setVisible((v) => Math.min(v + step, videos.length));

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.slice(0, visible).map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
      {visible < videos.length && (
        <div className="mt-6 text-center">
          <Button
            onClick={showMore}
            className="bg-[#CEA17A] hover:bg-[#B69D74] text-[#1F2839]"
            aria-label="もっと見る"
          >
            もっと見る（残り {videos.length - visible} 件）
          </Button>
        </div>
      )}
    </>
  );
}
