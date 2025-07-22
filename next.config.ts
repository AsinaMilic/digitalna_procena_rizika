import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed standalone for Azure compatibility
  poweredByHeader: false,
  
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
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  serverExternalPackages: ['pg'],
};

export default nextConfig;
