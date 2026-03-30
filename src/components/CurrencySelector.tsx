'use client';

import { RootState } from "@/store/store";
import { setCurrency } from "@/store/uiSlice";
import { useSelector, useDispatch } from "react-redux";

export function CurrencySelector() {
  const currency = useSelector((state: RootState) => state.ui.currency);
  const dispatch = useDispatch();
  const handleCurrencyChange = async (newCode: string) => {
  try {
      let rate = 1.0;

      if (newCode !== 'usd') {
        const response = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${newCode.toUpperCase()}`);
        const json = await response.json();

        rate = json.rates[newCode.toUpperCase()];
      }

      dispatch(setCurrency({code: newCode, exchangeRate: rate}));
    } catch {
      console.error('Error fetching exchange rates:');
      dispatch(setCurrency({ code: 'usd', exchangeRate: 1.0 }));
    }
  }

  return (
    <div className="hidden min-[500px]:block relative">
      <select
        value={currency.code}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleCurrencyChange(e.target.value)}
        className="appearance-none bg-gray-900/50 border border-gray-800 text-gray-200 text-xs font-bold py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer backdrop-blur-md uppercase tracking-wider"
      >
        <option value="usd" className="bg-gray-900 text-gray-200">USD</option>
        <option value="eur" className="bg-gray-900 text-gray-200">EUR</option>
        <option value="pln" className="bg-gray-900 text-gray-200">PLN</option>
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-indigo-400 group-hover:text-indigo-300">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
