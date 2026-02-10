import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addAlert, removeAlert } from '@/store/uiSlice';
import { RootState } from '@/store/store';

export function PriceAlerts({ coinId, currentPrice }: { coinId: string; currentPrice: number }) {
  const [targetPrice, setTargetPrice] = useState<string>(currentPrice?.toString() || '');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [isOpen, setIsOpen] = useState(false);

  const dispatch = useDispatch();
  const alerts = useSelector((state: RootState) =>
    (state.ui.alerts || []).filter(
      (a) => a.coinId === coinId && a.currency === state.ui.currency.code,
    ),
  );
  const currency = useSelector((state: RootState) => state.ui.currency);

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice || isNaN(Number(targetPrice))) return;

    dispatch(
      addAlert({
        id: crypto.randomUUID(),
        coinId,
        targetPrice: Number(targetPrice),
        condition,
        active: true,
        currency: currency.code,
      }),
    );
    setTargetPrice('');
    setIsOpen(false);
  };

  const handleRemoveAlert = (id: string) => {
    dispatch(removeAlert(id));
  };

  return (
    <div className="hidden min-[560px]:block relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors border border-gray-700/50"
        title="Manage Price Alerts"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full text-[10px] flex items-center justify-center text-white border border-gray-900">
            {alerts.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-70 bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl p-4 z-20 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Price Alerts</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleAddAlert} className="space-y-3 mb-6">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Target Price ({currency.code})
              </label>
              <input
                type="number"
                step="any"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="above">Above (≥)</option>
                <option value="below">Below (≤)</option>
              </select>

              <button
                type="submit"
                disabled={!targetPrice}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </form>

          {alerts.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex justify-between items-center bg-gray-800/30 p-2 rounded-lg border border-gray-800"
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      {alert.condition === 'above' ? (
                        <span className="text-emerald-400">▲ Above</span>
                      ) : (
                        <span className="text-rose-400">▼ Below</span>
                      )}
                    </span>
                    <span className="text-sm font-mono text-white">
                      {alert.targetPrice.toLocaleString(undefined, {
                        style: 'currency',
                        currency: currency.code,
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveAlert(alert.id)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-900/20 rounded-md transition-colors"
                    title="Remove Alert"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-600 text-xs italic">
              No active alerts for this coin
            </div>
          )}
        </div>
      )}
    </div>
  );
}
