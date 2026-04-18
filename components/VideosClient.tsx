"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import VideoCard from "@/components/VideoCard";
import { VideoItem } from "@/types/video";
import { Button } from "@/components/ui/button";

type Props = {
  initialVideos: VideoItem[];
  totalCount: number;
  dataUrl: string;
  initialCount?: number;
  step?: number;
};

type VideoPayload = {
  videos?: VideoItem[];
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

export default function VideosClient({
  initialVideos,
  totalCount,
  dataUrl,
  initialCount = 4,
  step = 4,
}: Props) {
  const [videos, setVideos] = useState(initialVideos);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const loadAllRef = useRef<Promise<VideoItem[]> | null>(null);
  const columns = useColumns();
  const baseline = columns <= 2 ? 4 : columns * 2;
  const safeInitial = Math.min(totalCount, Math.max(initialCount, baseline));
  const safeStep = Math.max(columns, Math.ceil(step / columns) * columns);

  const [visible, setVisible] = useState(safeInitial);

  useEffect(() => {
    setVisible(safeInitial);
  }, [safeInitial]);

  useEffect(() => {
    setVideos(initialVideos);
  }, [initialVideos]);

  useEffect(() => {
    loadAllRef.current = null;
  }, [dataUrl, totalCount, initialVideos]);

  const loadAllVideos = useCallback(async () => {
    if (loadAllRef.current) return loadAllRef.current;

    const request = (async () => {
      setIsLoadingAll(true);
      try {
        const response = await fetch(dataUrl, { cache: "force-cache" });
        if (!response.ok) {
          throw new Error(`Failed to load videos: ${response.status} ${response.statusText}`);
        }

        const payload = (await response.json()) as VideoPayload;
        const nextVideos = Array.isArray(payload.videos) ? payload.videos : initialVideos;
        setVideos(nextVideos);
        return nextVideos;
      } catch (error) {
        console.error("Failed to load full video list", error);
        return initialVideos;
      } finally {
        setIsLoadingAll(false);
      }
    })();

    loadAllRef.current = request;
    return request;
  }, [dataUrl, initialVideos]);

  useEffect(() => {
    if (totalCount > initialVideos.length) {
      void loadAllVideos();
    }
  }, [initialVideos.length, loadAllVideos, totalCount]);

  const visibleVideos = videos.slice(0, visible);
  const remaining = Math.max(0, totalCount - visibleVideos.length);

  const showMore = async () => {
    if (videos.length < totalCount) {
      await loadAllVideos();
    }
    setVisible((current) => Math.min(current + safeStep, totalCount));
  };

  return (
    <>
      <div
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {visibleVideos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
      {remaining > 0 && (
        <div className="mt-6 text-center">
          <Button
            onClick={showMore}
            className="bg-[#CEA17A] hover:bg-[#B69D74] text-[#1F2839]"
            aria-label="もっと見る"
            disabled={isLoadingAll && videos.length < totalCount}
          >
            {isLoadingAll && videos.length < totalCount
              ? "動画を読み込み中..."
              : `もっと見る（残り ${remaining} 件）`}
          </Button>
        </div>
      )}
    </>
  );
}
