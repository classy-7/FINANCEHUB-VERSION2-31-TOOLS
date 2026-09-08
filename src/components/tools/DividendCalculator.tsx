import React, { useState, useMemo } from "react";
import { DividendInputs } from "../../types";
import { calculateDividend } from "../../utils/financeMath";
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
import { DollarSign, TrendingUp, RefreshCw, Calendar, Sparkles } from "lucide-react";

export const DividendCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [initialInvestment, setInitialInvestment] = useState<number>(25000);
  const [annualDividendYield, setAnnualDividendYield] = useState<number>(3.8);
  const [annualDividendGrowthRate, setAnnualDividendGrowthRate] = useState<number>(6.0);
  const [stockPriceAppreciationRate, setStockPriceAppreciationRate] = useState<number>(4.5);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [reinvestDividends, setReinvestDividends] = useState<boolean>(true);
  const [yearsToInvest, setYearsToInvest] = useState<number>(20);

  const inputs: DividendInputs = useMemo(
    () => ({
      initialInvestment,
      annualDividendYield,
      annualDividendGrowthRate,
      stockPriceAppreciationRate,
      monthlyContribution,
      reinvestDividends,
      yearsToInvest,
    }),
    [
      initialInvestment,
      annualDividendYield,
      annualDividendGrowthRate,
      stockPriceAppreciationRate,
      monthlyContribution,
      reinvestDividends,
      yearsToInvest,
    ]
  );

  const results = useMemo(() => calculateDividend(inputs), [inputs]);

  return (
    <div id="dividend-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* DRIP Toggle Banner */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Dividend Reinvestment Plan (DRIP)
                </span>
                <span className="text-[11px] text-slate-500">Automatically purchase more shares with payouts</span>
              </div>
              <button
                type="button"
                id="btn-toggle-drip"
                onClick={() => setReinvestDividends(!reinvestDividends)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  reinvestDividends ? "bg-teal-700" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    reinvestDividends ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Investment Parameters */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Portfolio & Growth Assumptions</h3>

            <NumberSliderInput
              id="div-initial"
              label="Starting Portfolio Value"
              value={initialInvestment}
              onChange={setInitialInvestment}
              min={1000}
              max={500000}
              step={1000}
              prefix={config.symbol}
            />

            <NumberSliderInput
              id="div-monthly"
              label="Monthly Additional Contribution"
              value={monthlyContribution}
              onChange={setMonthlyContribution}
              min={0}
              max={5000}
              step={50}
              prefix={config.symbol}
              suffix="/mo"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberSliderInput
                id="div-yield"
                label="Dividend Yield"
                value={annualDividendYield}
                onChange={setAnnualDividendYield}
                min={1.0}
                max={12.0}
                step={0.1}
                suffix="%"
                tooltip="Current annual dividend payout as a % of share price (e.g., SCHD ~3.5%, VYM ~3.0%)."
              />
              <NumberSliderInput
                id="div-growth"
                label="Dividend Growth Rate"
                value={annualDividendGrowthRate}
                onChange={setAnnualDividendGrowthRate}
                min={0}
                max={15.0}
                step={0.5}
                suffix="%"
                tooltip="Annual percentage increase in company dividend payouts (Dividend Aristocrats avg 5%–8%)."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberSliderInput
                id="div-appreciation"
                label="Stock Price Growth"
                value={stockPriceAppreciationRate}
                onChange={setStockPriceAppreciationRate}
                min={0}
                max={12.0}
                step={0.5}
                suffix="%"
                tooltip="Annual capital appreciation of the underlying equities."
              />
              <NumberSliderInput
                id="div-years"
                label="Time Horizon"
                value={yearsToInvest}
                onChange={setYearsToInvest}
                min={2}
                max={40}
                step={1}
                suffix=" yrs"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Key Results & Compounding Chart */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Result Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="result-final-portfolio"
              title={`Final Portfolio Value (Yr ${yearsToInvest})`}
              value={formatMoney(results.finalPortfolioValue)}
              subtitle={`Total cumulative dividends earned: ${formatMoney(results.totalDividendsEarned)}`}
              highlight={true}
              badge={{
                text: reinvestDividends ? "DRIP Compounded" : "Dividends Taken as Cash",
                variant: "positive",
              }}
            />

            <ResultCard
              id="result-annual-dividends"
              title="Annual Passive Dividend Income"
              value={`${formatMoney(results.annualDividendIncomeAtEnd)}/yr`}
              subtitle={`Equivalent to ${formatMoney(results.monthlyDividendIncomeAtEnd)} / month in passive cash flow`}
              highlight={false}
              badge={{
                text: "Passive Cash Flow",
                variant: "info",
              }}
            />
          </div>

          {/* DRIP Compounding Advantage Callout */}
          {reinvestDividends && results.dripAdvantageAmount > 0 && (
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 flex items-start gap-3.5">
              <Sparkles className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">The DRIP Snowball Advantage</p>
                <p className="text-xs mt-1 leading-relaxed">
                  By automatically reinvesting dividends, your portfolio accumulates an additional{" "}
                  <strong>{formatMoney(results.dripAdvantageAmount)}</strong> in extra wealth over {yearsToInvest} years
                  compared to taking payouts as idle cash!
                </p>
              </div>
            </div>
          )}

          {/* Portfolio Growth Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-700" />
                Dividend Snowball Growth Trajectory
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">Capital + Dividend Compounding</span>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.yearlySchedule} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="divPortGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tickFormatter={(y) => `Yr ${y}`} stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `${config.symbol}${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatMoney(Number(val)), ""]}
                    labelFormatter={(y) => `Year ${y}`}
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
                    dataKey="portfolioValue"
                    name="Portfolio Balance"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#divPortGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="annualDividend"
                    name="Annual Dividend Payout"
                    stroke="#d97706"
                    strokeWidth={2}
                    fillOpacity={0.1}
                    fill="#d97706"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Schedule Milestone Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              Annual Cash Flow Milestones
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold uppercase">
                    <th className="py-2 px-3">Year</th>
                    <th className="py-2 px-3">Portfolio Balance</th>
                    <th className="py-2 px-3">Annual Dividend</th>
                    <th className="py-2 px-3">Monthly Income</th>
                    <th className="py-2 px-3 text-right">Cumulative Dividends</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {results.yearlySchedule
                    .filter((r) => r.year % 5 === 0 || r.year === yearsToInvest || r.year === 1)
                    .map((row) => (
                      <tr key={row.year} className="hover:bg-slate-50 text-slate-700 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-900">Yr {row.year}</td>
                        <td className="py-2 px-3 font-bold text-teal-900">{formatMoney(row.portfolioValue)}</td>
                        <td className="py-2 px-3 text-amber-800 font-semibold">{formatMoney(row.annualDividend)}</td>
                        <td className="py-2 px-3">{formatMoney(row.monthlyDividend)}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-600">
                          {formatMoney(row.cumulativeDividends)}
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
