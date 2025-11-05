/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: ['localhost'],
  },
  // Don't fail build on ESLint warnings (can clean up later)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Don't fail build on TypeScript errors during production builds
  // (We already have type-check in our CI/local development)
  typescript: {
    ignoreBuildErrors: false, // Keep this strict for now
  },
};

module.exports = nextConfig;
