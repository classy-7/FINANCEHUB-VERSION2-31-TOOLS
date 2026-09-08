import React, { useState, useMemo } from "react";
import { FireInputs } from "../../types";
import { calculateFire } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Flame, Compass, CheckCircle2, Sparkles } from "lucide-react";

export const FireCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [currentAge, setCurrentAge] = useState<number>(29);
  const [currentSavings, setCurrentSavings] = useState<number>(75000);
  const [annualExpenses, setAnnualExpenses] = useState<number>(55000);
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState<number>(8.0);
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(4.0);
  const [monthlySavings, setMonthlySavings] = useState<number>(2000);
  const [fireVariant, setFireVariant] = useState<"standard" | "lean" | "fat">("standard");

  const inputs: FireInputs = useMemo(() => ({
    currentAge,
    currentSavings,
    annualExpenses,
    expectedAnnualReturn,
    safeWithdrawalRate,
    monthlySavings,
    fireVariant,
  }), [
    currentAge,
    currentSavings,
    annualExpenses,
    expectedAnnualReturn,
    safeWithdrawalRate,
    monthlySavings,
    fireVariant,
  ]);

  const results = useMemo(() => calculateFire(inputs), [inputs]);

  const activeTarget =
    fireVariant === "lean"
      ? results.leanFireNumber
      : fireVariant === "fat"
      ? results.fatFireNumber
      : results.fireNumber;

  return (
    <div id="fire-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-4">
          {/* FIRE Strategy Mode Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800 block">FIRE Lifestyle Target</label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
              {[
                { id: "lean", label: "Lean FIRE (75%)" },
                { id: "standard", label: "Standard (100%)" },
                { id: "fat", label: "Fat FIRE (125%)" },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setFireVariant(v.id as any)}
                  className={`py-2 px-2 rounded-lg border text-center transition-all ${
                    fireVariant === v.id
                      ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberSliderInput
              id="fire-current-age"
              label="Current Age"
              value={currentAge}
              onChange={setCurrentAge}
              min={18}
              max={65}
              step={1}
              suffix=" yrs"
            />
            <NumberSliderInput
              id="fire-swr"
              label="Withdrawal Rate"
              value={safeWithdrawalRate}
              onChange={setSafeWithdrawalRate}
              min={3.0}
              max={5.0}
              step={0.1}
              suffix="%"
              tooltip="4% rule implies 25x annual expenses; 3.3% implies 30x."
            />
          </div>

          <NumberSliderInput
            id="fire-annual-expenses"
            label="Annual Living Expenses (Today's $)"
            value={annualExpenses}
            onChange={setAnnualExpenses}
            min={20000}
            max={250000}
            step={2500}
            prefix={config.symbol}
            tooltip="How much you spend each year to maintain your lifestyle."
          />

          <NumberSliderInput
            id="fire-current-savings"
            label="Current Invested Net Worth"
            value={currentSavings}
            onChange={setCurrentSavings}
            min={0}
            max={1000000}
            step={5000}
            prefix={config.symbol}
            tooltip="Stocks, index funds, 401(k), IRA, and real estate equity."
          />

          <NumberSliderInput
            id="fire-monthly-savings"
            label="Monthly New Investments"
            value={monthlySavings}
            onChange={setMonthlySavings}
            min={0}
            max={10000}
            step={100}
            prefix={config.symbol}
            tooltip="Total dollar amount added to investments every month."
          />

          <NumberSliderInput
            id="fire-expected-return"
            label="Investment Return Rate"
            value={expectedAnnualReturn}
            onChange={setExpectedAnnualReturn}
            min={4.0}
            max={14.0}
            step={0.2}
            suffix="%"
            tooltip="Expected average annual growth of your investment portfolio."
          />
        </div>

        {/* Right Column: FIRE Milestones */}
        <div className="lg:col-span-7 space-y-6">
          <ResultCard
            id="fire-target-number-card"
            title={`${fireVariant.toUpperCase()} FIRE Target Number`}
            value={formatMoney(activeTarget, { compact: true })}
            subtitle={`Target Age: ${results.projectedFireAge} (${results.yearsToFire} years from today)`}
            highlight
            badge={{
              text: `Retire at Age ${results.projectedFireAge}`,
              variant: "positive",
            }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <ResultCard
              id="fire-coast-card"
              title="Coast FIRE Target"
              value={formatMoney(results.coastFireTargetAtCurrentAge, { compact: true })}
              subtitle={results.isAlreadyCoastFire ? "Milestone Achieved!" : "Needed by age 65"}
              badge={
                results.isAlreadyCoastFire
                  ? { text: "Coast FIRE Reached", variant: "positive" }
                  : undefined
              }
            />
            <ResultCard
              id="fire-lean-card"
              title="Lean FIRE"
              value={formatMoney(results.leanFireNumber, { compact: true })}
            />
            <ResultCard
              id="fire-fat-card"
              title="Fat FIRE"
              value={formatMoney(results.fatFireNumber, { compact: true })}
            />
          </div>

          {/* Coast FIRE Callout */}
          {results.isAlreadyCoastFire && (
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50 text-teal-950 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-sm text-teal-900 block">
                  You Have Already Achieved Coast FIRE!
                </span>
                <p>
                  Your current invested balance of <strong>{formatMoney(currentSavings)}</strong> is already large enough that, with compound growth alone at {expectedAnnualReturn}%, it will reach {formatMoney(results.fireNumber, { compact: true })} by age 65 without you ever saving another single penny.
                </p>
              </div>
            </div>
          )}

          {/* Trajectory Area Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Financial Independence Trajectory</h4>
            <p className="text-xs text-slate-500 mb-4">
              Visualizing your net worth compounding toward your FIRE number target.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.yearlyTrajectory} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFireNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="age" tickFormatter={(age) => `Age ${age}`} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => formatMoney(v, { compact: true })} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [formatMoney(val), ""]}
                    labelFormatter={(age) => `At Age ${age}`}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Area
                    type="monotone"
                    name="Projected Net Worth"
                    dataKey="netWorth"
                    stroke="#0f766e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorFireNetWorth)"
                  />
                  <Line
                    type="monotone"
                    name="FIRE Target Line"
                    dataKey="fireTarget"
                    stroke="#e11d48"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={false}
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
