'use client';

import { useState, useEffect, useRef } from 'react';
import { useCoinSearch } from '@/hooks/useCoinSearch';
import { useRouter } from 'next/navigation';

export function Search() {
    const [inputValue, setInputValue] = useState('');
    const [debouncedValue, setDebouncedValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(inputValue);
        }, 300);

        return () => clearTimeout(timer);
    }, [inputValue]);

    const { data, isLoading, isFetching } = useCoinSearch(debouncedValue);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (coinId: string) => {
        setIsOpen(false);
        setInputValue('');
        router.push(`/coin/${coinId}`);
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-md">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-100 group-focus-within:text-indigo-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-xl leading-5 bg-gray-900/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm backdrop-blur-md truncate"
                    placeholder="Search coins..."
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />

                {(isLoading || isFetching) && debouncedValue.length >= 2 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                    </div>
                )}
            </div>

            {isOpen && debouncedValue.length >= 2 && (
                <div className="fixed top-15 left-0 md:absolute md:top-12 z-50 mt-2 w-full bg-gray-900/95 border border-gray-800 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    {data?.coins && data.coins.length > 0 ? (
                        <ul className="max-h-80 overflow-y-auto py-2">
                            {data.coins.map((coin: any) => (
                                <li key={coin.id}>
                                    <button
                                        onClick={() => handleSelect(coin.id)}
                                        className="w-full flex items-center px-4 py-3 hover:bg-white/5 transition-colors text-left"
                                    >
                                        <div className="relative h-6 w-6 flex-shrink-0 mr-3">
                                            <img
                                                src={coin.thumb}
                                                alt={coin.name}
                                                className="rounded-full"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-100">{coin.name}</span>
                                            <span className="text-xs text-gray-500 uppercase">{coin.symbol}</span>
                                        </div>
                                        <div className="ml-auto text-xs text-gray-600 font-mono">
                                            #{coin.market_cap_rank || 'N/A'}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : !isLoading && (
                        <div className="px-4 py-6 text-center text-gray-500 text-sm italic">
                            No coins found for "{debouncedValue}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
