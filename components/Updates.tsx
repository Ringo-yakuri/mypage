"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

type UpdateItem = {
  title: string;
  link: string;
  details: string;
};

const updates: UpdateItem[] = [
  {
    title: "アリエナイ理科 in 本の街 神保町 2025 薬理凶室オフライントークショー",
    link: "https://www.shosen.co.jp/event/35648/",
    details:
      "2025年12月21日（日）13:00～、会場はオチャノバ（新御茶ノ水）。くられ・山崎詩郎ほか薬理凶室メンバーが登壇。チケットはLivepocketで11月21日発売予定。",
  },
  {
    title: "倫獄の伏魔殿6丁目",
    link: "https://ch.nicovideo.jp/kagaku-kaiketu",
    details:
      "ニコニコチャンネルにて、『倫獄の伏魔殿6丁目』を毎月放送しています。毎月怪人をゲストに招待して、楽しいトークを繰り広げます。",
  },
  {
    title: "倫獄のブロマガ",
    link: "https://ch.nicovideo.jp/kagaku-kaiketu",
    details:
      "ニコニコチャンネルにて、法律や勉強法に関する幅広いトピックについてのブロマガを毎月配信しています。",
  },
];

export default function Updates() {
  const [expandedUpdate, setExpandedUpdate] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setExpandedUpdate((current) => (current === index ? null : index));
  };

  return (
    <Card className="p-6 shadow-lg bg-[#3E4E5A]">
      <h2 className="text-2xl font-bold mb-4 text-[#CEA17A]">最新情報</h2>
      <ul className="space-y-4 text-[#C7CCCF]">
        {updates.map((update, index) => {
          const isExpanded = expandedUpdate === index;
          const contentId = `update-${index}`;
          return (
            <li key={update.link} className="border-b border-[#CEA17A] pb-2">
              <div className="flex items-start justify-between gap-2">
                <a
                  href={update.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 hover:underline"
                >
                  {update.title}
                </a>
                <button
                  type="button"
                  onClick={() => handleToggle(index)}
                  aria-expanded={isExpanded}
                  aria-controls={contentId}
                  className="p-1 text-[#C7CCCF] hover:text-[#CEA17A] transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>
              {isExpanded && (
                <p id={contentId} className="mt-2 text-sm">
                  {update.details}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
