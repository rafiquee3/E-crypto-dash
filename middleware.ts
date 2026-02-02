import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Global Middleware for Handling CORS and other Request-level security.
 * In Next.js App Router, this is the most efficient place to handle CORS for all API routes.
 */

// List of allowed origins for CORS.
// In production, this should be restricted to your domain only.
const allowedOrigins = [
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  'https://your-production-domain.com', // Replace with your actual domain
];

export function middleware(request: NextRequest) {
  // We only care about API routes for CORS
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const origin = request.headers.get('origin');

  // Check if the origin is allowed
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  // 1. Handle Preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    if (isAllowedOrigin) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          // X-Requested-With is used by libraries like jQuery/Axios to identify AJAX requests
          // and helps with basic CSRF protection.
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
        },
      });
    }
    // If origin not allowed, we could return 403 or just proceed to let standard CORS block it
    return new NextResponse('CORS Not Allowed', { status: 403 });
  }

  // 2. Handle simple and complex requests (GET, POST, etc.)
  const response = NextResponse.next();

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    // Allow common headers including X-Requested-With for AJAX request identification
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

// Specify the paths this middleware should run on
export const config = {
  matcher: '/api/:path*',
};
