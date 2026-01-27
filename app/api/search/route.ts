import { CoinGeckoAdapter } from "@/adapters/adapters/CoinGeckoAdapter";
import { checkRateLimit } from "@/guards/rateLimitGuard";
import { validateSearchParams } from "@/guards/validationGuard";
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const rateLimitResult = await checkRateLimit(req);

    if (!rateLimitResult.success) {
        return rateLimitResult.response;
    }

    const url = new URL(req.url);
    const validationResult = await validateSearchParams(url.searchParams);

    if (!validationResult.success) {
        return validationResult.response;
    }

    try {
        const adapter = new CoinGeckoAdapter(process.env.COINGECKO_API_KEY_SECRET!);
        const data = await adapter.search(validationResult.data.query);

        const response = NextResponse.json(data, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
            }
        });

        response.headers.set('X-RateLimit-Limit', String(rateLimitResult.limit));
        response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
        response.headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimitResult.reset / 1000)));

        return response;
    } catch (error: unknown) {
        console.error('Search API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'An error occurred during search.' },
            { status: 500 }
        );
    }
}
