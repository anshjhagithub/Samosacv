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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = { ...config.resolve.fallback, canvas: false };
    }
    // Enable JSON imports for TypeScript
    config.resolve.extensions = [...(config.resolve.extensions || []), '.json'];
    // Reduce large-string serialization in cache (avoids PackFileCacheStrategy warning)
    if (config.cache && typeof config.cache === "object" && config.cache.type === "filesystem") {
      config.cache.compression = false;
    }
    return config;
  },
  poweredByHeader: false,
  ...(process.env.OUTPUT === "standalone" ? { output: "standalone" } : {}),
  compress: true,
  async headers() {
    return [
      { source: "/_next/static/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

module.exports = nextConfig;
