import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
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
