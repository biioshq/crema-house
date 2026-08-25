import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    // AVIF first — roughly 25% smaller than WebP on these dark, grainy photographs.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [400, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [160, 220, 320, 420],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'motion', '@react-three/drei'],
  },

  async headers() {
    return [
      {
        // The videos are content-stable and unhashed; cache them hard but
        // leave a revalidation window so a re-export is picked up.
        source: '/media/:file*.mp4',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
};

export default nextConfig;
