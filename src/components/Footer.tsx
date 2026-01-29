import Link from 'next/link';

export function Footer() {
    return (
        <footer className="mt-auto border-t border-white/5 bg-gray-800/50">
            <div className="max-w-7xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <span className="text-white font-bold text-sm">E</span>
                            </div>
                            <span className="text-gray-100 font-bold tracking-tight text-lg">Crypto<span className="text-indigo-500">Dash</span></span>
                        </div>
                        <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                            Real-time cryptocurrency monitoring.
                        </p>
                    </div>


                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Resources</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">CoinGecko API</a></li>
                            <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Market List</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li className="hover:text-gray-400 cursor-pointer transition-colors">Privacy Policy</li>
                            <li className="hover:text-gray-400 cursor-pointer transition-colors">Terms of Service</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
                    <p>© {new Date().getFullYear()} CryptoDash.</p>
                    <div className="flex items-center gap-6 text-center md:text-right">
                        <p>rafiquee3</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
