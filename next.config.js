// next.config.js
//
// Enterprise-Grade Red Planet Next.js Configuration (Tesla / Apple / SpaceX Scale)
// Founders: Deblaq & Win | Core Architecture & Engineering: Deblaq
// Enforces strict type safety, Vercel Blob storage wildcards, 50MB lossless audio body limits,
// advanced security headers (HSTS, CSP, X-Frame-Options), and optimized asset pipelines.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // PROFESSIONAL GRADE: Enforce strict type safety and linting for production readiness.
  // No hidden shortcuts or silent failures across the Red Planet network.
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Elite Image Pipeline: Allowlist trusted external storage, media origins, and Vercel Blob cloud buckets.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.nasa.gov',
      },
      {
        // Vercel Blob storage wildcard for @vercel/blob uploads (album art, cover assets, master audio storage).
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // High-Performance Asset Delivery & Security Obfuscation
  compress: true,
  poweredByHeader: false, // Strips Next.js footprint for security obfuscation

  experimental: {
    serverActions: {
      // Raised to 50mb to accommodate lossless high-fidelity audio (FLAC/WAV) and rich media payloads from admin uploads.
      bodySizeLimit: '50mb',
    },
  },

  // Tesla & Apple Standard Security Shield, CSP & Permissions Policy Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://images.unsplash.com https://api.nasa.gov https://*.public.blob.vercel-storage.com",
              "media-src 'self' blob: https://*.public.blob.vercel-storage.com",
              "connect-src 'self' https://*.public.blob.vercel-storage.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;