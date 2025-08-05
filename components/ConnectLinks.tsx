import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SiYoutube, SiNiconico, SiX, SiBluesky, SiTwitch } from "@icons-pack/react-simple-icons";
import { Footprints } from "lucide-react";

export default function ConnectLinks() {
  return (
    <Card className="p-6 shadow-lg bg-[#2C3A45]">
      <h2 className="text-2xl font-bold mb-4 text-[#CEA17A]">コネクト</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 rounded-lg shadow bg-[#3E4E5A]">
          <h3 className="font-bold mb-2 text-[#C7CCCF]">科学はすべてを解決する!!</h3>
          <div className="aspect-video mb-2 relative">
            <Image
              src="/images/YouTube.jpeg"
              alt="YouTubeチャンネルサムネイル"
              fill
              className="object-cover rounded"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <a href="https://www.youtube.com/@krr" target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-[#CEA17A] hover:bg-[#B69D74] text-[#1F2839]">
              <SiYoutube className="mr-2 h-4 w-4" /> Youtubeチャンネル
            </Button>
          </a>
        </div>
        <div className="p-4 rounded-lg shadow bg-[#3E4E5A]">
          <h3 className="font-bold mb-2 text-[#C7CCCF]">科学はすべてを解決する!!ニコニコ秘密基地</h3>
          <div className="aspect-video mb-2 relative">
            <Image
              src="/images/niconico.jpeg"
              alt="ニコニコチャンネルサムネイル"
              fill
              className="object-cover rounded"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <a href="https://ch.nicovideo.jp/kagaku-kaiketu" target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-[#CEA17A] hover:bg-[#B69D74] text-[#1F2839]">
              <SiNiconico className="mr-2 h-4 w-4" />
              ニコニコチャンネル
            </Button>
          </a>
        </div>
        <a href="https://twitter.com/ringo_yakuri" target="_blank" rel="noopener noreferrer">
          <Button className="w-full bg-[#C7CCCF] hover:bg-[#BFC1C6] text-[#2C3A45]">
            <SiX className="mr-2 h-4 w-4" /> Twitter
          </Button>
        </a>
        <a href="https://bsky.app/profile/ringoyakuri.bsky.social" target="_blank" rel="noopener noreferrer">
          <Button className="w-full bg-[#C7CCCF] hover:bg-[#BFC1C6] text-[#2C3A45]">
            <SiBluesky className="mr-2 h-4 w-4" />
            Bluesky
          </Button>
        </a>
        <a href="https://www.twitch.tv/ringo_sensei" target="_blank" rel="noopener noreferrer">
          <Button className="w-full bg-[#C7CCCF] hover:bg-[#BFC1C6] text-[#2C3A45]">
            <SiTwitch className="mr-2 h-4 w-4" /> Twitch
          </Button>
        </a>
        <a href="https://mixi.social/@ringo_yakuri" target="_blank" rel="noopener noreferrer">
          <Button className="w-full bg-[#C7CCCF] hover:bg-[#BFC1C6] text-[#2C3A45]">
            <Footprints className="mr-2 h-4 w-4" />
            mixi2
          </Button>
        </a>
      </div>
    </Card>
  );
}
