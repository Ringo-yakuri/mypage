/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // 静的エクスポートのため Next.js の画像最適化は使わない
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
