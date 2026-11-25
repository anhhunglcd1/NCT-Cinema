import type { NextConfig } from "next";

// Backend Spring Boot chỉ lắng nghe 127.0.0.1 (không dùng "localhost" vì Node có thể phân giải sang ::1).
const BACKEND_URL = (process.env.BACKEND_URL ?? "http://127.0.0.1:8080").replace(/\/$/, "");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
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
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
    ];
  },
};

export default nextConfig;
