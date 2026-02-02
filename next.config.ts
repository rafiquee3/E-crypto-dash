import type { NextConfig } from "next";

const securityHeaders = [
  // CSP
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' https://assets.coingecko.com https://coin-images.coingecko.com data: blob:;
      font-src 'self';
      connect-src 'self' https://api.coingecko.com https://api.frankfurter.app wss://ws.coincap.io;
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim()
  },
  // Clickjacking protection
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  // MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  // Referrer
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  // HSTS
  {
    key: 'Strict-Transport-Security',

    // Enforce HTTPS for the next year (31536000 seconds).
    value: 'max-age=31536000; includeSubDomains'
  },
  {
    key: 'Permissions-Policy',

    // Disable unused browser features for enhanced privacy and security.
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
