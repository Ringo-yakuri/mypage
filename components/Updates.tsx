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
    title: "2026年3月21日（土）アリエナイ 昼と夜 の実験室 in 阿佐ヶ谷ロフト",
    link: "https://www.loft-prj.co.jp/schedule/lofta/",
    details:
      "阿佐ヶ谷ロフトAで開催される昼夜二部制のイベントに出演します。詳細・チケット情報はロフト公式サイトをご確認ください。",
  },
  {
    title: "三才ブックス「ラジオライフ」連載：ｱﾘｴﾅｲ法学凶室",
    link: "https://radiolife.jp/",
    details: "月刊「ラジオライフ」にてｱﾘｴﾅｲ法学凶室を連載中です。最新号もぜひチェックしてください。",
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
