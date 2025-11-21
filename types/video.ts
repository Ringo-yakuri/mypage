export type VideoItem = {
  id: string;
  title: string;
  publishedAt: string; // ISO date string
  thumbnailUrl: string;
  url: string;
  viewCount?: number;
};
