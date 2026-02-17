/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Strip console.log in production (keep in development for debugging)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    unoptimized: false,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = { ...config.resolve.fallback, canvas: false };
    }
    return config;
  },
  // Production-safe: no experimental flags that break Vercel
  poweredByHeader: false,
};

module.exports = nextConfig;
