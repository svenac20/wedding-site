import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  images: {
    // Serve modern, much smaller formats sized to the device. This is the main
    // fix for mobile carousel flicker: phones download/decode far fewer bytes
    // instead of the full-resolution source JPEGs.
    formats: ["image/avif", "image/webp"],
    // Cache optimized images aggressively so navigating the carousel doesn't
    // refetch them on mobile (which caused blank repaints / flicker).
    minimumCacheTTL: 60 * 60 * 24 * 30,
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
