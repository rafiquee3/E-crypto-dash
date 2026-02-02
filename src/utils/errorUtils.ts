import { NextResponse } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';

export function getErrorMessage(error: unknown, isClientSafe: boolean = false): string {
    // If it's a known "safe" error (like a validation error we want to show),
    // or we are in development, we can return the real message.
    if (!isProduction || isClientSafe) {
        if (error instanceof Error) return error.message;
        if (error && typeof error === 'object' && 'message' in error) return String(error.message);
        if (typeof error === 'string') return error;
    }

    return 'An internal server error occurred. Please try again later.';
}

export function createErrorResponse(error: unknown, status: number = 500) {
    console.error(`[API ERROR ${status}] - ${new Date().toISOString()}:`, error);

    // Only allow specific messages to pass through to the client in production
    // status 400 (Validation) and 404 (Not Found) are usually "safe" to describe
    const isSafe = status < 500;
    const message = getErrorMessage(error, isSafe);

    return NextResponse.json(
        {
            error: status >= 500 ? 'Internal Server Error' : (status === 404 ? 'Not Found' : 'Bad Request'),
            message
        },
        { status }
    );
}
