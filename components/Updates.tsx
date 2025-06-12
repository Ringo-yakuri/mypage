"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Updates() {
  const [expandedUpdate, setExpandedUpdate] = useState<number | null>(null);

  const updates = [
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

  return (
    <Card className="p-6 shadow-lg bg-[#3E4E5A]">
      <h2 className="text-2xl font-bold mb-4 text-[#CEA17A]">最新情報</h2>
      <ul className="space-y-4 text-[#C7CCCF]">
        {updates.map((update, index) => (
          <li key={index} className="border-b border-[#CEA17A] pb-2">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() =>
                setExpandedUpdate(expandedUpdate === index ? null : index)
              }
            >
              <a
                href={update.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {update.title}
              </a>
              {expandedUpdate === index ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
            {expandedUpdate === index && (
              <p className="mt-2 text-sm">{update.details}</p>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
