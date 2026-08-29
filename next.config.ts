import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'salaf.maschandigital.id',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
