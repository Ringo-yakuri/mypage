import { Card } from "@/components/ui/card";
import Image from "next/image";

export default function ProfileCard() {
  return (
    <Card className="md:col-span-2 p-6 shadow-lg bg-gradient-to-br from-[#09171F] to-[#2C3A45]">
      <h2 className="text-2xl font-bold mb-4 text-[#CEA17A]">プロフィール</h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-64 h-64 md:w-64 md:h-48 mx-auto md:mx-0 relative border-2 border-[#CEA17A] rounded-full md:rounded-lg overflow-hidden">
          <Image
            src="/images/avatar.png"
            alt="プロフィール"
            fill
            className="object-cover object-top md:object-center"
            sizes="(max-width: 768px) 256px, 192px"
            priority
          />
        </div>
        <div>
          <p className="mb-4 text-[#C7CCCF] leading-relaxed font-bold">
            法律を学び、理解する楽しさを提供する専門家
          </p>
          <p className="mb-4 text-[#C7CCCF] leading-relaxed">
            刑法を専門としつつ、幅広い法分野についてもわかりやすく解説するコンテンツクリエイターとして活動しています。法律を日常生活に役立てるための「架け橋」として、複雑な法的概念を誰でも理解できる形で提供することを目指しています。
          </p>
          <p className="text-[#C7CCCF] leading-relaxed">
            近年は、講演や公開授業を通じて、法的リテラシーの向上に力を入れており、様々な機関やクリエイターとのコラボレーションも積極的に行っています。法に関する執筆・講演の依頼を歓迎しておりますので、詳しくは薬理凶室までお問い合わせください。
          </p>
        </div>
      </div>
    </Card>
  );
}
