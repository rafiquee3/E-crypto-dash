import { CurrencySelector } from './CurrencySelector';
import { GlobalStats } from './GlobalStats';
import { Search } from './Search';

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-8">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="text-white font-bold text-xl">E</span>
                    </div>
                    <span className="text-gray-100 font-bold tracking-tight text-lg">Crypto<span className="text-indigo-500">Dash</span></span>
                </div>

                <GlobalStats />
                <CurrencySelector />
            </div>

            <div className="flex-1 max-w-md mx-8 hidden md:block">
                <Search />
            </div>

            <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-gray-800 border border-gray-700"></div>
            </div>
        </header>
    );
}
