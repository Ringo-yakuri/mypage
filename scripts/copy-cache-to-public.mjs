// next build の前処理として、コミット済みキャッシュをクライアント取得用に
// public/data/ へコピーする。git 管理ファイルは変更しない(冪等)。
import { copyFile, mkdir } from "fs/promises";
import path from "path";

const rootDir = process.cwd();
const src = path.join(rootDir, "data", "youtube-videos.json");
const destDir = path.join(rootDir, "public", "data");

await mkdir(destDir, { recursive: true });
await copyFile(src, path.join(destDir, "youtube-videos.json"));
console.log("Copied data/youtube-videos.json to public/data/.");
