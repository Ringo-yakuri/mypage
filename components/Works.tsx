import { Card } from "@/components/ui/card";

type WorkItem = {
  sortKey: string;
  label: string;
};

const works: WorkItem[] = [
  {
    sortKey: "2026-03-21",
    label: "イベント：アリエナイ 昼と夜 の実験室 in 阿佐ヶ谷ロフト　2026年3月21日",
  },
  {
    sortKey: "2025-12-21",
    label: "イベント：アリエナイ理科 in 本の街 神保町 2025 薬理凶室オフライントークショー　2025年12月21日",
  },
  {
    sortKey: "2025-09-30",
    label: "講演：特別進路講演　飛鳥未来高等学校池袋キャンパス　2025年9月30日",
  },
  {
    sortKey: "2025-04-27",
    label: "出演：ニコニコ超会議　2025年4月27日",
  },
  {
    sortKey: "2024-12-22",
    label: "講演：「法で遊んでみよう」板橋区立教育科学館　2024年12月22日",
  },
  {
    sortKey: "2024-10-27",
    label: "講演：神保町マボロシschool「倫獄先生の、法律入門」　2024年10月27日",
  },
  {
    sortKey: "2024-09-22",
    label: "講演：「刑法ってなに？刑法典を読んでみよう」板橋区立教育科学館　2024年9月22日",
  },
  {
    sortKey: "2024-04-28",
    label: "出演：ニコニコ超会議　2024年4月28日",
  },
  {
    sortKey: "2023-10-12",
    label: "公開研究会：Tokyo Education Show at 東京学芸大学　2023年10月12日",
  },
  {
    sortKey: "2023-04-30",
    label: "出演：ニコニコ超会議　2023年4月30日",
  },
  {
    sortKey: "2023-01-01",
    label: "共著書：『アリエナイ理科ノ大事典Ⅲ』三才ブックス 2023年",
  },
].sort((a, b) => b.sortKey.localeCompare(a.sortKey));

export default function Works() {
  return (
    <Card className="md:col-span-2 p-6 shadow-lg bg-[#2C3A45]">
      <h2 className="text-2xl font-bold mb-4 text-[#CEA17A]">過去のお仕事</h2>
      <ul className="list-disc list-inside space-y-2 text-[#C7CCCF]">
        {works.map((work) => (
          <li key={`${work.sortKey}-${work.label}`}>{work.label}</li>
        ))}
      </ul>
    </Card>
  );
}
