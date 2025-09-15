"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import VideoCard from "@/components/VideoCard";
import { VideoItem } from "@/types/video";
import { Button } from "@/components/ui/button";

type Props = {
  videos: VideoItem[];
  initialCount?: number;
  step?: number;
};

export default function VideosClient({ videos, initialCount = 4, step = 4 }: Props) {
  const gridRef = useRef<HTMLDivElement | null>(null);

  // 推定列数を算出（Grid/Flexいずれでも利用可能）
  const [cols, setCols] = useState(1);
  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const compute = () => {
      const style = window.getComputedStyle(el);
      // 1) CSS Gridの列数を直接読む（最優先・正確）
      const gtc = style.gridTemplateColumns;
      if (gtc && gtc !== "none") {
        // 多くの環境で `minmax(0px, 1fr)` の繰り返しになる
        const byMinmax = (gtc.match(/minmax\(/g) || []).length;
        if (byMinmax > 0) {
          setCols(byMinmax);
          return;
        }
        // フォールバック: スペース区切りのトラック数をざっくり数える
        const tracks = gtc.trim().split(/\s+/).length;
        if (tracks > 0) {
          setCols(tracks);
          return;
        }
      }

      // 2) フォールバック: 子要素幅 + gap から推定（Flexでも可）
      const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
      const first = (el.firstElementChild as HTMLElement | null) ?? undefined;
      if (!first) { setCols(1); return; }
      const container = el.clientWidth || 1;
      const card = first.clientWidth || 1;
      const calculated = Math.max(1, Math.floor((container + gap - 0.5) / (card + gap)));
      setCols(calculated);
    };

    const ro = new ResizeObserver(compute);
    ro.observe(el);
    compute();

    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, []);

  // 最低4件を満たしつつ、列数の倍数に切り上げ
  const adjustedInitial = useMemo(() => {
    const min = 4;
    const base = Math.max(initialCount, min);
    const c = Math.max(1, cols);
    const rounded = Math.ceil(base / c) * c;
    return Math.min(videos.length, Math.max(min, rounded));
  }, [initialCount, cols, videos.length]);

  // “もっと見る”でも行が崩れないよう、列数の倍数で追加
  const adjustedStep = useMemo(() => {
    const c = Math.max(1, cols);
    return Math.max(c, Math.ceil(step / c) * c);
  }, [step, cols]);

  const [visible, setVisible] = useState(adjustedInitial);
  useEffect(() => setVisible(adjustedInitial), [adjustedInitial]);

  const showMore = () => setVisible((v) => Math.min(v + adjustedStep, videos.length));

  return (
    <>
      <div
        ref={gridRef}
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
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
