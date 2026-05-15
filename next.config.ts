import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.heinetwork.tv",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "heinetwork.tv",
        pathname: "/wp-content/**",
      },
    ],
  },
};

export default nextConfig;
