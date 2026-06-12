# リファクタリング計画: YouTube データフローの一本化とサイト全体の健全化

実装担当AI向けの自己完結型ドキュメント。このリポジトリの事前知識なしで読めるよう、現状・問題点・フェーズ別作業・受け入れ基準をすべて記載する。**フェーズ順に、1フェーズ = 1 PR で進めること。** 各フェーズは独立して動作する状態で完結させる。

---

## 0. 前提: 現状アーキテクチャ

- Next.js 14 (App Router) + `output: 'export'` による完全静的サイト。Netlify にデプロイ(`netlify.toml`, publish = `out/`)。
- ページは1枚のみ: `app/page.tsx`(`force-static`)。ポートフォリオサイトで、YouTube プレイリストの出演動画一覧を表示する。
- YouTube データの流れ:
  1. `npm run build` = `node scripts/sync-youtube-cache.mjs && next build`
  2. `scripts/sync-youtube-cache.mjs` が YouTube Data API v3(playlistItems + videos.list)を叩き、`data/youtube-videos.json`(git管理)と `public/data/youtube-videos.json`(gitignore)の **2か所** に同一JSONを書き込む。API失敗時は既存スナップショットを読み戻して続行(サイレントフォールバック)。
  3. `app/page.tsx` が `lib/youtube-cache.ts` 経由で `data/youtube-videos.json` を読み、先頭4件を `components/YouTubeVideos.tsx` → `components/VideosClient.tsx` に渡す。
  4. `VideosClient.tsx`(client component)がマウント直後に `/data/youtube-videos.json` を fetch して全件を取得し、「もっと見る」ボタンで表示件数を増やす。
- 日次更新: `.github/workflows/netlify-daily-build.yml` が毎日 Netlify Build Hook を POST → Netlify がビルド時に API から再取得して再デプロイ。
- 環境変数: `YOUTUBE_API_KEY`, `YOUTUBE_PLAYLIST_ID`, `MAX_VIDEOS`, `SITE_URL`(ローカルは `.env.local`、Netlify は環境変数設定)。

## 1. 特定済みの問題点(根拠ファイル付き)

### YouTube 周り(優先)

| # | 問題 | 場所 |
|---|------|------|
| P1 | **フェッチロジックの二重実装**。`lib/youtube.ts` と `scripts/sync-youtube-cache.mjs` がほぼ同一のロジック(playlistItems ページング、サムネ選択、viewCount 取得、ソート)を TS / JS で重複保持。しかも `lib/youtube.ts` の `getPlaylistVideos` は **どこからも import されていない死にコード** | `lib/youtube.ts`, `scripts/sync-youtube-cache.mjs` |
| P2 | **ビルドが git 管理ファイルを毎回書き換える**。viewCount は毎ビルド変化するため、`npm run build` するたびに `data/youtube-videos.json` が dirty になる。git 履歴に "Update youtube-videos.json" 等の手動コミットが多数あり、現在も未コミット差分が存在する。「ビルド」と「データ更新」が分離されていないのが根本原因 | `package.json` の build script |
| P3 | **失敗がサイレント**。sync 失敗時は古いスナップショットで続行し、ビルドは成功する。Netlify の API キー失効・quota 超過に誰も気づけない。本番が最後に成功した日のデータで止まり続ける | `scripts/sync-youtube-cache.mjs:166-175` |
| P4 | **VideosClient の遅延ロード設計が機能していない**。マウント直後の `useEffect` で全件 fetch するため(`VideosClient.tsx:131-133`)、「初期4件+オンデマンド読込」の設計が無意味。さらに (a) fetch 失敗時に失敗結果が `loadAllRef` にキャッシュされ再試行されない、(b) `disabled` 判定が prop の `totalCount` と state の `resolvedTotalCount` を混用(160行)、(c) `public/data/` が無い環境(クリーンclone直後の `npm run dev`)では「もっと見る」を押しても何も起きない | `components/VideosClient.tsx` |
| P5 | **データの二重保存**。`data/`(SSG用・git管理)と `public/data/`(client fetch用・gitignore)で同一JSONを二重管理。乖離リスクと dev での 404 の原因 | `scripts/sync-youtube-cache.mjs:8-11` |
| P6 | **UI コンポーネントが env を直接読む**。`YouTubeVideos.tsx` が module scope で `process.env.YOUTUBE_PLAYLIST_ID` を参照しプレイリストURLを組み立てる。データ層との結合が逆向きで、Netlify の `SECRETS_SCAN_OMIT_KEYS` 回避設定が必要になっている遠因 | `components/YouTubeVideos.tsx:16-19`, `netlify.toml:9` |
| P7 | **表示順の実装がオーナーの意図とずれている**。正しい仕様は README どおり「プレイリスト定義順+最新2本を先頭固定」(オーナー確認済み)。しかし現実装は `publishedAt` 降順ソートのみで、プレイリスト順を捨てている。**これは仕様バグであり、実装側を直す**。その他の README の乖離: `.env.local.example` が存在しない(README はコピーを指示)、デプロイ手順が Vercel 前提(実際は Netlify)、「取得処理: lib/youtube.ts」の記述も誤り | `scripts/sync-youtube-cache.mjs:149`, `README.md` |
| P8 | **入力バリデーション不足**。`MAX_VIDEOS=""` のとき `Number("") === 0` で取得0件になる。キャッシュJSONのスキーマ検証は `readYoutubeCache` の浅いチェックのみで、`videos[]` 要素の形は未検証 | `scripts/sync-youtube-cache.mjs:92`, `lib/youtube-cache.ts:18-34` |
| P9 | **JSON-LD の XSS エスケープ不足**。動画タイトルは外部入力(YouTube)。`JSON.stringify` は `<` をエスケープしないため、タイトルに `</script>` が含まれると script コンテキストを破壊できる。また JSON-LD に `next/script` を使っている(プレーンな `<script>` が推奨) | `app/page.tsx:68` |
| P10 | **.env.local の自前パーサ**。Node 20.6+ の `--env-file` で代替可能 | `scripts/sync-youtube-cache.mjs:28-49` |

### リポジトリ全般

| # | 問題 | 場所 |
|---|------|------|
| R1 | 無関係な実験ファイルがコミット済み(TDnet スクレイピングの残骸、計 ~105KB) | `tdnet_dom.html`, `tdnet_list.html`, `tdnet_text.txt` |
| R2 | CI が存在しない(lint / typecheck / build 検証なし)。日次ビルドトリガーの workflow のみ | `.github/workflows/` |
| R3 | `.gitignore` に謎の `mypage/` エントリ。`next-env.d.ts` を ignore している(Next.js 公式はコミット推奨) | `.gitignore` |
| R4 | `images.unoptimized: true` なのに `remotePatterns` を設定(unoptimized 時は無効なので誤解を招く) | `next.config.mjs` |
| R5 | テストが1本もない。データ層(ソート・整形・バリデーション)は純粋関数化すればユニットテスト可能 | — |

## 2. 設計判断(このプランで採用するデフォルト)

以下はオーナー確認済み、または安全側のデフォルト:

- **D1: 表示順は「プレイリスト定義順+最新2本を先頭固定」を正とする(オーナー確認済み)**。README の記述が正しく、現実装(公開日降順のみ)が間違っている。実装側を修正する。正確な仕様:
  1. playlistItems API の取得順(= YouTube 上のプレイリスト並び順)を基準の並びとする。
  2. 全動画のうち `publishedAt` が最も新しい2本を抽出し、先頭に置く(2本の間は新しい順)。
  3. 残りはプレイリスト順を維持する(抽出された2本は元の位置から取り除く)。
  4. エッジケース: 動画が2本以下なら公開日降順のみ。`publishedAt` が不正な動画はピン対象から除外しプレイリスト順位置に残す。
  - この並べ替えはデータ層(sync スクリプト)で行い、キャッシュ JSON には**表示順そのまま**で保存する。フロントは並び替えをしない。`app/page.tsx` の `videos[0]`(ConnectLinks の最新動画サムネ)はこの仕様なら自動的に最新動画になる点も維持される。
  - ソートは純粋関数 `sortVideos(playlistOrderedVideos)` に隔離し、ユニットテスト対象とする(Phase 5)。
- **D2: 全件埋め込み方式に変更する**。動画は現在60件・JSON 約20KB であり、クライアントからの追加 fetch は不要。全件をビルド時に props として埋め込み、「もっと見る」は純粋なクライアント側スライスにする。これにより P4・P5 が構造ごと消滅する。`MAX_VIDEOS` が 300 件などに増えない限りこの方式で問題ない。
- **D3: データ更新は GitHub Actions に移管し、git を単一の情報源にする**(Phase 4 参照)。Netlify ビルドは「コミット済みデータを読むだけ」の純粋関数になる。
- **D4: 過剰な抽象化はしない**。ページ1枚の静的サイトなので、zod 等の新規依存追加はせず手書きバリデータで足りる。状態管理ライブラリ・データフェッチライブラリも導入しない。

---

## 3. フェーズ別作業計画

### Phase 0: 安全網とクリーンアップ(小・低リスク)

**目的**: 以降のフェーズで回帰を検出できる状態を作る。

1. **CI workflow 追加**: `.github/workflows/ci.yml` を新規作成。push / PR で以下を実行:
   - `npm ci`
   - `npm run lint`
   - `npx tsc --noEmit`
   - `next build` 単体(sync スクリプトを通さず、コミット済み `data/youtube-videos.json` でビルドが通ること)。Phase 2 までは一時的に `node scripts/sync-youtube-cache.mjs` をスキップする手段がないため、`npx next build` を直接呼ぶ。
2. **不要ファイル削除**: `tdnet_dom.html`, `tdnet_list.html`, `tdnet_text.txt` を `git rm`。
3. **`.gitignore` 整理**: `mypage/` エントリを削除。`next-env.d.ts` を ignore から外し、リポジトリにコミットする。
4. **`next.config.mjs`**: `remotePatterns` を削除(`unoptimized: true` のため無効)。コメントで「静的エクスポートのため画像最適化なし」と残す。
5. **`.env.local.example` を新規作成**(値はプレースホルダ):
   ```
   YOUTUBE_API_KEY=your-api-key
   YOUTUBE_PLAYLIST_ID=PLxxxxxxxx
   MAX_VIDEOS=100
   SITE_URL=https://ringosensei.com
   ```

**受け入れ基準**: CI がグリーン。`npx next build` が成功し `out/` が生成される。`git status` がクリーン(ビルド後も)。

---

### Phase 1: データ層の一本化(中・YouTube リファクタの核)

**目的**: フェッチ・整形ロジックを単一実装に統合し、死にコードを排除する(P1, P8, P10)。

1. **`lib/youtube.ts` を削除**(未使用の `getPlaylistVideos`)。`package.json` から不要になる依存はないか確認(`server-only` は `lib/youtube-cache.ts` が引き続き使用)。
2. **`scripts/sync-youtube-cache.mjs` を唯一のフェッチ実装として整理**(JS のままでよい。tsx/ts-node 等の新規依存は追加しない):
   - 純粋関数に分解: `fetchPlaylistItems(key, playlistId, max)` / `fetchViewCounts(key, ids)` / `buildCache(items, viewCounts, now)` / `sortVideos(playlistOrderedVideos)`。
   - **`sortVideos` を D1 の仕様(プレイリスト順+最新2本先頭固定)で実装する**。現在の「公開日降順のみ」のソート(`scripts/sync-youtube-cache.mjs:149` の `ordered`)を置き換える。入力はプレイリスト取得順を保った配列であること(現コードはページング中に取得順で `results` に積んでおり、その順序がプレイリスト順なのでそのまま使える)。
   - `MAX_VIDEOS` のバリデーション: `Number.isInteger(n) && n > 0` でなければデフォルト 100 を使い、警告ログを出す(P8)。
   - 同一 videoId の重複排除を `buildCache` 内で行う(プレイリストに同じ動画が2回入っていても React の key 衝突を起こさない)。**最初の出現位置を残す**(プレイリスト順の保持のため)。
   - 自前 `.env.local` パーサ(`loadLocalEnv`)を削除し、`package.json` のローカル用 script を `node --env-file=.env.local scripts/sync-youtube-cache.mjs` にする。**注意**: Netlify/CI では `.env.local` が存在せず `--env-file` はエラーになるため、`--env-file-if-exists=.env.local`(Node 22+)か、存在チェック付きの2本立て script(`refresh:youtube` ローカル用 / CI 用は素の `node scripts/...`)にする。engines が `20.x` のままなら後者を採用。
   - **`--strict` フラグを追加**: 指定時は API 失敗で exit code 1(フォールバックせず落ちる)。未指定時は現行どおり既存スナップショットで続行。CI/定期更新では `--strict` を使う(P3 の解消は Phase 4)。
3. **キャッシュ JSON のスキーマを v1 として確定**し、`playlistUrl` を追加(P6 の準備):
   ```jsonc
   {
     "schemaVersion": 1,
     "updatedAt": "ISO8601",
     "playlistUrl": "https://www.youtube.com/playlist?list=...",
     "totalViews": 0,
     "videos": [{ "id", "title", "publishedAt", "thumbnailUrl", "url", "viewCount?" }]
   }
   ```
4. **`lib/youtube-cache.ts` のバリデータを強化**: `videos[]` の各要素について `id`/`title`/`publishedAt`/`thumbnailUrl`/`url` が string であることを検証し、不正要素は除外。`playlistUrl` も読み取り(無ければ `null`)。`YoutubeCache` 型を更新。
5. **`types/video.ts` は変更不要**(キャッシュ型は `lib/youtube-cache.ts` 側に置く)。

**受け入れ基準**: `node --env-file=.env.local scripts/sync-youtube-cache.mjs` がローカルで成功し、新スキーマの JSON が出力される。出力 JSON の `videos[0]` と `videos[1]` が全動画中で `publishedAt` の新しい上位2本であり、3件目以降が YouTube 上のプレイリスト並び順と一致する(目視確認)。`npx tsc --noEmit` / lint / build がグリーン。`lib/youtube.ts` が存在しない。

---

### Phase 2: 「ビルド」と「データ更新」の分離(小・効果大)

**目的**: `npm run build` が git 管理ファイルを書き換える問題(P2)を解消する。

1. **`package.json` の scripts を再編**:
   ```jsonc
   {
     "dev": "next dev",
     "build": "next build",                        // データ更新を一切しない
     "refresh:youtube": "node --env-file=.env.local scripts/sync-youtube-cache.mjs",  // ローカル手動更新用
     "refresh:youtube:ci": "node scripts/sync-youtube-cache.mjs --strict",            // CI/定期更新用
     "lint": "next lint"
   }
   ```
2. **`public/data/` への書き込みを sync スクリプトから削除**(P5)。Phase 3 で client fetch 自体を廃止するため、先行して `public/data/youtube-videos.json` への依存を断つ……のは Phase 3 と順序が逆になるので、**このフェーズでは `next build` の前処理として `data/ → public/data/` のコピーだけを行う小さな `prebuild` script を置く**(`"prebuild": "node scripts/copy-cache-to-public.mjs"` 等、10行程度)。コピーは冪等で git 管理ファイルを変更しない。Phase 3 完了後にこのコピー処理ごと削除する。
3. **`netlify.toml` の build command を `npm run build` のまま維持**(中身が変わるだけ)。この時点で Netlify ビルドは API を叩かなくなるため、**デプロイされるデータはコミット済み JSON に固定される**。鮮度は Phase 4 の定期更新が担保する。Netlify 環境変数 `YOUTUBE_API_KEY` / `YOUTUBE_PLAYLIST_ID` と `SECRETS_SCAN_OMIT_KEYS` は Phase 4 完了後に削除可能になる(オーナー作業として PR 説明に明記)。

**受け入れ基準**: `npm run build` を2回連続実行しても `git status` がクリーン。`out/data/youtube-videos.json` が存在する(Phase 3 までの暫定)。`npm run refresh:youtube` 実行時のみ `data/youtube-videos.json` が変化する。

---

### Phase 3: フロントエンドの簡素化(中・P4/P5/P6 の解消)

**目的**: client fetch を廃止して全件埋め込みにし、`VideosClient` のバグ群を構造ごと除去する(D2)。

1. **`app/page.tsx`**:
   - `readYoutubeCache()` の結果から **全件** を `YouTubeVideos` に渡す(`initialVideos`/`totalCount`/`dataUrl` props を廃止し、`videos`/`totalViews`/`playlistUrl` に整理)。
   - JSON-LD は `next/script` をやめてプレーンな `<script type="application/ld+json">` にし、`JSON.stringify(jsonLd).replace(/</g, '\\u003c')` で `<` をエスケープする(P9)。
2. **`components/YouTubeVideos.tsx`**:
   - `process.env.YOUTUBE_PLAYLIST_ID` の参照を削除し、props の `playlistUrl`(キャッシュ由来、`null` なら `https://www.youtube.com` にフォールバック)を使う(P6)。
3. **`components/VideosClient.tsx` を全面書き換え**(推定 ~70行に半減):
   - props: `videos: VideoItem[]`, `initialCount?: number`, `step?: number` のみ。
   - state は `visible`(表示件数)のみ。`fetch` / `loadAllRef` / `latestLoadedAtRef` / `isLoadingAll` / `resolvedTotalCount` をすべて削除。
   - `useColumns` フックは維持してよいが、`baseline` / `safeStep` の補正ロジックは「表示件数を列数の倍数に切り上げる」1つのヘルパー関数に集約し、コメントで意図を書く(過去に修正が繰り返された箇所のため)。
   - 「もっと見る」は `setVisible(v => Math.min(v + step, videos.length))` のみ。ローディング状態は不要になる。
4. **`scripts/sync-youtube-cache.mjs` から `public/data/` 関連を完全削除**し、Phase 2 で置いた `prebuild` コピー script も削除する。`/data/youtube-videos.json` を参照するコードが残っていないことを grep で確認。
5. **`netlify.toml` / `.gitignore`**: `public/data/` の ignore エントリを削除(ディレクトリ自体が消えるため)。

**受け入れ基準**: `npm run build` 後、`out/index.html` に全動画データが RSC ペイロードとして含まれ、`out/data/` は存在しない。ブラウザで(`npx serve out` 等で配信して)「もっと見る」を押すと追加 fetch なしで表示が増える。クリーン clone + `npm run dev` でも全件表示・「もっと見る」が動作する。lint / tsc グリーン。

---

### Phase 4: 自動更新パイプラインの再構築(中・P2/P3 の恒久解決)

**目的**: 「git が単一の情報源、更新は Actions が commit、Netlify は push で自動デプロイ」という単方向フローにする(D3)。

1. **`.github/workflows/refresh-youtube.yml` を新規作成**:
   - トリガー: `schedule`(現行と同じ `cron: "17 19 * * *"` = JST 04:17)+ `workflow_dispatch`。
   - 手順: checkout → Node 20 setup → `npm ci` → `npm run refresh:youtube:ci`(`--strict` なので API 失敗時は workflow が**赤くなる** = P3 解消。GitHub が失敗をメール通知する)→ `data/youtube-videos.json` に差分があれば bot として commit & push(コミットメッセージ例: `chore: refresh YouTube cache`)。
   - 必要な secrets: `YOUTUBE_API_KEY`。`YOUTUBE_PLAYLIST_ID` は秘匿不要だが secrets か workflow env のどちらかに置く(リポジトリ public の場合は vars 推奨)。
   - push 権限: `permissions: contents: write` + デフォルトの `GITHUB_TOKEN` で可。ブランチ保護がある場合は PR 説明で言及。
   - 注意: viewCount は毎日変わるため毎日1コミット発生する。許容する(ポートフォリオサイトの規模では問題にならない)。気になる場合のオプションとして「動画リスト(id 集合・タイトル)に変化がない日は viewCount のみの差分でも commit する/しない」を切り替えられる `--skip-viewcount-only` フラグ案をコメントで残すが、初期実装はシンプルに常時 commit でよい。
2. **`.github/workflows/netlify-daily-build.yml` を削除**し、その役割を refresh workflow に統合する。公開経路は Netlify で確定(オーナー確認済み)だが、リポジトリ連携の auto-deploy が有効かは未確認のため、**安全側に倒して refresh workflow の最後に `NETLIFY_BUILD_HOOK_URL` secret への POST ステップを必ず入れる**(現 workflow の curl をそのまま移植)。auto-deploy も有効だった場合は同一ビルドが2回走るだけで実害はなく、オーナーがどちらかを後から止めればよい(PR 説明に記載)。
3. **PR 説明に「オーナーの手作業」を明記**: (a) GitHub Secrets に `YOUTUBE_API_KEY`(と必要なら `NETLIFY_BUILD_HOOK_URL`)を登録、(b) Netlify 側の環境変数 `YOUTUBE_API_KEY` / `YOUTUBE_PLAYLIST_ID` / `SECRETS_SCAN_OMIT_KEYS` を削除、(c) 初回は `workflow_dispatch` で手動実行して動作確認。

**受け入れ基準**: `workflow_dispatch` での手動実行で、データ更新 → commit → デプロイまで通る。API キーを意図的に壊した実行で workflow が fail する(サイレント成功しない)。

---

### Phase 5: ドキュメントと仕上げ(小)

1. **README 全面改訂**(P7): 実アーキテクチャ(静的エクスポート + Netlify + Actions 定期更新)を反映。
   - データフロー図(Actions → commit → Netlify build → CDN)。
   - 表示順の仕様「プレイリスト定義順+最新2本先頭固定」(D1)は README に既に書かれているので維持し、Phase 1 で実装が追いついたことを確認する。
   - ローカル開発手順: `cp .env.local.example .env.local` → `npm run refresh:youtube`(任意)→ `npm run dev`。
   - Vercel 前提の記述・create-next-app の雛形文・存在しない `.env.local.example` 参照(Phase 0 で実体を作るので整合)を整理。
2. **ユニットテスト導入(任意・推奨)**: `node:test` ランナー(依存追加ゼロ)で `scripts/` の純粋関数(`buildCache`, `sortVideos`, MAX_VIDEOS バリデーション、重複排除)をテスト。`sortVideos` は仕様の核(D1)なので最優先: 「最新2本が先頭」「3件目以降がプレイリスト順」「2本以下」「publishedAt 不正値」の4ケースを必ず含める。`package.json` に `"test": "node --test scripts/"` を追加し、CI に組み込む。
3. **`lib/youtube-cache.ts` のバリデータにもテスト**(壊れた JSON、欠損フィールド、空ファイル)。

**受け入れ基準**: README の手順だけを見て新規環境でセットアップ→ビルドが再現できる。`npm test` グリーン、CI に組み込み済み。

---

## 4. 非ゴール(やらないこと)

- デザイン・配色・レイアウトの変更(クラス名やマークアップは現状維持。VideosClient の書き換えでも描画される DOM 構造は変えない)。
- 新規ランタイム依存の追加(zod、SWR、dotenv 等は不要。D4)。
- Next.js のメジャーアップグレード(14 のまま。別件として扱う)。
- `Updates.tsx` / `Works.tsx` のデータ外部化(ハードコードで問題ない規模)。
- 動画ページの個別生成や検索機能などの新機能。

## 5. 検証コマンド一覧(全フェーズ共通)

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build && git status --short   # 出力が空であること(Phase 2 以降)
npx serve out                          # 手動確認: 動画一覧・もっと見る・プレイリストリンク
node --env-file=.env.local scripts/sync-youtube-cache.mjs   # ローカルにキーがある場合のみ
```

## 6. リスクと注意

- `data/youtube-videos.json` は本番表示の唯一のデータ源になる(Phase 2 以降)。**絶対に空配列で commit しない**こと。sync スクリプトの `--strict` とバリデータ(動画0件なら fail)で保護する。
- Phase 3 で props の形を変えるため、`app/page.tsx` と `components/YouTubeVideos.tsx`・`VideosClient.tsx` は同一 PR で変更すること。
- 公開経路は Netlify で確定(オーナー確認済み)。ただし repo 連携 auto-deploy の有無は未確認のため、Phase 4 では Build Hook POST を残す安全側に倒す。
- Phase 1 の表示順変更により、デプロイ後の動画の並びが現状(公開日降順)から変わる。これは**意図したバグ修正**であり、リグレッションではない(PR 説明に明記すること)。
- 現在未コミットの `data/youtube-videos.json` の差分(viewCount の揺れ)は、Phase 0 着手前に commit するか破棄するかをオーナーに確認。どちらでも以降の作業に影響はない。
