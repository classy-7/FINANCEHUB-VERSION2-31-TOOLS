import React, { useState, useMemo } from "react";
import { BudgetCategory, BudgetInputs } from "../../types";
import { calculateBudget } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PieChart, CheckCircle2, AlertTriangle, Plus, Trash2 } from "lucide-react";

export const BudgetCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [monthlyTakeHome, setMonthlyTakeHome] = useState<number>(5000);

  const [categories, setCategories] = useState<BudgetCategory[]>([
    { id: "1", name: "Rent / Mortgage", type: "needs", budgetedAmount: 1800, actualAmount: 1800 },
    { id: "2", name: "Groceries & Household", type: "needs", budgetedAmount: 500, actualAmount: 550 },
    { id: "3", name: "Utilities & Phone", type: "needs", budgetedAmount: 250, actualAmount: 240 },
    { id: "4", name: "Dining Out & Takeaway", type: "wants", budgetedAmount: 400, actualAmount: 450 },
    { id: "5", name: "Entertainment & Subscriptions", type: "wants", budgetedAmount: 200, actualAmount: 220 },
    { id: "6", name: "Shopping & Hobbies", type: "wants", budgetedAmount: 300, actualAmount: 280 },
    { id: "7", name: "Emergency Savings Fund", type: "savings", budgetedAmount: 500, actualAmount: 500 },
    { id: "8", name: "Roth IRA / 401k", type: "savings", budgetedAmount: 500, actualAmount: 450 },
  ]);

  const inputs: BudgetInputs = useMemo(() => ({
    monthlyTakeHome,
    categories,
  }), [monthlyTakeHome, categories]);

  const results = useMemo(() => calculateBudget(inputs), [inputs]);

  const handleUpdateCategory = (id: string, amount: number) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, actualAmount: amount } : c)));
  };

  const chartData = [
    {
      pillar: "Needs (50%)",
      Recommended: Math.round(results.recommendedNeeds),
      Actual: Math.round(results.actualNeeds),
    },
    {
      pillar: "Wants (30%)",
      Recommended: Math.round(results.recommendedWants),
      Actual: Math.round(results.actualWants),
    },
    {
      pillar: "Savings (20%)",
      Recommended: Math.round(results.recommendedSavings),
      Actual: Math.round(results.actualSavings),
    },
  ];

  return (
    <div id="budget-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Income & Spending Inputs */}
        <div className="lg:col-span-6 space-y-4">
          <NumberSliderInput
            id="budget-monthly-income"
            label="Monthly Net Take-Home Pay"
            value={monthlyTakeHome}
            onChange={setMonthlyTakeHome}
            min={1000}
            max={30000}
            step={100}
            prefix={config.symbol}
            tooltip="Your total monthly income after all payroll taxes have been deducted."
          />

          {/* Categorized Spending Inputs */}
          <div className="space-y-4 pt-2">
            {/* Needs */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Needs (Target: 50% = {formatMoney(results.recommendedNeeds)})
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Actual: {formatMoney(results.actualNeeds)}
                </span>
              </div>
              {categories.filter((c) => c.type === "needs").map((cat) => (
                <div key={cat.id} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-700 font-medium">{cat.name}</span>
                  <div className="relative flex items-center w-28">
                    <span className="absolute left-2.5 text-slate-400 font-mono">{config.symbol}</span>
                    <input
                      type="number"
                      value={cat.actualAmount}
                      onChange={(e) => handleUpdateCategory(cat.id, parseFloat(e.target.value) || 0)}
                      className="w-full text-right py-1 pr-2.5 pl-6 rounded border border-slate-200 text-xs font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Wants */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  Wants (Target: 30% = {formatMoney(results.recommendedWants)})
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Actual: {formatMoney(results.actualWants)}
                </span>
              </div>
              {categories.filter((c) => c.type === "wants").map((cat) => (
                <div key={cat.id} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-700 font-medium">{cat.name}</span>
                  <div className="relative flex items-center w-28">
                    <span className="absolute left-2.5 text-slate-400 font-mono">{config.symbol}</span>
                    <input
                      type="number"
                      value={cat.actualAmount}
                      onChange={(e) => handleUpdateCategory(cat.id, parseFloat(e.target.value) || 0)}
                      className="w-full text-right py-1 pr-2.5 pl-6 rounded border border-slate-200 text-xs font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Savings & Debt */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Savings & Extra Debt (Target: 20% = {formatMoney(results.recommendedSavings)})
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Actual: {formatMoney(results.actualSavings)}
                </span>
              </div>
              {categories.filter((c) => c.type === "savings").map((cat) => (
                <div key={cat.id} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-700 font-medium">{cat.name}</span>
                  <div className="relative flex items-center w-28">
                    <span className="absolute left-2.5 text-slate-400 font-mono">{config.symbol}</span>
                    <input
                      type="number"
                      value={cat.actualAmount}
                      onChange={(e) => handleUpdateCategory(cat.id, parseFloat(e.target.value) || 0)}
                      className="w-full text-right py-1 pr-2.5 pl-6 rounded border border-slate-200 text-xs font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 50/30/20 Targets & Variance Analysis */}
        <div className="lg:col-span-6 space-y-6">
          <ResultCard
            id="budget-monthly-surplus-card"
            title="Monthly Cash Flow Balance"
            value={formatMoney(results.monthlySurplusOrDeficit, { showSign: true })}
            subtitle={
              results.monthlySurplusOrDeficit >= 0
                ? "You have a positive monthly surplus available for extra savings!"
                : "You are spending more than your monthly take-home income."
            }
            highlight
            badge={{
              text: results.monthlySurplusOrDeficit >= 0 ? "Surplus" : "Deficit",
              variant: results.monthlySurplusOrDeficit >= 0 ? "positive" : "warning",
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="min-w-0 overflow-hidden p-3 sm:p-4 rounded-xl border border-slate-200 bg-white text-center">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase block mb-1 truncate">
                Needs (50%)
              </span>
              <div
                className="text-base sm:text-lg font-bold text-slate-900 tabular-nums truncate"
                title={formatMoney(results.actualNeeds)}
              >
                {formatMoney(results.actualNeeds, { compact: true })}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-semibold mt-1 block truncate ${
                  results.needsVariance > 0 ? "text-rose-600" : "text-emerald-700"
                }`}
              >
                {results.needsVariance > 0
                  ? `+${formatMoney(results.needsVariance, { compact: true })} over`
                  : `${formatMoney(Math.abs(results.needsVariance), { compact: true })} under`}
              </span>
            </div>

            <div className="min-w-0 overflow-hidden p-3 sm:p-4 rounded-xl border border-slate-200 bg-white text-center">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase block mb-1 truncate">
                Wants (30%)
              </span>
              <div
                className="text-base sm:text-lg font-bold text-slate-900 tabular-nums truncate"
                title={formatMoney(results.actualWants)}
              >
                {formatMoney(results.actualWants, { compact: true })}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-semibold mt-1 block truncate ${
                  results.wantsVariance > 0 ? "text-rose-600" : "text-emerald-700"
                }`}
              >
                {results.wantsVariance > 0
                  ? `+${formatMoney(results.wantsVariance, { compact: true })} over`
                  : `${formatMoney(Math.abs(results.wantsVariance), { compact: true })} under`}
              </span>
            </div>

            <div className="min-w-0 overflow-hidden p-3 sm:p-4 rounded-xl border border-slate-200 bg-white text-center">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase block mb-1 truncate">
                Savings (20%)
              </span>
              <div
                className="text-base sm:text-lg font-bold text-slate-900 tabular-nums truncate"
                title={formatMoney(results.actualSavings)}
              >
                {formatMoney(results.actualSavings, { compact: true })}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-semibold mt-1 block truncate ${
                  results.savingsVariance < 0 ? "text-amber-600" : "text-emerald-700"
                }`}
              >
                {results.savingsVariance >= 0
                  ? `+${formatMoney(results.savingsVariance, { compact: true })} ahead`
                  : `${formatMoney(Math.abs(results.savingsVariance), { compact: true })} below`}
              </span>
            </div>
          </div>

          {/* Comparison Bar Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Recommended 50/30/20 Targets vs. Your Actual Spending</h4>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <XAxis dataKey="pillar" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => formatMoney(v, { compact: true })} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [formatMoney(val), ""]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="Recommended" fill="#0f766e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Actual" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
