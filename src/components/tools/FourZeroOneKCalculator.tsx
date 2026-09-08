import React, { useState, useMemo } from "react";
import { FourZeroOneKInputs } from "../../types";
import { calculateFourZeroOneK } from "../../utils/financeMath";
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
  TrendingUp,
  Percent,
  Calendar,
  DollarSign,
  AlertTriangle,
  Gift,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export const FourZeroOneKCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [currentSalary, setCurrentSalary] = useState<number>(85000);
  const [annualSalaryGrowth, setAnnualSalaryGrowth] = useState<number>(3.0);
  const [currentBalance, setCurrentBalance] = useState<number>(35000);
  const [employeeContributionPercent, setEmployeeContributionPercent] = useState<number>(8);
  const [employerMatchPercent, setEmployerMatchPercent] = useState<number>(50); // e.g. 50% match
  const [employerMatchCapPercent, setEmployerMatchCapPercent] = useState<number>(6); // up to 6%
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState<number>(7.5);

  const inputs: FourZeroOneKInputs = useMemo(
    () => ({
      currentAge,
      retirementAge,
      currentSalary,
      annualSalaryGrowth,
      currentBalance,
      employeeContributionPercent,
      employerMatchPercent,
      employerMatchCapPercent,
      expectedAnnualReturn,
    }),
    [
      currentAge,
      retirementAge,
      currentSalary,
      annualSalaryGrowth,
      currentBalance,
      employeeContributionPercent,
      employerMatchPercent,
      employerMatchCapPercent,
      expectedAnnualReturn,
    ]
  );

  const results = useMemo(() => calculateFourZeroOneK(inputs), [inputs]);

  return (
    <div id="401k-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Salary & Balance Details */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-teal-700" />
              Salary & Timeline
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <NumberSliderInput
                id="401k-current-age"
                label="Current Age"
                value={currentAge}
                onChange={setCurrentAge}
                min={18}
                max={75}
                step={1}
              />
              <NumberSliderInput
                id="401k-retirement-age"
                label="Retirement Age"
                value={retirementAge}
                onChange={setRetirementAge}
                min={currentAge + 1}
                max={80}
                step={1}
              />
            </div>

            <NumberSliderInput
              id="401k-salary-input"
              label="Current Annual Gross Salary"
              value={currentSalary}
              onChange={setCurrentSalary}
              min={20000}
              max={600000}
              step={2500}
              prefix={config.symbol}
            />

            <NumberSliderInput
              id="401k-salary-growth"
              label="Expected Annual Raise / Merit"
              value={annualSalaryGrowth}
              onChange={setAnnualSalaryGrowth}
              min={0}
              max={10}
              step={0.25}
              suffix="%"
            />

            <NumberSliderInput
              id="401k-current-balance"
              label="Current 401(k) Balance"
              value={currentBalance}
              onChange={setCurrentBalance}
              min={0}
              max={2000000}
              step={5000}
              prefix={config.symbol}
            />
          </div>

          {/* Contributions & Match Formula */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-teal-700" />
              Contributions & Employer Match
            </h3>

            <NumberSliderInput
              id="401k-employee-contrib"
              label="Your Contribution Rate (% of Salary)"
              value={employeeContributionPercent}
              onChange={setEmployeeContributionPercent}
              min={0}
              max={30}
              step={1}
              suffix="%"
              tooltip="IRS 2026 elective deferral limit applies ($23,500/yr + $7,500 catch-up if 50+)."
            />

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                Company Match Formula
              </span>
              <div className="grid grid-cols-2 gap-3">
                <NumberSliderInput
                  id="401k-match-rate"
                  label="Match Rate"
                  value={employerMatchPercent}
                  onChange={setEmployerMatchPercent}
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                  tooltip="e.g., 50% = 50 cents on the dollar"
                />
                <NumberSliderInput
                  id="401k-match-cap"
                  label="Up to % Salary"
                  value={employerMatchCapPercent}
                  onChange={setEmployerMatchCapPercent}
                  min={0}
                  max={15}
                  step={0.5}
                  suffix="%"
                  tooltip="Max salary percentage matched by employer"
                />
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Formula: {employerMatchPercent}% match on contributions up to {employerMatchCapPercent}% of salary.
              </p>
            </div>

            <NumberSliderInput
              id="401k-investment-return"
              label="Expected Annual Return"
              value={expectedAnnualReturn}
              onChange={setExpectedAnnualReturn}
              min={1}
              max={14}
              step={0.25}
              suffix="%"
              tooltip="Historical S&P 500 average is ~10% nominal, ~7% real after inflation."
            />
          </div>
        </div>

        {/* Right Column: Results & Projections */}
        <div className="lg:col-span-7 space-y-6">
          {/* Match Alert Banner */}
          {results.isLeavingMatchOnTable ? (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-amber-950 flex items-start gap-3.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-sm block">
                  Leaving Employer Match Money on the Table!
                </span>
                <p className="leading-relaxed">
                  You are currently contributing {employeeContributionPercent}%, but your employer matches up to{" "}
                  {employerMatchCapPercent}%. By increasing your contribution by{" "}
                  {(employerMatchCapPercent - employeeContributionPercent).toFixed(1)}%, you would capture an extra{" "}
                  <strong className="font-bold text-amber-900">
                    {formatMoney(results.unclaimedMatchAnnual)}/year
                  </strong>{" "}
                  in 100% guaranteed free money from your company.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex items-start gap-3.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-sm block">
                  Full Employer Match Captured!
                </span>
                <p className="leading-relaxed">
                  Congratulations! Contributing {employeeContributionPercent}% successfully unlocks 100% of your available employer match ({formatMoney(results.firstYearEmployerMatch)} in year one).
                </p>
              </div>
            </div>
          )}

          {/* Primary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="401k-final-balance-card"
              title="Projected 401(k) at Retirement"
              value={formatMoney(results.projectedBalance)}
              subtitle={`Accumulated by age ${retirementAge} (${retirementAge - currentAge} years of compounding)`}
              highlight={true}
              badge={{
                text: `Age ${retirementAge} Balance`,
                variant: "success",
              }}
            />

            <ResultCard
              id="401k-total-match-card"
              title="Total Employer Match"
              value={formatMoney(results.totalEmployerMatch)}
              subtitle={`Free money contributed by your employer over ${retirementAge - currentAge} years`}
              highlight={false}
              badge={{
                text: "Free Money",
                variant: "info",
              }}
            />
          </div>

          {/* Secondary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ResultCard
              id="401k-your-contribs-card"
              title="Your Total Contributions"
              value={formatMoney(results.totalEmployeeContributions)}
              subtitle="Principal saved"
            />
            <ResultCard
              id="401k-growth-card"
              title="Compound Growth"
              value={formatMoney(results.totalGrowth)}
              subtitle="Investment earnings"
            />
            <ResultCard
              id="401k-first-year-match-card"
              title="Year 1 Company Match"
              value={formatMoney(results.firstYearEmployerMatch)}
              subtitle="Annual match"
            />
          </div>

          {/* Stacked Growth Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Portfolio Trajectory: Contributions vs. Growth
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">To Age {retirementAge}</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.yearlyBreakdown}>
                  <defs>
                    <linearGradient id="color401kGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="color401kMatch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="age"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `Age ${val}`}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatMoney(val)]}
                    labelFormatter={(label) => `Age ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="Total Portfolio Balance ($)"
                    stroke="#0f766e"
                    fillOpacity={1}
                    fill="url(#color401kGrowth)"
                  />
                  <Area
                    type="monotone"
                    dataKey="totalContributions"
                    name="Cumulative Contributions ($)"
                    stroke="#64748b"
                    fillOpacity={0.3}
                    fill="#94a3b8"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* YMYL Compliance Disclaimer Callout */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              <strong>Retirement YMYL Disclaimer:</strong> This projection assumes consistent annual returns and wage growth, and does not account for IRS annual maximum additions ($69,000 for 2024/2026), plan vesting schedules, or mandatory Required Minimum Distributions (RMDs) beginning at age 73/75. Consult a qualified Certified Financial Planner (CFP) or your employer’s plan administrator for personalized retirement guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
