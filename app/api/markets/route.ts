import { CoinGeckoAdapter } from "@/adapters/adapters/CoinGeckoAdapter";
import { checkRateLimit } from "@/guards/rateLimitGuard";
import { validateMarketParams } from "@/guards/validationGuard";
import { getClientIdentifier } from "@/lib/rateLimit";
import { NextResponse } from 'next/server';

const adapter = new CoinGeckoAdapter(process.env.COINGECKO_API_KEY_SECRET!);

export async function GET(req: Request) {
    const rateLimitResult = await checkRateLimit(req);
    const clientId = getClientIdentifier(req);

    if (!rateLimitResult.success) {
        return rateLimitResult.response;
    }

    const url = new URL(req.url);
    const validationResult = await validateMarketParams(url.searchParams);

    if (!validationResult.success) {
        return validationResult.response;
    }

    try {
        const data = await adapter.fetchMarketData(validationResult.data);
        const response = NextResponse.json(data, { status: 200 });

        response.headers.set('X-RateLimit-Limit', String(rateLimitResult.limit));
        response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
        response.headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimitResult.reset / 1000)));
        return response;
    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
        );
    }
}
