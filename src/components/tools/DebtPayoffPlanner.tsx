import React, { useState, useMemo } from "react";
import { DebtItem } from "../../types";
import { calculateDebtPayoff } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import { Plus, Trash2, ShieldAlert, Sparkles, TrendingDown, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const DebtPayoffPlanner: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [debts, setDebts] = useState<DebtItem[]>([
    { id: "1", name: "Credit Card A", balance: 4500, interestRate: 22.9, minimumPayment: 120 },
    { id: "2", name: "Store Card", balance: 1200, interestRate: 19.5, minimumPayment: 45 },
    { id: "3", name: "Auto Loan", balance: 9000, interestRate: 6.8, minimumPayment: 210 },
  ]);

  const [extraPayment, setExtraPayment] = useState<number>(250);

  const results = useMemo(() => {
    if (debts.length === 0) {
      return null;
    }
    return calculateDebtPayoff(debts, extraPayment);
  }, [debts, extraPayment]);

  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const totalMinPayments = debts.reduce((s, d) => s + d.minimumPayment, 0);

  const handleAddDebt = () => {
    const newId = String(Date.now());
    setDebts([
      ...debts,
      { id: newId, name: `Debt #${debts.length + 1}`, balance: 2500, interestRate: 15.0, minimumPayment: 60 },
    ]);
  };

  const handleUpdateDebt = (id: string, field: keyof DebtItem, value: any) => {
    setDebts(debts.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const handleRemoveDebt = (id: string) => {
    setDebts(debts.filter((d) => d.id !== id));
  };

  // Merge timelines for Recharts
  const chartData = useMemo(() => {
    if (!results) return [];
    const maxMonths = Math.max(
      results.snowball.monthlyBalanceTimeline.length,
      results.avalanche.monthlyBalanceTimeline.length
    );

    const data = [];
    for (let m = 1; m <= maxMonths; m++) {
      const snow = results.snowball.monthlyBalanceTimeline[m - 1]?.totalBalance ?? 0;
      const aval = results.avalanche.monthlyBalanceTimeline[m - 1]?.totalBalance ?? 0;
      data.push({
        month: m,
        snowballBalance: snow,
        avalancheBalance: aval,
      });
    }
    return data;
  }, [results]);

  return (
    <div id="debt-payoff-planner-tool" className="space-y-8">
      {/* Top Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Debt Entry Cards & Extra Payment */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Current Debts</h3>
              <p className="text-xs text-slate-500">
                Total Debt: <strong>{formatMoney(totalBalance)}</strong> • Min Payments:{" "}
                <strong>{formatMoney(totalMinPayments)}/mo</strong>
              </p>
            </div>
            <button
              type="button"
              id="add-debt-btn"
              onClick={handleAddDebt}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Debt
            </button>
          </div>

          <div className="space-y-3">
            {debts.map((debt) => (
              <div
                key={debt.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={debt.name}
                    onChange={(e) => handleUpdateDebt(debt.id, "name", e.target.value)}
                    className="text-xs font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-teal-600 focus:outline-none bg-transparent"
                  />
                  {debts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDebt(debt.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-0.5">
                      Balance ({config.symbol})
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={debt.balance}
                      onChange={(e) => handleUpdateDebt(debt.id, "balance", parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-bold py-1 px-2 rounded border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-0.5">
                      Interest APR %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={debt.interestRate}
                      onChange={(e) => handleUpdateDebt(debt.id, "interestRate", parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-bold py-1 px-2 rounded border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase text-slate-400 block mb-0.5">
                      Min Pay ({config.symbol})
                    </label>
                    <input
                      type="number"
                      step="5"
                      value={debt.minimumPayment}
                      onChange={(e) => handleUpdateDebt(debt.id, "minimumPayment", parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-bold py-1 px-2 rounded border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <NumberSliderInput
              id="debt-extra-monthly"
              label="Extra Monthly Accelerator Cash"
              value={extraPayment}
              onChange={setExtraPayment}
              min={0}
              max={1500}
              step={25}
              prefix={config.symbol}
              tooltip="Extra funds dedicated each month beyond mandatory minimum payments."
            />
          </div>
        </div>

        {/* Right: Snowball vs. Avalanche Side-by-Side Comparison */}
        <div className="lg:col-span-6 space-y-6">
          {results && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Snowball Card */}
                <div className="min-w-0 overflow-hidden p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Debt Snowball
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Smallest Balance 1st
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-slate-900 truncate">
                      {results.snowball.payoffDateString}
                    </div>
                    <span className="text-xs text-slate-500">
                      Freedom in {results.snowball.totalMonths} months
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between gap-2">
                      <span className="shrink-0">Total Interest:</span>
                      <span className="font-bold text-slate-900 tabular-nums truncate">{formatMoney(results.snowball.totalInterestPaid, { compact: true })}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="shrink-0">Total Repaid:</span>
                      <span className="font-semibold text-slate-800 tabular-nums truncate">{formatMoney(results.snowball.totalPaid, { compact: true })}</span>
                    </div>
                  </div>
                </div>

                {/* Avalanche Card */}
                <div className="min-w-0 overflow-hidden p-5 rounded-2xl border-2 border-teal-700 bg-teal-50/40 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      Debt Avalanche
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-200/80 text-teal-900">
                      Highest Rate 1st
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-teal-950 truncate">
                      {results.avalanche.payoffDateString}
                    </div>
                    <span className="text-xs text-teal-800">
                      Freedom in {results.avalanche.totalMonths} months
                    </span>
                  </div>
                  <div className="pt-2 border-t border-teal-200/60 text-xs text-teal-950 space-y-1">
                    <div className="flex justify-between gap-2">
                      <span className="shrink-0">Total Interest:</span>
                      <span className="font-bold text-teal-900 tabular-nums truncate">{formatMoney(results.avalanche.totalInterestPaid, { compact: true })}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="shrink-0">Total Repaid:</span>
                      <span className="font-semibold text-teal-900 tabular-nums truncate">{formatMoney(results.avalanche.totalPaid, { compact: true })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation Callout */}
              <div className="p-4 rounded-xl border border-teal-200 bg-white flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 text-slate-700">
                  <span className="font-bold text-slate-900 block text-sm">Strategic Recommendation:</span>
                  <p>{results.recommendation}</p>
                  {results.interestSavedWithAvalanche > 0 && (
                    <p className="font-bold text-teal-900 pt-1">
                      Avalanche saves {formatMoney(results.interestSavedWithAvalanche)} in interest compared to Snowball.
                    </p>
                  )}
                </div>
              </div>

              {/* Payoff Timeline Chart */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 mb-1">Remaining Debt Balance Over Time</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Month-by-month trajectory toward total debt freedom.
                </p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                      <XAxis dataKey="month" tickFormatter={(m) => `M${m}`} tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(val) => formatMoney(val, { compact: true })} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(val: any) => [formatMoney(val), "Balance"]}
                        labelFormatter={(m) => `Month ${m}`}
                        contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                      />
                      <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Line
                        type="monotone"
                        name="Snowball Method"
                        dataKey="snowballBalance"
                        stroke="#64748b"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        name="Avalanche Method"
                        dataKey="avalancheBalance"
                        stroke="#0f766e"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
