'use client';
import { useCryptoMarkets } from '../hooks/useCryptoMarkets';
import { useAppSelector } from '../hooks/useRedux';
import { RootState } from '../store/store';
import { AssetListItem } from './AssetListItem';
import { useSearchParams, useRouter } from 'next/navigation';

export function AssetList() {
  const currency = useAppSelector((state: RootState) => state.ui.currency);
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('perPage') || '10', 10);

  const { data, isLoading, isError, isFetching, refetch } =
    useCryptoMarkets({
      vs_currency: currency.code,
      per_page: String(perPage),
      page: String(currentPage),
    });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePerPageChange = (newPerPage: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('perPage', newPerPage);
    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-900/20 rounded-xl border border-gray-800 animate-pulse text-center">
        <div className="text-gray-500 font-medium">Loading markets...</div>
        <div className="text-gray-600 text-xs mt-2 italic">
          Fetching real-time data from CoinGecko
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-rose-900/10 border border-rose-900/20 rounded-xl text-center">
        <p className="text-rose-400 mb-4 font-medium">Failed to load market data</p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-rose-900/20 hover:bg-rose-900/30 text-rose-300 rounded-lg transition-colors border border-rose-900/30 font-bold uppercase text-xs tracking-widest"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-800 bg-gray-950/50">
        <div>
          <div className="flex items-center border-b border-gray-800 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold bg-gray-900/40 px-6 py-5 sticky top-0 z-10">
            <div className="w-12 text-center">Rank</div>
            <div className="flex-1 px-4">Coin</div>
            <div className="w-32 text-right">Price</div>
            <div className="hidden min-[520px]:block w-24 text-right text-indigo-400/80">1h</div>
            <div className="hidden min-[600px]:block w-24 text-right text-indigo-400/80">24h</div>
            <div className="hidden min-[700px]:block w-24 text-right">Volume</div>
            <div className="hidden min-[800px]:block w-24 text-right">M Cap</div>
            <div className="hidden min-[990px]:block w-24 text-right pr-2">Last 7d</div>
          </div>

          <div className="divide-y divide-gray-800/30">
            {hasData ? (
              data.map((coin) => (
                <AssetListItem key={coin.id} marketData={coin} currency={currency.code} />
              ))
            ) : (
              <div className="py-24 text-center text-gray-500 font-medium italic">
                No assets found for this page.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
        <div className="flex items-center gap-6">
          <div className="text-gray-500 text-[12px] uppercase font-bold tracking-wider">
            Page <span className="text-indigo-400 font-bold">{currentPage}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-[12px] uppercase font-bold tracking-wider">
              Show:
            </span>
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-gray-300 text-xs font-bold rounded-md px-2 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              {[10, 20, 30, 40, 50, 60, 70, 80].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isFetching}
            className="cursor-pointer flex-1 sm:flex-none px-4 py-3 rounded-md bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-indigo-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Prev
          </button>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={isFetching || (hasData && data.length < perPage)}
            className="cursor-pointer flex-1 sm:flex-none px-4 py-3 rounded-md bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-indigo-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 group"
          >
            Next <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      {isFetching && !isLoading && (
        <div className="fixed bottom-8 right-8 flex items-center gap-3 px-4 py-2 bg-indigo-600 rounded-full shadow-lg shadow-indigo-900/20 text-white text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
          Updating data...
        </div>
      )}
    </div>
  );
}
