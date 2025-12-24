import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Next.js 16: Enable React Compiler for automatic memoization optimization
  reactCompiler: true,
  
  // Next.js 16: Cache Components (disabled for now - requires Suspense boundaries)
  // Enable when ready: cacheComponents: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  
  // Turbopack is now the default bundler in Next.js 16
  turbopack: {
    rules: {
      "*.mjs": {
        loaders: [],
        as: "*.js",
      },
    },
  },
  
  // Enable Turbopack file system caching for faster dev rebuilds
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default withNextIntl(nextConfig);
