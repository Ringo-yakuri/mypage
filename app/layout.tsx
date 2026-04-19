import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

function resolveSiteUrl() {
  const fallback =
    process.env.NODE_ENV === "production"
      ? "https://ringosensei.com"
      : "http://localhost:3000";
  const raw = (process.env.SITE_URL || "").trim();
  if (!raw) return fallback;

  try {
    const parsed = new URL(raw);
    if (!/^https?:$/.test(parsed.protocol)) return fallback;
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

const siteUrl = resolveSiteUrl();

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
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/images/sigil-faithful.svg", type: "image/svg+xml" },
      { url: "/images/sigil-faithful.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/images/sigil-faithful.png" }],
  },
  openGraph: {
    type: 'website',
    title: '倫獄のポートフォリオ',
    description:
      '薬理凶室に所属する法律怪人倫獄のこれまでのお仕事とお仕事のお知らせ',
    locale: 'ja_JP',
    siteName: '倫獄のポートフォリオ',
    url: siteUrl,
    images: ['/images/avatar.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '倫獄のポートフォリオ',
    description:
      '薬理凶室に所属する法律怪人倫獄のこれまでのお仕事とお仕事のお知らせ',
    images: ['/images/avatar.png'],
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
