import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Redis client configuration
 *
 * Requires environment variables:
 * - UPSTASH_REDIS_REST_URL: Your Upstash Redis REST API URL
 * - UPSTASH_REDIS_REST_TOKEN: Your Upstash Redis REST API token
 *
 * For local development without Upstash, you can use a local Redis instance
 * or mock the rate limiter (see documentation).
 */
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limiter for general API endpoints (read operations)
 *
 * Configuration:
 * - 100 requests per minute per identifier (IP address or user ID)
 * - Uses sliding window algorithm for smooth rate limiting
 * - Analytics enabled for monitoring
 *
 * Usage:
 * ```typescript
 * const { success, limit, remaining, reset } = await apiRateLimit.limit(identifier);
 * ```
 */
export const apiRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    analytics: true,
    prefix: '@upstash/ratelimit/api',
});

/**
 * Rate limiter for markets endpoint specifically
 *
 * Configuration:
 * - 60 requests per minute per IP address
 * - More restrictive than general API limit to protect external API calls
 * - Prevents excessive calls to CoinGecko API
 *
 * Usage:
 * ```typescript
 * const { success, limit, remaining, reset } = await marketsRateLimit.limit(ip);
 * ```
 */
export const marketsRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
    analytics: true,
    prefix: '@upstash/ratelimit/markets',
});

/**
 * Rate limiter for write operations (data modification endpoints)
 *
 * Configuration:
 * - 10 requests per minute per identifier
 * - Very restrictive to prevent abuse of write operations
 *
 * Usage:
 * ```typescript
 * const { success, limit, remaining, reset } = await writeRateLimit.limit(identifier);
 * ```
 */
export const writeRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
    analytics: true,
    prefix: '@upstash/ratelimit/write',
});

/**
 * Helper function to extract client identifier from request
 *
 * Priority:
 * 1. X-Real-IP: Set by many modern proxies (e.g. Vercel) as the actual client IP.
 * 2. X-Forwarded-For: Takes the first IP in the chain (may be spoofable without trusted proxy).
 * 3. Fallback to 'unknown' which applies a global rate limit.
 *
 * @param request - Next.js Request object
 * @returns Client identifier string (IP address)
 */
export function getClientIdentifier(request: Request): string {
    // This header is set by many servers (e.g., Nginx). If present, it is usually the most
    // reliable and "clean" (containing only a single IP address).
    // For specific platforms:
    // Cloudflare: CF-Connecting-IP
    // Vercel: x-real-ip or x-vercel-proxied-for
    // Akamai/Fastly: True-Client-IP
    const realIp = request.headers.get('x-real-ip');
    if (realIp) return realIp.trim();

    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        // X-Forwarded-For can contain multiple IPs, take the first one (original client)
        return forwarded.split(',')[0].trim();
    }

    // Fallback: try to get IP from request (may not be available in all environments)
    // Note: In Next.js App Router, request.ip might not be available
    // You may need to use middleware to extract IP properly

    // 'unknown' - as a final fallback, which allows applying a global limit for unidentified clients instead of blocking them.
    return 'unknown';
}
