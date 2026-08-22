import type { NextConfig } from "next";

const API_ORIGIN = process.env.API_ORIGIN || "http://127.0.0.1:5000";
const PUBLIC_API = process.env.NEXT_PUBLIC_API_URL || "";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    // Live: call API via NEXT_PUBLIC_API_URL directly (no rewrite).
    // Local: proxy /api → Express when NEXT_PUBLIC_API_URL is empty.
    if (PUBLIC_API) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
