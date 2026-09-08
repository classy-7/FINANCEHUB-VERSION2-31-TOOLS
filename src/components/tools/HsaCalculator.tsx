import React, { useState, useMemo } from "react";
import { HsaInputs } from "../../types";
import { calculateHsa } from "../../utils/financeMath";
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
import { HeartPulse, DollarSign, Calendar, Percent, ShieldCheck, Sparkles, Info } from "lucide-react";

export const HsaCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [coverageType, setCoverageType] = useState<"individual" | "family">("individual");
  const [annualContribution, setAnnualContribution] = useState<number>(3800);
  const [employerContribution, setEmployerContribution] = useState<number>(500);
  const [annualMedicalExpenses, setAnnualMedicalExpenses] = useState<number>(400);
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState<number>(7.5);
  const [marginalTaxRate, setMarginalTaxRate] = useState<number>(30); // 22% fed + 5% state + 7.65% FICA approx

  const maxContributionLimit = coverageType === "individual" ? 4300 : 8550;

  const handleCoverageToggle = (type: "individual" | "family") => {
    setCoverageType(type);
    if (type === "family" && annualContribution < 4300) {
      setAnnualContribution(7500);
    } else if (type === "individual" && annualContribution > 4300) {
      setAnnualContribution(3800);
    }
  };

  const inputs: HsaInputs = useMemo(
    () => ({
      currentAge,
      retirementAge,
      annualContribution,
      employerContribution,
      annualMedicalExpensesPaidFromHsa: annualMedicalExpenses,
      expectedAnnualReturn,
      marginalTaxRate,
    }),
    [
      currentAge,
      retirementAge,
      annualContribution,
      employerContribution,
      annualMedicalExpenses,
      expectedAnnualReturn,
      marginalTaxRate,
    ]
  );

  const results = useMemo(() => calculateHsa(inputs), [inputs]);

  return (
    <div id="hsa-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Coverage & Timeline */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-teal-700" />
              HDHP Coverage & Horizon
            </h3>

            {/* Coverage Type Segmented Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                HDHP Health Plan Tier
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCoverageToggle("individual")}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                    coverageType === "individual"
                      ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Self-Only ($4,300 Max)
                </button>
                <button
                  type="button"
                  onClick={() => handleCoverageToggle("family")}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                    coverageType === "family"
                      ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Family ($8,550 Max)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberSliderInput
                id="hsa-current-age"
                label="Current Age"
                value={currentAge}
                onChange={setCurrentAge}
                min={18}
                max={64}
                step={1}
              />
              <NumberSliderInput
                id="hsa-retirement-age"
                label="Target Age (e.g. 65)"
                value={retirementAge}
                onChange={setRetirementAge}
                min={currentAge + 1}
                max={75}
                step={1}
                tooltip="At age 65, HSA funds can be withdrawn penalty-free for any expense (income tax only), like a Traditional IRA."
              />
            </div>
          </div>

          {/* Contributions & Healthcare Spending */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-teal-700" />
              Contributions & Medical Expenses
            </h3>

            <NumberSliderInput
              id="hsa-annual-contrib"
              label="Your Annual Contribution"
              value={annualContribution}
              onChange={setAnnualContribution}
              min={0}
              max={maxContributionLimit}
              step={100}
              prefix={config.symbol}
            />

            <NumberSliderInput
              id="hsa-employer-contrib"
              label="Employer Contribution"
              value={employerContribution}
              onChange={setEmployerContribution}
              min={0}
              max={3000}
              step={50}
              prefix={config.symbol}
            />

            <NumberSliderInput
              id="hsa-medical-expenses"
              label="Out-of-Pocket Medical Spent from HSA"
              value={annualMedicalExpenses}
              onChange={setAnnualMedicalExpenses}
              min={0}
              max={5000}
              step={50}
              prefix={config.symbol}
              tooltip="Set to $0 to model the 'Stealth IRA' strategy: paying medical costs out-of-pocket and letting 100% of the HSA compound."
            />

            <NumberSliderInput
              id="hsa-return-rate"
              label="Expected Annual Investment Return"
              value={expectedAnnualReturn}
              onChange={setExpectedAnnualReturn}
              min={1}
              max={12}
              step={0.25}
              suffix="%"
            />

            <NumberSliderInput
              id="hsa-marginal-tax-rate"
              label="Total Marginal Tax Rate (Fed + State + FICA)"
              value={marginalTaxRate}
              onChange={setMarginalTaxRate}
              min={10}
              max={55}
              step={1}
              suffix="%"
              tooltip="Payroll HSA contributions are exempt from Federal Income Tax, State Income Tax, AND 7.65% FICA payroll taxes."
            />
          </div>
        </div>

        {/* Right Column: Results & Triple Tax Advantage */}
        <div className="lg:col-span-7 space-y-6">
          {/* Triple Tax Advantage Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-sm block">
                The Triple-Tax Advantage
              </span>
              <p className="leading-relaxed">
                Health Savings Accounts are the only accounts in the US Tax Code featuring a triple-tax shelter: (1) 100% pre-tax contributions exempt from FICA and income tax, (2) 100% tax-free compound investment growth, and (3) 100% tax-free withdrawals for qualified healthcare expenses at any age.
              </p>
            </div>
          </div>

          {/* Primary Result Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="hsa-balance-at-65-card"
              title="Projected HSA Portfolio at 65"
              value={formatMoney(results.projectedBalanceAtRetirement)}
              subtitle={`Accumulated over ${retirementAge - currentAge} years of tax-free growth`}
              highlight={true}
              badge={{
                text: `Age ${retirementAge} Balance`,
                variant: "success",
              }}
            />

            <ResultCard
              id="hsa-total-tax-saved-card"
              title="Total Lifetime Tax Savings"
              value={formatMoney(results.totalTaxSavings)}
              subtitle={`Includes ${formatMoney(
                results.annualUpfrontTaxSavings
              )}/yr upfront income and FICA payroll tax relief`}
              highlight={false}
              badge={{
                text: "Triple Tax Shelter",
                variant: "info",
              }}
            />
          </div>

          {/* Secondary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ResultCard
              id="hsa-upfront-tax-card"
              title="Annual Upfront Tax Saved"
              value={formatMoney(results.annualUpfrontTaxSavings)}
              subtitle="Per year today"
            />
            <ResultCard
              id="hsa-growth-card"
              title="Compound Investment Growth"
              value={formatMoney(results.totalInvestmentGrowth)}
              subtitle="Earnings generated"
            />
            <ResultCard
              id="hsa-employer-total-card"
              title="Employer Contributions"
              value={formatMoney(results.totalEmployerContributions)}
              subtitle="Company funding"
            />
          </div>

          {/* Trajectory Growth Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                HSA Balance & Cumulative Tax Relief Over Time
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">To Age {retirementAge}</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.yearlySchedule}>
                  <defs>
                    <linearGradient id="colorHsaBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
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
                    name="HSA Account Balance ($)"
                    stroke="#0f766e"
                    fillOpacity={1}
                    fill="url(#colorHsaBalance)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeTaxSaved"
                    name="Cumulative Taxes Saved ($)"
                    stroke="#0284c7"
                    fillOpacity={0.2}
                    fill="#0284c7"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strategy Tip Callout */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">The "Receipt Shoebox" Loophole</span>
              <p className="leading-relaxed">
                There is no IRS deadline on when you must reimburse yourself for healthcare expenses. You can pay medical bills out-of-pocket today, keep the digital receipts, let your HSA investments compound untouched for 20–30 years, and withdraw that money 100% tax-free at any time in retirement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
