import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      '@noble/ed25519': '@noble/ed25519/esm/index.js',
    };
    return config;
  },
};

export default nextConfig;
