import React, { useState, useEffect, useMemo } from "react";
import { InvestmentInputs } from "../../types";
import { calculateInvestment } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import { getQueryParamNumber, getQueryParamString, updateUrlQueryParams } from "../../utils/urlState";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Sparkles, Layers } from "lucide-react";

export const InvestmentCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [initialDeposit, setInitialDeposit] = useState<number>(() => getQueryParamNumber("init", 5000));
  const [monthlyContribution, setMonthlyContribution] = useState<number>(() => getQueryParamNumber("monthly", 300));
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(() => getQueryParamNumber("rate", 8.0));
  const [compoundingFrequency, setCompoundingFrequency] = useState<
    "annually" | "semiannually" | "quarterly" | "monthly" | "daily"
  >(() => getQueryParamString("comp", "monthly") as any);
  const [durationYears, setDurationYears] = useState<number>(() => getQueryParamNumber("years", 25));

  useEffect(() => {
    updateUrlQueryParams({
      init: initialDeposit,
      monthly: monthlyContribution,
      rate: annualReturnRate,
      comp: compoundingFrequency,
      years: durationYears,
    });
  }, [initialDeposit, monthlyContribution, annualReturnRate, compoundingFrequency, durationYears]);

  const inputs: InvestmentInputs = useMemo(() => ({
    initialDeposit,
    monthlyContribution,
    annualReturnRate,
    compoundingFrequency,
    durationYears,
  }), [initialDeposit, monthlyContribution, annualReturnRate, compoundingFrequency, durationYears]);

  const results = useMemo(() => calculateInvestment(inputs), [inputs]);

  const multiplier =
    results.totalContributions > 0
      ? (results.finalBalance / results.totalContributions).toFixed(1)
      : "1.0";

  return (
    <div id="investment-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <NumberSliderInput
            id="invest-initial-deposit"
            label="Initial Investment Deposit"
            value={initialDeposit}
            onChange={setInitialDeposit}
            min={0}
            max={250000}
            step={500}
            prefix={config.symbol}
            tooltip="Starting capital invested on day one."
          />

          <NumberSliderInput
            id="invest-monthly-contrib"
            label="Monthly Recurring Deposit"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            min={0}
            max={5000}
            step={25}
            prefix={config.symbol}
            tooltip="Regular monthly addition to your portfolio."
          />

          <NumberSliderInput
            id="invest-return-rate"
            label="Estimated Annual Rate of Return"
            value={annualReturnRate}
            onChange={setAnnualReturnRate}
            min={1.0}
            max={18.0}
            step={0.1}
            suffix="%"
            tooltip="Average annualized return. S&P 500 historical average is ~10%."
          />

          <NumberSliderInput
            id="invest-duration"
            label="Investment Duration"
            value={durationYears}
            onChange={setDurationYears}
            min={1}
            max={40}
            step={1}
            suffix=" Years"
            tooltip="Length of time your investment will compound."
          />

          {/* Compounding Frequency Toggle */}
          <div className="py-2 border-t border-slate-100 space-y-2">
            <label className="text-sm font-semibold text-slate-800 block">
              Compounding Frequency
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
              {[
                { id: "daily", label: "Daily" },
                { id: "monthly", label: "Monthly" },
                { id: "quarterly", label: "Quarterly" },
                { id: "semiannually", label: "Semi-Annual" },
                { id: "annually", label: "Annually" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCompoundingFrequency(c.id as any)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                    compoundingFrequency === c.id
                      ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Results & Visualization */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Result Card */}
          <ResultCard
            id="invest-final-balance-card"
            title="Projected Future Wealth"
            value={formatMoney(results.finalBalance)}
            subtitle={`Total Contributed: ${formatMoney(results.totalContributions)} | Total Interest: ${formatMoney(results.totalInterestEarned)}`}
            highlight
            badge={{ text: `${multiplier}x Return Multiplier`, variant: "positive" }}
          />

          {/* Secondary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <ResultCard
              id="invest-contrib-card"
              title="Your Contributions"
              value={formatMoney(results.totalContributions, { compact: true })}
            />
            <ResultCard
              id="invest-interest-card"
              title="Compound Earnings"
              value={formatMoney(results.totalInterestEarned, { compact: true })}
            />
            <ResultCard
              id="invest-interest-ratio-card"
              title="Earnings Ratio"
              value={`${results.finalBalance > 0 ? ((results.totalInterestEarned / results.finalBalance) * 100).toFixed(0) : 0}%`}
              subtitle="Portion from pure interest"
            />
          </div>

          {/* Recharts Area Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Growth of Principal vs. Compounded Interest</h4>
            <p className="text-xs text-slate-500 mb-4">
              Watch how compounded returns overtake your principal contributions over time.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.yearlyBreakdown} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInvestBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorInvestContrib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tickFormatter={(yr) => `Yr ${yr}`} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(val) => formatMoney(val, { compact: true })} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [formatMoney(val), ""]}
                    labelFormatter={(yr) => `End of Year ${yr}`}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Area
                    type="monotone"
                    name="Total Balance"
                    dataKey="balance"
                    stroke="#0f766e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInvestBalance)"
                  />
                  <Area
                    type="monotone"
                    name="Principal Contributions"
                    dataKey="totalContributions"
                    stroke="#0284c7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInvestContrib)"
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
