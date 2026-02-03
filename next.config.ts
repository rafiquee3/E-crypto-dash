import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from "next";

const securityHeaders = [
  // CSP
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:;
      style-src 'self' 'unsafe-inline';
      img-src 'self' https://assets.coingecko.com https://coin-images.coingecko.com data: blob:;
      font-src 'self';
      connect-src 'self' https://api.coingecko.com https://api.frankfurter.app wss://ws.coincap.io https://*.sentry.io;
      worker-src 'self' blob:;
      child-src 'self' blob:;
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

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "sokolowski",

  project: "javascript-nextjs",

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
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
