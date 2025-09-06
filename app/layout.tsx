import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const siteUrl = process.env.SITE_URL || "http://localhost:3000";

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
<<<<<<< HEAD
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    title: '倫獄のポートフォリオ',
    description:
      '薬理凶室に所属する法律怪人倫獄のこれまでのお仕事とお仕事のお知らせ',
    locale: 'ja_JP',
    siteName: '倫獄のポートフォリオ',
  },
  twitter: {
    card: 'summary_large_image',
    title: '倫獄のポートフォリオ',
    description:
      '薬理凶室に所属する法律怪人倫獄のこれまでのお仕事とお仕事のお知らせ',
=======
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
>>>>>>> 24d3bd1a0c090f1d10fca1c937f726c1a4de1460
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
