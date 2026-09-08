import React, { useState, useMemo, useEffect } from "react";
import { SavingsGoalItem } from "../../types";
import { calculateSavingsGoal } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Target, PiggyBank, Plus, Trash2, Calendar, Sparkles, CheckCircle2 } from "lucide-react";

export const SavingsGoalCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [name, setName] = useState<string>("House Down Payment");
  const [targetAmount, setTargetAmount] = useState<number>(45000);
  const [currentAmount, setCurrentAmount] = useState<number>(8000);
  const [targetMonths, setTargetMonths] = useState<number>(24);
  const [expectedApy, setExpectedApy] = useState<number>(4.5);

  // Multi-goals list stored in localStorage
  const [savedGoals, setSavedGoals] = useState<SavingsGoalItem[]>(() => {
    try {
      const saved = localStorage.getItem("financehub_savings_goals");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: "g1",
              name: "House Down Payment",
              category: "down_payment",
              targetAmount: 45000,
              currentAmount: 8000,
              targetMonths: 24,
              expectedApy: 4.5,
            },
            {
              id: "g2",
              name: "Dream Vacation",
              category: "vacation",
              targetAmount: 5000,
              currentAmount: 1500,
              targetMonths: 10,
              expectedApy: 4.5,
            },
          ];
    } catch {
      return [];
    }
  });

  const currentGoal: SavingsGoalItem = useMemo(
    () => ({
      id: "active",
      name,
      category: "other",
      targetAmount,
      currentAmount,
      targetMonths,
      expectedApy,
    }),
    [name, targetAmount, currentAmount, targetMonths, expectedApy]
  );

  const results = useMemo(() => calculateSavingsGoal(currentGoal), [currentGoal]);

  const goalPresets = [
    { label: "House Down Payment", amount: 50000, months: 36 },
    { label: "Wedding", amount: 25000, months: 18 },
    { label: "New Vehicle", amount: 15000, months: 24 },
    { label: "Dream Vacation", amount: 6000, months: 12 },
  ];

  const handleSaveGoal = () => {
    const newGoal: SavingsGoalItem = {
      id: Date.now().toString(),
      name,
      category: "other",
      targetAmount,
      currentAmount,
      targetMonths,
      expectedApy,
    };
    const updated = [...savedGoals.filter((g) => g.name !== name), newGoal];
    setSavedGoals(updated);
    try {
      localStorage.setItem("financehub_savings_goals", JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteGoal = (id: string) => {
    const updated = savedGoals.filter((g) => g.id !== id);
    setSavedGoals(updated);
    try {
      localStorage.setItem("financehub_savings_goals", JSON.stringify(updated));
    } catch {}
  };

  const handleSelectSavedGoal = (g: SavingsGoalItem) => {
    setName(g.name);
    setTargetAmount(g.targetAmount);
    setCurrentAmount(g.currentAmount);
    setTargetMonths(g.targetMonths);
    setExpectedApy(g.expectedApy);
  };

  return (
    <div id="savings-goal-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Goal Definition */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-teal-700" />
              Goal Parameters
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Goal Name</label>
              <input
                type="text"
                id="sg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wedding, House Down Payment"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-teal-700"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {goalPresets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setName(p.label);
                    setTargetAmount(p.amount);
                    setTargetMonths(p.months);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <NumberSliderInput
              id="sg-target-amount"
              label="Target Goal Amount"
              value={targetAmount}
              onChange={setTargetAmount}
              min={1000}
              max={250000}
              step={500}
              prefix={config.symbol}
            />

            <NumberSliderInput
              id="sg-current-amount"
              label="Current Starting Savings"
              value={currentAmount}
              onChange={setCurrentAmount}
              min={0}
              max={150000}
              step={250}
              prefix={config.symbol}
              tooltip="Money you have already saved toward this specific goal."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberSliderInput
                id="sg-months"
                label="Timeline (Months)"
                value={targetMonths}
                onChange={setTargetMonths}
                min={3}
                max={120}
                step={1}
                suffix=" mos"
              />
              <NumberSliderInput
                id="sg-apy"
                label="Expected APY"
                value={expectedApy}
                onChange={setExpectedApy}
                min={0}
                max={8.0}
                step={0.1}
                suffix="%"
                tooltip="High-Yield Savings Accounts (HYSA) currently pay ~4.0% to 5.0% APY."
              />
            </div>

            <button
              type="button"
              onClick={handleSaveGoal}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Save Goal to My Planner
            </button>
          </div>

          {/* Saved Goals Multi-Tracker */}
          {savedGoals.length > 0 && (
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <PiggyBank className="w-3.5 h-3.5 text-teal-700" />
                Saved Goals in Planner ({savedGoals.length})
              </h3>
              <div className="divide-y divide-slate-100">
                {savedGoals.map((g) => {
                  const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                  return (
                    <div key={g.id} className="py-2.5 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleSelectSavedGoal(g)}
                        className="text-left group flex-1"
                      >
                        <span className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                          {g.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span>{formatMoney(g.currentAmount)} of {formatMoney(g.targetAmount)}</span>
                          <span>•</span>
                          <span className="font-semibold text-teal-700">{pct}%</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGoal(g.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Key Results & Growth Projection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Result Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="result-required-monthly"
              title="Required Monthly Savings"
              value={`${formatMoney(results.requiredMonthlyDeposit)}/mo`}
              subtitle={`Target completion: ${results.effectiveTargetDateString}`}
              highlight={true}
              badge={{
                text: `${targetMonths} Months Plan`,
                variant: "positive",
              }}
            />

            <ResultCard
              id="result-interest-earned"
              title="Interest Earned from APY"
              value={formatMoney(results.totalInterestEarned)}
              subtitle={`Principal deposits: ${formatMoney(results.totalPrincipalContributions)}`}
              highlight={false}
              badge={{
                text: `${expectedApy}% APY Compound`,
                variant: "info",
              }}
            />
          </div>

          {/* Compound Growth Area Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-700" />
                Savings Growth Trajectory ({name})
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">Includes interest compounding</span>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.yearlySchedule} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goalBalanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="goalContribGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tickFormatter={(m) => `M${m}`} stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `${config.symbol}${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatMoney(Number(val)), ""]}
                    labelFormatter={(m) => `Month ${m}`}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="Total Balance (With Interest)"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#goalBalanceGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="contributions"
                    name="Principal Saved"
                    stroke="#64748b"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#goalContribGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
