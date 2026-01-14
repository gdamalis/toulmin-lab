import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

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

// Wrap with plugins
const configWithIntl = withNextIntl(nextConfig);

// Wrap with Sentry (only in production to avoid overhead in dev)
export default process.env.NODE_ENV === 'production'
  ? withSentryConfig(configWithIntl, {
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options

      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      tunnelRoute: '/monitoring',

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Webpack-specific options
      webpack: {
        // Automatically tree-shake Sentry logger statements to reduce bundle size
        treeshake: {
          removeDebugLogging: true,
        },
        // Enables automatic instrumentation of Vercel Cron Monitors
        automaticVercelMonitors: true,
        // Automatically annotate React components to show their full name in breadcrumbs and session replay
        reactComponentAnnotation: {
          enabled: true,
        },
      },
    })
  : configWithIntl;
