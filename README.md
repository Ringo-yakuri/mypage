This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## YouTube 再生リストからの静的生成

本プロジェクトは、ビルド時に YouTube Data API v3 から再生リスト内の動画情報を取得し、トップページでカード一覧として静的表示します。ページ表示時の API コールは行いません（SSG）。

### 環境変数（.env.local）

1. ルートの `.env.local.example` を `.env.local` にコピー
2. 必要な値を入力してください（Git 管理外）

`.env.local.example` の項目:
- `YOUTUBE_API_KEY`: YouTube Data API v3 の API キー
- `YOUTUBE_PLAYLIST_ID`: 対象の再生リスト ID
- `MAX_VIDEOS`: 取得上限（任意、デフォルト100）
- `SITE_URL`: サイトのフル URL（例: https://your-domain.com）

API キーはクライアントに露出しないよう `NEXT_PUBLIC_` 接頭辞は付けません。ビルド時のみ使用します。

### 実装の要点

- 取得処理: `lib/youtube.ts`（server-only）
- 型定義: `types/video.ts`
- UI: `components/VideoCard.tsx`, `components/YouTubeVideos.tsx`
- 一覧描画: `app/page.tsx`（SSG, `dynamic = 'force-static'`）
- 画像ドメイン: `next.config.mjs` で `i.ytimg.com` などを許可

### 表示順序

- プレイリストの定義順（YouTube上の並び順）をそのまま採用します。
- 並び替えは行っていないため、YouTube側で順序を変更すれば、再デプロイ時に同じ順序で反映されます。

### 50件超の対応

YouTube API のページネーション（`nextPageToken`）を辿って最大 50 件/ページで収集します。`MAX_VIDEOS` で全体の上限を制御できます。

### SEO 方針

- `app/layout.tsx` の `metadata` で基本メタと OpenGraph/Twitter を設定
- `app/page.tsx` で JSON-LD（CollectionPage + VideoObject）を埋め込み

## Vercel へのデプロイ

1. リポジトリを GitHub 等へ push し、Vercel で「New Project」→ インポート
2. Project Settings → Environment Variables に以下を追加
   - `YOUTUBE_API_KEY`
   - `YOUTUBE_PLAYLIST_ID`
   - `MAX_VIDEOS`（任意）
3. Build Command はデフォルト（`next build`）
4. 再生リストを更新したら、再デプロイ（Deploy Hooks を使えば自動化可）

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
