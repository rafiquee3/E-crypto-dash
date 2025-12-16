import { marketsRateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { fetchMarketData } from "@/services/cryptoService";
import { CoinMarketParams, CoinsMarketParamsSchema } from "@/types/yup";
import { NextResponse } from 'next/server';

export async function GET(req: Request & {guery: {[key: string]: string | string[]}}) {
    
    try {
        // Rate Limiting Check
        // Extract client identifier (IP address) from request
        const clientId = getClientIdentifier(req);
        
        // Check rate limit before processing the request
        const rateLimitResult = await marketsRateLimit.limit(clientId);
        
        // If rate limit exceeded, return 429 error
        if (!rateLimitResult.success) {
            const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
            
            return NextResponse.json(
                {
                    error: 'Too many requests',
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter: retryAfter, // seconds until limit resets
                },
                {
                    status: 429,
                    headers: {
                        // Standard rate limit headers (RFC 6585)
                        'X-RateLimit-Limit': String(rateLimitResult.limit),
                        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                        'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.reset / 1000)), // Unix timestamp
                        'Retry-After': String(retryAfter), // Seconds until retry is allowed
                    },
                }
            );
        }

        const url = new URL(req.url);
        const { searchParams } = url;

        const rawParams = Object.fromEntries(searchParams);
        const validatedData: CoinMarketParams = await CoinsMarketParamsSchema.validate(rawParams, {
            abortEarly: false, // first error stop 
            strict: false   // same type
        }); 

        const data = await fetchMarketData(validatedData);
        const response = NextResponse.json(data, { status: 200 });
        
        // Add rate limit headers to successful response
        // This allows clients to track their remaining requests
        response.headers.set('X-RateLimit-Limit', String(rateLimitResult.limit));
        response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
        response.headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimitResult.reset / 1000)));
        
        return response;

    } catch (error: any) {
        console.error('API Error:', error);

        // Validation errors (Yup schema validation failed)
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                {
                    error: 'Invalid parameters',
                    details: error.errors,
                },
                { status: 400 }
            );
        }

        // All other errors (internal server errors, API failures, etc.)
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: 'An error occurred while processing your request.',
            },
            { status: 500 }
        );
    }
}
