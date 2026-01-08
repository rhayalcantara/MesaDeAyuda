/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Static export configuration for IIS deployment
  output: 'export',

  // Disable image optimization for static export (not supported)
  images: {
    unoptimized: true,
  },

  // Trailing slash for cleaner static file paths
  trailingSlash: true,

  // Base path - set if deploying to a subdirectory (e.g., '/mdayuda')
  // basePath: '/mdayuda',

  // Note: rewrites are not available in static export mode
  // API calls should use the full backend URL or be proxied by IIS

  // Skip type checking during build (handled separately)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Skip linting during build (handled separately)
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
