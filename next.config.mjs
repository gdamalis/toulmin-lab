/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["firebasestorage.googleapis.com", "lh3.googleusercontent.com"], // In case we want to show images from Firebase Storage
  },
  turbopack: {
    rules: {
      "*.mjs": {
        loaders: [], // Empty array, as we're just changing the type
        as: "*.js", // This indicates to treat .mjs files as JavaScript
      },
    },
  },
  webpack: (config) => {
    // This is to make React Flow work with Next.js
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });
    return config;
  },
};

export default nextConfig;
