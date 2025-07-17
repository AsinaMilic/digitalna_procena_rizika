import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Azure deployment
  compress: true,
  poweredByHeader: false,
  
  // Optimize bundle size
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
  
  // Reduce build output
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  
  // Handle Azure's reverse proxy
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
};

export default nextConfig;
