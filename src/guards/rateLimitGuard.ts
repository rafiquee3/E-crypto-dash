import { NextResponse } from 'next/server';
import { marketsRateLimit, getClientIdentifier } from '@/lib/rateLimit';
export type RateLimitResult =
  | { success: true; limit: number; remaining: number; reset: number }
  | { success: false; response: NextResponse };

export async function checkRateLimit(
  request: Request
): Promise<RateLimitResult> {
  const clientId = getClientIdentifier(request);

  try {
    const result = await marketsRateLimit.limit(clientId);
    if (!result.success) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter,
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': String(result.limit),
              'X-RateLimit-Remaining': String(result.remaining),
              'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
              'Retry-After': String(retryAfter),
            },
          }
        ),
      };
    }

    return {
      success: true,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Rate limiting error (Redis failure):', error);
/*     return {
      success: true, // Allow api CoinGecko call
      limit: 0,
      remaining: 0,
      reset: Date.now(),
    }; */

    return {
      success: false, // Stop api call
      response: NextResponse.json(
          { error: 'Service temporary degraded', message: 'System under maintenance, please try again later' },
          { status: 503 } // 503 Service Unavailable
        )
    };
  }
}
