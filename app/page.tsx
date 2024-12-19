"use client";
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Youtube, Twitter, ChevronDown, ChevronUp, Gamepad2, Tv, Wind, CircleUserRound, Sun, Footprints, Bird } from "lucide-react"
import Link from "next/link"

export default function Component() {
  const [expandedUpdate, setExpandedUpdate] = useState<number | null>(null);

  const updates = [
    {
      title: "怪人リアル授業：法で遊んでみよう",
      link: "https://www.itbs-sem.jp/club/detail?id=8823",
      details: "法律にとってとても大事な「言葉」の使い方について、ワークショップ形式で学びます。"
    },
     {
      title: "倫獄の伏魔殿6丁目",
      link: "https://ch.nicovideo.jp/kagaku-kaiketu",
      details: "ニコニコチャンネルにて、「倫獄の伏魔殿6丁目」を毎月放送しています。毎月怪人をゲストに招待して、楽しいトークを繰り広げます。"
    },
    {
      title: "倫獄のブロマガ",
      link: "https://ch.nicovideo.jp/kagaku-kaiketu",
      details: "ニコニコチャンネルにて、法律や勉強法に関する幅広いトピックについてのブロマガを毎月配信しています。"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C3A45] to-[#3E4E5A] text-[#C7CCCF] font-serif transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#2C3A45] to-[#3E4E5A] py-4 shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#C7CCCF]">法律怪人　倫獄のポートフォリオ</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 animate-fadeIn">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-2 p-6 shadow-lg bg-gradient-to-br from-[#09171F] to-[#2C3A45]">
            <h2 className="text-2xl font-bold mb-4 text-[#CEA17A]">プロフィール</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-64 h-64 md:w-64 md:h-48 mx-auto md:mx-0 relative overflow-hidden rounded-full md:rounded-lg">
                <img
                  src="/images/avatar.png"
                  alt="プロフィール"
                  className="w-full h-full object-cover border-4 border-[#CEA17A] absolute inset-0 object-top md:object-center"
                  loading="lazy"
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
          
          <Card className="p-6 shadow-lg bg-[#3E4E5A]">
            <h2 className="text-2xl font-bold mb-4 text-[#CEA17A]">最新情報</h2>
            <ul className="space-y-4 text-[#C7CCCF]">
              {updates.map((update, index) => (
                <li key={index} className="border-b border-[#CEA17A] pb-2">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedUpdate(expandedUpdate === index ? null : index)}>
                    <Link href={update.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{update.title}</Link>
                    {expandedUpdate === index ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                  {expandedUpdate === index && (
                    <p className="mt-2 text-sm">{update.details}</p>
                  )}
                </li>
              ))}
            </ul>
          </Card>
          
          <Card className="md:col-span-2 p-6 shadow-lg bg-[#2C3A45]">
            <h2 className="text-2xl font-bold mb-4 text-[#CEA17A]">過去のお仕事</h2>
            <ul className="list-disc list-inside space-y-2 text-[#C7CCCF]">
　            <li>講演：神保町マボロシschool「倫獄先生の、法律入門」　2024年10月27日</li>
              <li>講演：「刑法ってなに？刑法典を読んでみよう」板橋区立教育科学館　2024年9月22日</li>
              <li>出演：ニコニコ超会議　2024年4月28日</li>
              <li>公開研究会：Tokyo Education Show at 東京学芸大学　2023年10月12日</li>
              <li>出演：ニコニコ超会議　2023年4月30日</li>
              <li>共著書：『アリエナイ理科ノ大事典Ⅲ』三才ブックス 2023年</li>
            </ul>
          </Card>
          
          <Card className="p-6 shadow-lg bg-[#2C3A45]">
            <h2 className="text-2xl font-bold mb-4 text-[#CEA17A]">コネクト</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 rounded-lg shadow bg-[#3E4E5A]">
                <h3 className="font-bold mb-2 text-[#C7CCCF]">科学はすべてを解決する!!</h3>
                <div className="aspect-video mb-2">
                  <img
                    src="/images/YouTube.jpeg"
                    alt="YouTubeチャンネルサムネイル"
                    className="w-full h-full object-cover rounded"
                    loading="lazy"
                  />
                </div>
                <Link href="https://www.youtube.com/@krr" passHref>
                  <Button className="w-full bg-[#CEA17A] hover:bg-[#B69D74] text-[#1F2839]">
                    <Youtube className="mr-2 h-4 w-4" /> Youtubeチャンネル
                  </Button>
                </Link>
              </div>
              <div className="p-4 rounded-lg shadow bg-[#3E4E5A]">
                <h3 className="font-bold mb-2 text-[#C7CCCF]">科学はすべてを解決する!!ニコニコ秘密基地</h3>
                <div className="aspect-video mb-2">
                  <img
                    src="/images/niconico.jpeg"
                    alt="ニコニコチャンネルサムネイル"
                    className="w-full h-full object-cover rounded"
                    loading="lazy"
                  />
                </div>
                <a href="https://ch.nicovideo.jp/kagaku-kaiketu" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-[#CEA17A] hover:bg-[#B69D74] text-[#1F2839]">
                  <Tv className="mr-2 h-4 w-4" />
                    ニコニコチャンネル
                  </Button>
                </a>
              </div>
              <a href="https://twitter.com/ringo_yakuri" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-[#C7CCCF] hover:bg-[#BFC1C6] text-[#2C3A45]">
                  <Twitter className="mr-2 h-4 w-4" /> Twitter
                </Button>
              </a>
              <a href="https://bsky.app/profile/ringoyakuri.bsky.social" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-[#C7CCCF] hover:bg-[#BFC1C6] text-[#2C3A45]">
                <Bird className="mr-2 h-4 w-4" />
                  Bluesky
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
        </div>
      </main>
      
      <footer className="bg-gradient-to-r from-[#2C3A45] to-[#3E4E5A] py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#C7CCCF]">
            &copy; 2024 倫獄. All rights reserved
            <a 
              href="https://www.youtube.com/@ringowarehouse" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ml-1 text-[#C7CCCF] hover:text-[#CEA17A] transition-colors duration-300"
              aria-label="Hidden link"
            >
              .
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}