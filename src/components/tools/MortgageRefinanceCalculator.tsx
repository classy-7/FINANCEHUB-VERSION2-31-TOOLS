import React, { useState, useMemo } from "react";
import { RefinanceInputs } from "../../types";
import { calculateRefinance } from "../../utils/financeMath";
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
import {
  Home,
  Percent,
  Calendar,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

export const MortgageRefinanceCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [currentBalance, setCurrentBalance] = useState<number>(320000);
  const [currentRate, setCurrentRate] = useState<number>(6.75);
  const [currentRemainingYears, setCurrentRemainingYears] = useState<number>(26);
  const [newRate, setNewRate] = useState<number>(5.25);
  const [newTermYears, setNewTermYears] = useState<number>(30);
  const [closingCosts, setClosingCosts] = useState<number>(4500);
  const [rollClosingCostsIntoLoan, setRollClosingCostsIntoLoan] = useState<boolean>(false);

  const inputs: RefinanceInputs = useMemo(
    () => ({
      currentBalance,
      currentRate,
      currentRemainingYears,
      newRate,
      newTermYears,
      closingCosts,
      rollClosingCostsIntoLoan,
    }),
    [
      currentBalance,
      currentRate,
      currentRemainingYears,
      newRate,
      newTermYears,
      closingCosts,
      rollClosingCostsIntoLoan,
    ]
  );

  const results = useMemo(() => calculateRefinance(inputs), [inputs]);

  return (
    <div id="refinance-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Current Loan Block */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-slate-600" />
              Existing Mortgage Details
            </h3>

            <NumberSliderInput
              id="refinance-current-balance"
              label="Remaining Loan Balance"
              value={currentBalance}
              onChange={setCurrentBalance}
              min={25000}
              max={2000000}
              step={5000}
              prefix={config.symbol}
            />

            <NumberSliderInput
              id="refinance-current-rate"
              label="Current Interest Rate"
              value={currentRate}
              onChange={setCurrentRate}
              min={2}
              max={12}
              step={0.125}
              suffix="%"
            />

            <NumberSliderInput
              id="refinance-remaining-years"
              label="Remaining Term on Existing Loan"
              value={currentRemainingYears}
              onChange={setCurrentRemainingYears}
              min={1}
              max={30}
              step={1}
              suffix=" yrs"
            />
          </div>

          {/* New Refinanced Loan Block */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-teal-700" />
              New Refinance Loan Terms
            </h3>

            <NumberSliderInput
              id="refinance-new-rate"
              label="New Interest Rate"
              value={newRate}
              onChange={setNewRate}
              min={2}
              max={12}
              step={0.125}
              suffix="%"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                New Loan Term
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 20, 30].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setNewTermYears(term)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                      newTermYears === term
                        ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {term} Years
                  </button>
                ))}
              </div>
            </div>

            <NumberSliderInput
              id="refinance-closing-costs"
              label="Estimated Closing Costs & Fees"
              value={closingCosts}
              onChange={setClosingCosts}
              min={500}
              max={25000}
              step={250}
              prefix={config.symbol}
              tooltip="Lender origination, appraisal, title, escrow, and recording fees (typically 1.5%–3% of loan balance)."
            />

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Roll Closing Costs into New Loan
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Adds fees to principal instead of paying upfront cash
                </span>
              </div>
              <button
                type="button"
                id="refinance-roll-costs-toggle"
                onClick={() => setRollClosingCostsIntoLoan(!rollClosingCostsIntoLoan)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-hidden p-0.5 ${
                  rollClosingCostsIntoLoan ? "bg-teal-800" : "bg-slate-200"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    rollClosingCostsIntoLoan ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Results & Projections */}
        <div className="lg:col-span-7 space-y-6">
          {/* Decision Verdict Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              results.isBeneficial
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : "bg-amber-50/70 border-amber-200 text-amber-950"
            }`}
          >
            {results.isBeneficial ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <span className="font-bold text-sm block">
                {results.isBeneficial
                  ? "Refinancing Is Financially Advantageous"
                  : "Caution: Refinancing May Not Save Money"}
              </span>
              <p className="leading-relaxed">
                {results.isBeneficial
                  ? `By dropping your rate from ${currentRate}% to ${newRate}%, you save approximately ${formatMoney(
                      results.monthlySavings
                    )} each month. You will break even on your ${formatMoney(
                      closingCosts
                    )} closing costs in ${results.breakEvenMonths} months (~${(
                      results.breakEvenMonths / 12
                    ).toFixed(1)} years), resulting in ${formatMoney(
                      results.netLifetimeSavings
                    )} net lifetime savings.`
                  : `Even with a rate modification, the new loan term or ${formatMoney(
                      closingCosts
                    )} closing costs outweigh interest savings, resulting in a net cost of ${formatMoney(
                      Math.abs(results.netLifetimeSavings)
                    )} over the full life of the mortgage.`}
              </p>
            </div>
          </div>

          {/* Core Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="refinance-monthly-savings-card"
              title="Monthly Payment Savings"
              value={formatMoney(results.monthlySavings)}
              subtitle={`From ${formatMoney(results.currentMonthlyPayment)}/mo down to ${formatMoney(
                results.newMonthlyPayment
              )}/mo (P&I)`}
              highlight={results.monthlySavings > 0}
              badge={{
                text: results.monthlySavings > 0 ? "Lower Payment" : "Higher Payment",
                variant: results.monthlySavings > 0 ? "success" : "warning",
              }}
            />

            <ResultCard
              id="refinance-breakeven-card"
              title="Break-Even Timeline"
              value={
                results.breakEvenMonths > 0
                  ? `${results.breakEvenMonths} Months`
                  : "No Break-Even"
              }
              subtitle={
                results.breakEvenMonths > 0
                  ? `Recoups ${formatMoney(closingCosts)} closing fees in ${(
                      results.breakEvenMonths / 12
                    ).toFixed(1)} years`
                  : "Monthly savings do not offset upfront closing costs"
              }
              highlight={false}
              badge={{
                text:
                  results.breakEvenMonths > 0 && results.breakEvenMonths <= 36
                    ? "Fast Payback"
                    : "Extended Payback",
                variant:
                  results.breakEvenMonths > 0 && results.breakEvenMonths <= 36
                    ? "success"
                    : "info",
              }}
            />
          </div>

          {/* Secondary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ResultCard
              id="refinance-net-lifetime-card"
              title="Net Lifetime Savings"
              value={formatMoney(results.netLifetimeSavings)}
              subtitle="After all closing costs"
            />
            <ResultCard
              id="refinance-interest-saved-card"
              title="Total Interest Saved"
              value={formatMoney(results.lifetimeInterestSavings)}
              subtitle="Interest reduction"
            />
            <ResultCard
              id="refinance-new-payment-card"
              title="New Principal & Interest"
              value={formatMoney(results.newMonthlyPayment)}
              subtitle="Per month"
            />
          </div>

          {/* Amortization Projection Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Cumulative Savings & Loan Balance Forecast
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">10-Year Horizon</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.yearlyComparison}>
                  <defs>
                    <linearGradient id="colorCumSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="year"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `Yr ${val}`}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatMoney(val)]}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="cumulativeSavings"
                    name="Net Cash Saved ($)"
                    stroke="#0f766e"
                    fillOpacity={1}
                    fill="url(#colorCumSavings)"
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
