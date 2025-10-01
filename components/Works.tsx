import { Card } from "@/components/ui/card";

export default function Works() {
  return (
    <Card className="md:col-span-2 p-6 shadow-lg bg-[#2C3A45]">
      <h2 className="text-2xl font-bold mb-4 text-[#CEA17A]">過去のお仕事</h2>
      <ul className="list-disc list-inside space-y-2 text-[#C7CCCF]">
        <li>講演：特別進路講演　飛鳥未来高等学校池袋キャンパス　2025年9月30日</li>
        <li>出演：ニコニコ超会議　2025年4月27日</li>
        <li>講演：「法で遊んでみよう」板橋区立教育科学館　2024年12月22日</li>
        <li>講演：神保町マボロシschool「倫獄先生の、法律入門」　2024年10月27日</li>
        <li>講演：「刑法ってなに？刑法典を読んでみよう」板橋区立教育科学館　2024年9月22日</li>
        <li>出演：ニコニコ超会議　2024年4月28日</li>
        <li>公開研究会：Tokyo Education Show at 東京学芸大学　2023年10月12日</li>
        <li>出演：ニコニコ超会議　2023年4月30日</li>
        <li>共著書：『アリエナイ理科ノ大事典Ⅲ』三才ブックス 2023年</li>
      </ul>
    </Card>
  );
}
