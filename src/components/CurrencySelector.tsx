'use client';

import { RootState } from "@/store/store";
import { setCurrency } from "@/store/uiSlice";
import { useSelector, useDispatch } from "react-redux";

export default function CurrencySelector() {
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
    } catch (error) {
      console.error('Error fetching exchange rates:');
      dispatch(setCurrency({ code: 'usd', exchangeRate: 1.0 }));
    }
  }

  return (
    <div className="realtive">
      <select
        value={currency.code}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleCurrencyChange(e.target.value)}
      >
        <option value="usd">USD</option>
        <option value="eur">EUR</option>
        <option value="pln">PLN</option>
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-gray-500">▼</div>
    </div>
  );
}
