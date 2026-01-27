'use client';
import { Component, ReactNode, ReactElement } from 'react';
import { ErrorFallbackProps } from './ErrorFallback';

interface Props {
    children: ReactNode;
    fallback: ReactElement<ErrorFallbackProps> | ((props: ErrorFallbackProps) => ReactNode);
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            const { fallback } = this.props;
            const { error } = this.state;

            // Support both render prop pattern and element pattern
            if (typeof fallback === 'function') {
                return fallback({ error, resetError: this.resetError });
            }

            return fallback;
        }
        return this.props.children;
    }
}
