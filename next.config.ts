import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
      },
    ],
  },
  async headers() {
    return [
      {
        // Long-lived cache for the static carousel assets in /public/home-page.
        // These are served directly (images are `unoptimized`), so caching them
        // stops mobile browsers from refetching on every navigation, which is
        // what caused blank repaints / flicker.
        source: "/home-page/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
