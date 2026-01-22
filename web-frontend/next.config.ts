import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**'
        },
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com'
        },
        {
          protocol: 'https',
          hostname: 'hivvy-backend.s3.eu-west-1.amazonaws.com'
        },
        {
          protocol: 'https',
          hostname: 'raw.githubusercontent.com'
        }
      ]
    }

};

export default nextConfig;
