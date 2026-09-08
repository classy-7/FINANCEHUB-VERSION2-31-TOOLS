import React, { useState, useMemo } from "react";
import { College529Inputs } from "../../types";
import { calculateCollege529 } from "../../utils/financeMath";
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
import { GraduationCap, DollarSign, Calendar, TrendingUp, CheckCircle2, AlertCircle, Info } from "lucide-react";

export const College529Calculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [childCurrentAge, setChildCurrentAge] = useState<number>(3);
  const [collegeStartAge, setCollegeStartAge] = useState<number>(18);
  const [currentSavings, setCurrentSavings] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(350);
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(7.0);
  const [currentAnnualCollegeCost, setCurrentAnnualCollegeCost] = useState<number>(28000);
  const [collegeCostInflationRate, setCollegeCostInflationRate] = useState<number>(4.5);
  const [yearsInCollege, setYearsInCollege] = useState<number>(4);

  const inputs: College529Inputs = useMemo(
    () => ({
      childCurrentAge,
      collegeStartAge,
      currentSavings,
      monthlyContribution,
      annualReturnRate,
      currentAnnualCollegeCost,
      collegeCostInflationRate,
      yearsInCollege,
    }),
    [
      childCurrentAge,
      collegeStartAge,
      currentSavings,
      monthlyContribution,
      annualReturnRate,
      currentAnnualCollegeCost,
      collegeCostInflationRate,
      yearsInCollege,
    ]
  );

  const results = useMemo(() => calculateCollege529(inputs), [inputs]);

  return (
    <div id="529-college-savings-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Child & Timeline */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-teal-700" />
              Child & College Timeline
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <NumberSliderInput
                id="529-child-age"
                label="Child's Current Age"
                value={childCurrentAge}
                onChange={setChildCurrentAge}
                min={0}
                max={17}
                step={1}
              />
              <NumberSliderInput
                id="529-college-age"
                label="College Start Age"
                value={collegeStartAge}
                onChange={setCollegeStartAge}
                min={childCurrentAge + 1}
                max={22}
                step={1}
              />
            </div>

            <NumberSliderInput
              id="529-years-college"
              label="Years in College"
              value={yearsInCollege}
              onChange={setYearsInCollege}
              min={1}
              max={6}
              step={1}
              suffix=" yrs"
            />
          </div>

          {/* Savings & Contribution */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-teal-700" />
              529 Plan Contributions
            </h3>

            <NumberSliderInput
              id="529-current-savings"
              label="Current 529 Account Balance"
              value={currentSavings}
              onChange={setCurrentSavings}
              min={0}
              max={250000}
              step={1000}
              prefix={config.symbol}
            />

            <NumberSliderInput
              id="529-monthly-contrib"
              label="Planned Monthly Contribution"
              value={monthlyContribution}
              onChange={setMonthlyContribution}
              min={0}
              max={3000}
              step={25}
              prefix={config.symbol}
            />

            <NumberSliderInput
              id="529-return-rate"
              label="Expected Annual Investment Return"
              value={annualReturnRate}
              onChange={setAnnualReturnRate}
              min={1}
              max={12}
              step={0.25}
              suffix="%"
              tooltip="Age-based 529 portfolios transition from aggressive equities to conservative bonds as matriculation nears."
            />
          </div>

          {/* College Costs & Inflation */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-teal-800" />
              College Tuition & Inflation
            </h3>

            <NumberSliderInput
              id="529-annual-cost"
              label="Today's Annual Cost (Tuition + Room & Board)"
              value={currentAnnualCollegeCost}
              onChange={setCurrentAnnualCollegeCost}
              min={5000}
              max={100000}
              step={1000}
              prefix={config.symbol}
              tooltip="Average in-state public: ~$27k/yr; out-of-state public: ~$45k/yr; private non-profit: ~$60k/yr."
            />

            <NumberSliderInput
              id="529-inflation-rate"
              label="Expected College Inflation Rate"
              value={collegeCostInflationRate}
              onChange={setCollegeCostInflationRate}
              min={0}
              max={9}
              step={0.25}
              suffix="%"
              tooltip="Higher education inflation historically outpaces CPI at ~4%–5% annually."
            />
          </div>
        </div>

        {/* Right Column: Results & Projections */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status Verdict Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              results.isSurplus
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : "bg-amber-50/70 border-amber-200 text-amber-950"
            }`}
          >
            {results.isSurplus ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <span className="font-bold text-sm block">
                {results.isSurplus
                  ? `On Track: 100% Target Met (${results.percentFunded}% Funded)`
                  : `Funding Gap: ${results.percentFunded}% Funded`}
              </span>
              <p className="leading-relaxed">
                {results.isSurplus
                  ? `Your projected 529 portfolio balance of ${formatMoney(
                      results.projected529Balance
                    )} completely covers the estimated 4-year inflated college cost of ${formatMoney(
                      results.projectedTotal4YearCost
                    )}, leaving a projected surplus of ${formatMoney(results.fundingGapOrSurplus)}.`
                  : `At your current savings pace, you will face an estimated funding gap of ${formatMoney(
                      Math.abs(results.fundingGapOrSurplus)
                    )}. Increasing your monthly contribution from ${formatMoney(
                      monthlyContribution
                    )} to ${formatMoney(
                      results.recommendedMonthlyContribution
                    )} will achieve 100% tuition coverage.`}
              </p>
            </div>
          </div>

          {/* Primary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="529-projected-balance-card"
              title="Projected 529 Savings"
              value={formatMoney(results.projected529Balance)}
              subtitle={`At age ${collegeStartAge} (${results.yearsUntilCollege} years of compounding)`}
              highlight={true}
              badge={{
                text: `${results.percentFunded}% Funded`,
                variant: results.isSurplus ? "success" : "warning",
              }}
            />

            <ResultCard
              id="529-total-cost-card"
              title="Total 4-Year Inflated Cost"
              value={formatMoney(results.projectedTotal4YearCost)}
              subtitle={`Tuition + living at age ${collegeStartAge} (${formatMoney(
                results.projectedAnnualCostAtStart
              )}/yr)`}
              highlight={false}
              badge={{
                text: `${collegeCostInflationRate}% Cost Inflation`,
                variant: "info",
              }}
            />
          </div>

          {/* Secondary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ResultCard
              id="529-funding-gap-card"
              title={results.isSurplus ? "Projected Surplus" : "Estimated Shortfall"}
              value={formatMoney(Math.abs(results.fundingGapOrSurplus))}
              subtitle={results.isSurplus ? "Excess funds" : "Tuition gap"}
            />
            <ResultCard
              id="529-target-monthly-card"
              title="Target Contribution"
              value={formatMoney(results.recommendedMonthlyContribution)}
              subtitle="For 100% funding"
            />
            <ResultCard
              id="529-first-yr-cost-card"
              title="Year 1 Projected Cost"
              value={formatMoney(results.projectedAnnualCostAtStart)}
              subtitle={`At age ${collegeStartAge}`}
            />
          </div>

          {/* Trajectory Growth Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                529 Account Accumulation Over Time
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">To College Age {collegeStartAge}</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.yearlyProjection}>
                  <defs>
                    <linearGradient id="color529Balance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="childAge"
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
                    labelFormatter={(label) => `Child Age ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="529 Account Value ($)"
                    stroke="#0f766e"
                    fillOpacity={1}
                    fill="url(#color529Balance)"
                  />
                  <Area
                    type="monotone"
                    dataKey="contributions"
                    name="Total Principal Saved ($)"
                    stroke="#64748b"
                    fillOpacity={0.2}
                    fill="#94a3b8"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 529 Rules Callout */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">The SECURE 2.0 Roth Rollover Feature</span>
              <p className="leading-relaxed">
                Under the SECURE 2.0 Act, up to $35,000 of unused 529 funds can be rolled over tax-free into a Roth IRA in the beneficiary’s name (provided the 529 plan has been open for at least 15 years), removing the fear of over-funding your child’s educational account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
