import { CoinGeckoAdapter } from "@/adapters/adapters/CoinGeckoAdapter";
import { checkRateLimit } from "@/guards/rateLimitGuard";
import { validateGlobalParams, validateMarketParams } from "@/guards/validationGuard";
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { unstable_cache } from 'next/cache';

const getValidatedGlobalData = unstable_cache(
  async (currency: string) => {
    console.log('[CACHE MISS]: Fetching Global Data from CoinGecko and validating with Yup...');
     const adapter = new CoinGeckoAdapter(process.env.COINGECKO_API_KEY_SECRET!);
     return await adapter.fetchGlobalData(currency);
  },
  ['global-market-data'],
  { revalidate: 60, tags: ['global-markets'] }
);

export async function GET(req: Request) {
    const rateLimitResult = await checkRateLimit(req);
    const startTime = Date.now();

    if (!rateLimitResult.success) {
        return rateLimitResult.response;
    }

    const url = new URL(req.url);
    const validationResult = await validateGlobalParams(url.searchParams);

    if (!validationResult.success) {
        return validationResult.response;
    }

    const currency = validationResult.data.currency;

    try {
        const data = await getValidatedGlobalData(currency);
        const duration = Date.now() - startTime;

        if (duration < 10) {
            console.log(`[GLOBAL CACHE HIT - Global]: Response served in ${duration}ms`);
        } else {
            console.log(`[GLOBAL DATA FRESH - Global]: Request completed in ${duration}ms`);
        }

        const dataString = JSON.stringify(data);
        const etag = crypto.createHash('sha256').update(dataString).digest('hex');
        const ifNoneMatch = req.headers.get('if-none-match');

        if (ifNoneMatch === etag) {
            return new Response(null, { status: 304 });
        }

        const response = new NextResponse(dataString, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
                'ETag': etag
            }
        });

        response.headers.set('X-RateLimit-Limit', String(rateLimitResult.limit));
        response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
        response.headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimitResult.reset / 1000)));
        return response;
    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json(
        { error: 'Internal Server Error', message: 'An error occurred while processing your request.' },
        { status: 500 }
        );
    }
}
