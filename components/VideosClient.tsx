"use client";
import { useEffect, useState } from "react";
import VideoCard from "@/components/VideoCard";
import { VideoItem } from "@/types/video";
import { Button } from "@/components/ui/button";

type Props = {
  videos: VideoItem[];
  initialCount?: number;
  step?: number;
};

const breakpointColumns = [
  { query: "(min-width: 1280px)", columns: 4 },
  { query: "(min-width: 1024px)", columns: 3 },
  { query: "(min-width: 640px)", columns: 2 },
];

function useColumns() {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueries = breakpointColumns.map((bp) => ({
      ...bp,
      mq: window.matchMedia(bp.query),
    }));

    const update = () => {
      const match = mediaQueries.find(({ mq }) => mq.matches);
      setColumns(match?.columns ?? 1);
    };

    const cleanups = mediaQueries.map(({ mq }) => {
      const handler = () => update();
      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
      }
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    });

    update();

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return columns;
}

export default function VideosClient({ videos, initialCount = 4, step = 4 }: Props) {
  const columns = useColumns();
  // 最終行が欠けないよう、初期表示数と増分は列数の倍数に揃える。
  const baseline = columns <= 2 ? 4 : columns * 2;
  const safeInitial = Math.min(videos.length, Math.max(initialCount, baseline));
  const safeStep = Math.max(columns, Math.ceil(step / columns) * columns);

  const [visible, setVisible] = useState(safeInitial);

  useEffect(() => {
    setVisible(safeInitial);
  }, [safeInitial]);

  const visibleVideos = videos.slice(0, visible);
  const remaining = videos.length - visibleVideos.length;

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleVideos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
      {remaining > 0 && (
        <div className="mt-6 text-center">
          <Button
            onClick={() => setVisible((current) => Math.min(current + safeStep, videos.length))}
            className="bg-[#CEA17A] hover:bg-[#B69D74] text-[#1F2839]"
            aria-label="もっと見る"
          >
            もっと見る（残り {remaining} 件）
          </Button>
        </div>
      )}
    </>
  );
}
