import { CoinGeckoAdapter } from "@/adapters/adapters/CoinGeckoAdapter";
import { checkRateLimit } from "@/guards/rateLimitGuard";
import { validateMarketParams } from "@/guards/validationGuard";
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { unstable_cache } from 'next/cache';

const adapter = new CoinGeckoAdapter(process.env.COINGECKO_API_KEY_SECRET!);

// Unstable cache also caches the result of expensive validation with Yup.
const getValidatedMarkets = unstable_cache(
  async (params) => {
     console.log('[CACHE MISS]: Fetching from CoinGecko and validating with Yup...');
     const adapter = new CoinGeckoAdapter(process.env.COINGECKO_API_KEY_SECRET!);

     return await adapter.fetchMarketData(params);
  },
  ['markets-cache-key'],
  { revalidate: 60, tags: ['markets'] }
);

export async function GET(req: Request) {
    const rateLimitResult = await checkRateLimit(req);
    const startTime = Date.now();

    if (!rateLimitResult.success) {
        return rateLimitResult.response;
    }

    const url = new URL(req.url);
    const validationResult = await validateMarketParams(url.searchParams);

    if (!validationResult.success) {
        return validationResult.response;
    }

    try {
        const data = await getValidatedMarkets(validationResult.data);
        const duration = Date.now() - startTime;

        if (duration < 10) {
            console.log(`[CACHE HIT]: Response served in ${duration}ms`);
        } else {
            console.log(`[DATA FRESH]: Request completed in ${duration}ms`);
        }

        /*
            The "ETag" headers allow a client to ask the server if there is a newer version of a resource compared
            to what it currently has. If the data hasn't been updated since, the data isn't fetched again, saving on transfer efficiency.
        */
        const dataString = JSON.stringify(data);

        const etag = crypto
            .createHash('md5')
            .update(dataString)
            .digest('hex');

        const ifNoneMatch = req.headers.get('if-none-match');

        if (ifNoneMatch === etag) {
            // 304 Not Modified
            return new Response(null, { status: 304 });
        }

        /* ---Cdn cache---
            stale-while-revalidate=30, If the data is between 60 and 90 seconds old, display it to the user
            (persistently), but in the background send a request for new data.

            max-age: Refers to the user's browser (private cache).
            s-maxage: Refers exclusively to public cache servers or CDNs. */
        const response = NextResponse.json(data, { status: 200,   headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        } });

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
