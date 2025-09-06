import { Card } from "@/components/ui/card";
import Image from "next/image";
import { VideoItem } from "@/types/video";

type Props = {
  video: VideoItem;
};

export default function VideoCard({ video }: Props) {
  const date = new Date(video.publishedAt);
  const formatted = isNaN(date.getTime()) ? "" : date.toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });

  return (
    <a href={video.url} target="_blank" rel="noopener noreferrer" aria-label={video.title}>
      <Card className="overflow-hidden bg-[#3E4E5A] hover:bg-[#435564] transition-colors duration-200 shadow-lg">
        <div className="relative aspect-video">
          {video.thumbnailUrl && (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover"
              loading="lazy"
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold text-[#C7CCCF] line-clamp-2 min-h-[3rem]">{video.title}</h3>
          {formatted && (
            <p className="mt-2 text-sm text-[#C7CCCF]/80">{formatted}</p>
          )}
        </div>
      </Card>
    </a>
  );
}
