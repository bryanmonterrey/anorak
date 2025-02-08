import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      events: require.resolve('events/'),
      path: require.resolve('path-browserify'),
      'rpc-websockets': false
    };
    config.externals = [...(config.externals || []), { ws: 'ws' }];
    config.resolve.alias = {
      ...config.resolve.alias,
      'rpc-websockets': false
    };
    return config;
  },
  serverExternalPackages: ['@lightprotocol/zk.js', 'ws']
};

export default nextConfig;