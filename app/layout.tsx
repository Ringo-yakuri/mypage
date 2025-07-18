import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "倫獄のポートフォリオ",
  description: "薬理凶室に所属する法律怪人倫獄のこれまでのお仕事とお仕事のお知らせ",
  openGraph: {
    title: "倫獄のポートフォリオ",
    description:
      "薬理凶室に所属する法律怪人倫獄のこれまでのお仕事とお仕事のお知らせ",
    url: "https://example.com",
    images: [
      {
        url: "/images/avatar.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "倫獄のポートフォリオ",
    description:
      "薬理凶室に所属する法律怪人倫獄のこれまでのお仕事とお仕事のお知らせ",
    images: ["/images/avatar.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
