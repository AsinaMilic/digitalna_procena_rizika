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

  // Handle Azure's reverse proxy and port configuration + CORS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Changed from DENY to allow embedding
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // CORS headers - very permissive
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Allow all origins
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: '*', // Allow all headers
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // 24 hours
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          // Extra permissive CORS for API routes
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization, Accept, Origin, User-Agent, DNT, Cache-Control, X-Mx-ReqToken, Keep-Alive, X-Requested-With, If-Modified-Since',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
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
