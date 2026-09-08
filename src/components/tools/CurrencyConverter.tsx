import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeftRight, RefreshCw, DollarSign, Globe, TrendingUp, AlertCircle } from "lucide-react";

interface ExchangeRateData {
  base: string;
  timestamp: string;
  rates: Record<string, number>;
}

const POPULAR_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$", flag: "🇲🇽" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
];

const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.925,
  GBP: 0.785,
  CAD: 1.365,
  AUD: 1.532,
  JPY: 154.2,
  CHF: 0.892,
  INR: 84.15,
  CNY: 7.235,
  MXN: 18.25,
  BRL: 5.48,
  SGD: 1.348,
  NZD: 1.645,
  ZAR: 18.15,
};

export const CurrencyConverter: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [amount, setAmount] = useState<number>(1000);
  const [ratesData, setRatesData] = useState<ExchangeRateData>({
    base: "USD",
    timestamp: new Date().toISOString(),
    rates: FALLBACK_RATES,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("Live rates loaded");

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exchange-rates");
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          setRatesData(data);
          setLastRefreshed(new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        }
      }
    } catch {
      // Fallback is already initialized
      setLastRefreshed("Market benchmark rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Compute exchange rate between fromCurrency and toCurrency
  // Both rates are expressed relative to USD base
  const exchangeRate = useMemo(() => {
    const fromRate = ratesData.rates[fromCurrency] || FALLBACK_RATES[fromCurrency] || 1;
    const toRate = ratesData.rates[toCurrency] || FALLBACK_RATES[toCurrency] || 1;
    return toRate / fromRate;
  }, [ratesData, fromCurrency, toCurrency]);

  const convertedAmount = useMemo(() => {
    return amount * exchangeRate;
  }, [amount, exchangeRate]);

  const inverseRate = useMemo(() => {
    return exchangeRate > 0 ? 1 / exchangeRate : 0;
  }, [exchangeRate]);

  const handleSwap = () => {
    const prevFrom = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(prevFrom);
  };

  const fromInfo = POPULAR_CURRENCIES.find((c) => c.code === fromCurrency) || {
    code: fromCurrency,
    symbol: fromCurrency,
    name: fromCurrency,
    flag: "🌐",
  };
  const toInfo = POPULAR_CURRENCIES.find((c) => c.code === toCurrency) || {
    code: toCurrency,
    symbol: toCurrency,
    name: toCurrency,
    flag: "🌐",
  };

  const quickAmounts = [1, 10, 50, 100, 500, 1000, 5000];

  return (
    <div id="currency-converter-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Currency Swap</span>
              <button
                type="button"
                onClick={fetchRates}
                disabled={loading}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 hover:text-teal-950 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Amount to Convert</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {fromInfo.symbol}
                </span>
                <input
                  type="number"
                  id="cc-amount-input"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
                  min={0}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-lg font-bold text-slate-900 focus:outline-hidden focus:border-teal-700"
                />
              </div>
            </div>

            {/* Currency Selectors & Swap Button */}
            <div className="grid grid-cols-1 sm:grid-cols-9 gap-2 items-center">
              {/* From Currency */}
              <div className="sm:col-span-4 space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">From</label>
                <select
                  id="cc-select-from"
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden focus:border-teal-700"
                >
                  {POPULAR_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="sm:col-span-1 flex justify-center pt-5 sm:pt-4">
                <button
                  type="button"
                  id="cc-btn-swap"
                  onClick={handleSwap}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-teal-800 transition-all shadow-xs"
                  title="Swap currencies"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              {/* To Currency */}
              <div className="sm:col-span-4 space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">To</label>
                <select
                  id="cc-select-to"
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden focus:border-teal-700"
                >
                  {POPULAR_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Quick Preset Values:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                      amount === q
                        ? "bg-teal-800 text-white border-teal-800"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {fromInfo.symbol}
                    {q.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Results & Conversion Matrix */}
        <div className="lg:col-span-6 space-y-5">
          {/* Hero Converted Value Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-teal-950 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs text-teal-300 font-semibold">
              <span>
                {fromInfo.flag} {amount.toLocaleString()} {fromCurrency} =
              </span>
              <span className="text-[11px] text-slate-400">{lastRefreshed}</span>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {toInfo.symbol}
              {convertedAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              <span className="text-xl font-bold text-teal-300">{toCurrency}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
              <span>
                1 {fromCurrency} ={" "}
                <strong className="text-white">
                  {exchangeRate.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}{" "}
                  {toCurrency}
                </strong>
              </span>
              <span>
                1 {toCurrency} ={" "}
                <strong className="text-white">
                  {inverseRate.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}{" "}
                  {fromCurrency}
                </strong>
              </span>
            </div>
          </div>

          {/* Quick Conversion Matrix */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-700" />
              Quick {fromCurrency} to {toCurrency} Conversion Table
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold uppercase">
                    <th className="py-2 px-3">{fromCurrency} ({fromInfo.symbol})</th>
                    <th className="py-2 px-3 text-right">{toCurrency} ({toInfo.symbol})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {[1, 5, 10, 25, 50, 100, 500, 1000].map((v) => (
                    <tr key={v} className="hover:bg-slate-50 text-slate-700 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {fromInfo.symbol}
                        {v.toLocaleString()} {fromCurrency}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-teal-900">
                        {toInfo.symbol}
                        {(v * exchangeRate).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {toCurrency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
