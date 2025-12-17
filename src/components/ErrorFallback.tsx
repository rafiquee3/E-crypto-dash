'use client';

import { useState } from 'react';

export interface ErrorFallbackProps {
    error?: Error;
    resetError?: () => void;
    title?: string;
    showDetails?: boolean;
}

export function ErrorFallback({
    error,
    resetError,
    title = 'Something went wrong',
    showDetails = false,
}: ErrorFallbackProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    return (
        <div>
            <h2>{title}</h2>

            <p>
                {error?.message || 'An unexpected error occurred. Please try again.'}
            </p>

            <div>
                {resetError && (
                    <button onClick={resetError}>
                        Try Again
                    </button>
                )}

                <button onClick={() => window.location.reload()}>
                    Reload Page
                </button>
            </div>

            {showDetails && error?.stack && (
                <div>
                    <button onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
                        {isDetailsOpen ? 'Hide Details' : 'Show Details'}
                    </button>

                    {isDetailsOpen && (
                        <pre>
                            {error.stack}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
}
