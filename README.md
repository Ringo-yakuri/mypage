# 倫獄のポートフォリオ (ringosensei.com)

Next.js 14 (App Router) の完全静的サイト。YouTube 再生リストの出演動画一覧を表示する1ページ構成で、Netlify から配信される。

## アーキテクチャ

```
GitHub Actions (毎日 04:17 JST)
  └─ refresh-youtube.yml
       ├─ YouTube Data API v3 から再生リストを取得 (--strict: 失敗したら workflow が落ちる)
       ├─ data/youtube-videos.json に差分があれば commit & push
       └─ 変更があった場合のみ Netlify Build Hook を POST
            └─ Netlify: npm run build → out/ を配信
```

- **データの単一情報源は `data/youtube-videos.json`(git 管理)。** ビルドは API を叩かず、コミット済みのこのファイルを読むだけ。`npm run build` を何度実行しても git は汚れない。
- 動画データは全件ビルド時にページへ埋め込まれる。クライアントからの追加 fetch はない(「もっと見る」は表示件数を増やすだけ)。
- データ取得に失敗した日は workflow が失敗として通知され、サイトは前日のデータのまま保たれる。

## 動画の表示順

1. プレイリスト定義順(YouTube 上の並び順)を基準とする。
2. ただし公開日が最新の動画 **2本** を常に先頭に固定する(2本の間は新しい順)。
3. 公開日が不正な動画はピン対象から除外し、プレイリスト順の位置に残す。

実装は `scripts/youtube-cache-lib.mjs` の `sortVideos()`。並べ替えはキャッシュ生成時に行い、JSON には表示順のまま保存する(フロントは並び替えない)。

## 主要ファイル

| パス | 役割 |
|------|------|
| `scripts/sync-youtube-cache.mjs` | YouTube API からの取得と `data/youtube-videos.json` の書き込み(I/O) |
| `scripts/youtube-cache-lib.mjs` | 整形・並べ替え・バリデーションの純粋関数(ユニットテスト対象) |
| `lib/youtube-cache.ts` | ビルド時にキャッシュ JSON を読み込み・検証する(server-only) |
| `app/page.tsx` | トップページ(SSG)。JSON-LD(CollectionPage + VideoObject)も出力 |
| `components/YouTubeVideos.tsx` | 動画セクション(server component) |
| `components/VideosClient.tsx` | 「もっと見る」の表示件数制御(client component) |
| `types/video.ts` | `VideoItem` 型 |

## 環境変数

`cp .env.local.example .env.local` して値を設定する(git 管理外)。

- `YOUTUBE_API_KEY`: YouTube Data API v3 の API キー(ビルドには不要。`refresh:youtube` 実行時のみ使用)
- `YOUTUBE_PLAYLIST_ID`: 対象の再生リスト ID
- `MAX_VIDEOS`: 取得上限(任意、デフォルト 100)
- `SITE_URL`: サイトのフル URL(metadata 用)

## 開発

```bash
npm ci
npm run dev              # 開発サーバー (コミット済みキャッシュで動く。API キー不要)
npm run refresh:youtube  # 動画データを手動更新 (.env.local の API キーを使用)
npm run lint
npx tsc --noEmit
npm test                 # scripts/ の純粋関数のユニットテスト (node:test)
npm run build            # 静的ビルド → out/ (git を汚さない)
```

Node 20 を使用(`.nvmrc` / `engines.node`)。

## デプロイと定期更新

- **Netlify**: `netlify.toml` の `npm run build` で `out/` を公開。ビルドに YouTube API キーは不要。
- **GitHub Actions**:
  - `ci.yml` — push/PR ごとに lint / typecheck / test / build。
  - `refresh-youtube.yml` — 毎日 04:17 JST にデータ更新。手動実行も可(workflow_dispatch)。

### 必要なリポジトリ設定(GitHub)

- Secrets: `YOUTUBE_API_KEY`, `YOUTUBE_PLAYLIST_ID`, `NETLIFY_BUILD_HOOK_URL`
- Variables(任意): `MAX_VIDEOS`

### Netlify 側の注意

- リポジトリ連携の auto-deploy が有効な場合、refresh workflow の push と Build Hook で同日に2回ビルドされることがある。気になる場合はどちらか一方を止める。
- ビルドが API を叩かなくなったため、Netlify の環境変数 `YOUTUBE_API_KEY` / `YOUTUBE_PLAYLIST_ID` と `netlify.toml` の `SECRETS_SCAN_OMIT_KEYS` は削除してよい(環境変数を消した後に `SECRETS_SCAN_OMIT_KEYS` を消すこと)。

## キャッシュ JSON のスキーマ (v1)

```jsonc
{
  "schemaVersion": 1,
  "updatedAt": "2026-06-12T00:00:00.000Z",
  "playlistUrl": "https://www.youtube.com/playlist?list=...",
  "totalViews": 19388893,
  "videos": [
    {
      "id": "j8KGWiNi0vs",
      "title": "...",
      "publishedAt": "2026-04-29T10:00:07Z",
      "thumbnailUrl": "https://i.ytimg.com/vi/.../maxresdefault.jpg",
      "url": "https://www.youtube.com/watch?v=...",
      "viewCount": 67947
    }
  ]
}
```

## ビルドイメージと Node バージョン

- Netlify ビルドイメージ: Ubuntu 24.04 Noble(`netlify.toml` の `image = "noble"`)
- Node: 20.x(`package.json` の `engines.node`。ローカルは `nvm use 20` など)
