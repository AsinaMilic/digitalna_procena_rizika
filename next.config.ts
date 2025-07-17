import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Azure deployment
  compress: true,
  poweredByHeader: false,

  // Reduce build output
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  // Output configuration for better Azure compatibility
  output: 'standalone',

  // Handle Azure's reverse proxy and port configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Ensure proper asset handling
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',

  // Optimize for serverless/container environments
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
  
  // External packages for server components
  serverExternalPackages: ['mssql'],
};

export default nextConfig;
