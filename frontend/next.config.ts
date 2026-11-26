import type { NextConfig } from "next";

// Backend Spring Boot chỉ lắng nghe 127.0.0.1 (không dùng "localhost" vì Node có thể phân giải sang ::1).
const BACKEND_URL = (process.env.BACKEND_URL ?? "http://127.0.0.1:8080").replace(/\/$/, "");
// Ảnh poster trong dữ liệu mẫu có dạng /posters/<file>.jpg (tên file ảnh của TMDB).
const POSTER_BASE_URL = (process.env.POSTER_BASE_URL ?? "https://image.tmdb.org/t/p/w500").replace(/\/$/, "");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // Cho phép mở dev server bằng http://127.0.0.1:3000 (mặc định Next chỉ cho localhost).
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      // Trình duyệt luôn gọi /api cùng origin -> cookie phiên + CSRF hoạt động mà không cần CORS.
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      { source: "/posters/:file", destination: `${POSTER_BASE_URL}/:file` },
    ];
  },
};

export default nextConfig;
