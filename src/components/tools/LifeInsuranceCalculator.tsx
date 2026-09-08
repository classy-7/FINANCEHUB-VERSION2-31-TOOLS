import React, { useState, useMemo } from "react";
import { LifeInsuranceInputs } from "../../types";
import { calculateLifeInsurance } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ShieldCheck, DollarSign, Calendar, Heart, ShieldAlert, CheckCircle2, Info } from "lucide-react";

export const LifeInsuranceCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [annualIncomeToReplace, setAnnualIncomeToReplace] = useState<number>(85000);
  const [yearsOfIncomeReplacement, setYearsOfIncomeReplacement] = useState<number>(15);
  const [mortgageBalance, setMortgageBalance] = useState<number>(340000);
  const [otherDebts, setOtherDebts] = useState<number>(25000);
  const [childrenCollegeFunding, setChildrenCollegeFunding] = useState<number>(120000);
  const [funeralAndFinalExpenses, setFuneralAndFinalExpenses] = useState<number>(15000);
  const [existingSavingsAndInvestments, setExistingSavingsAndInvestments] = useState<number>(65000);
  const [existingLifeInsurance, setExistingLifeInsurance] = useState<number>(50000);

  const inputs: LifeInsuranceInputs = useMemo(
    () => ({
      annualIncomeToReplace,
      yearsOfIncomeReplacement,
      mortgageBalance,
      otherDebts,
      childrenCollegeFunding,
      funeralAndFinalExpenses,
      existingSavingsAndInvestments,
      existingLifeInsurance,
    }),
    [
      annualIncomeToReplace,
      yearsOfIncomeReplacement,
      mortgageBalance,
      otherDebts,
      childrenCollegeFunding,
      funeralAndFinalExpenses,
      existingSavingsAndInvestments,
      existingLifeInsurance,
    ]
  );

  const results = useMemo(() => calculateLifeInsurance(inputs), [inputs]);

  return (
    <div id="life-insurance-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* DIME Inputs */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              The D.I.M.E. Needs Analysis
            </h3>

            {/* Income Replacement */}
            <NumberSliderInput
              id="insurance-income-to-replace"
              label="Annual Income to Replace"
              value={annualIncomeToReplace}
              onChange={setAnnualIncomeToReplace}
              min={20000}
              max={500000}
              step={5000}
              prefix={config.symbol}
            />

            <NumberSliderInput
              id="insurance-years-income"
              label="Years of Income Support Needed"
              value={yearsOfIncomeReplacement}
              onChange={setYearsOfIncomeReplacement}
              min={5}
              max={30}
              step={1}
              suffix=" years"
              tooltip="Usually until your youngest child graduates or your spouse reaches retirement."
            />

            {/* Mortgage */}
            <NumberSliderInput
              id="insurance-mortgage-balance"
              label="Outstanding Mortgage Balance"
              value={mortgageBalance}
              onChange={setMortgageBalance}
              min={0}
              max={1500000}
              step={10000}
              prefix={config.symbol}
              tooltip="Allows your family to stay in the home debt-free."
            />

            {/* Debts & Final Expenses */}
            <div className="grid grid-cols-2 gap-3">
              <NumberSliderInput
                id="insurance-other-debts"
                label="Other Debts (Auto, CC)"
                value={otherDebts}
                onChange={setOtherDebts}
                min={0}
                max={200000}
                step={2500}
                prefix={config.symbol}
              />
              <NumberSliderInput
                id="insurance-funeral-costs"
                label="Final Expenses"
                value={funeralAndFinalExpenses}
                onChange={setFuneralAndFinalExpenses}
                min={5000}
                max={50000}
                step={2500}
                prefix={config.symbol}
                tooltip="Average US funeral & burial costs ~$10,000–$15,000."
              />
            </div>

            {/* Education */}
            <NumberSliderInput
              id="insurance-college-funding"
              label="College Education Fund (All Children)"
              value={childrenCollegeFunding}
              onChange={setChildrenCollegeFunding}
              min={0}
              max={500000}
              step={10000}
              prefix={config.symbol}
            />
          </div>

          {/* Existing Assets (Offset) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-slate-600" />
              Existing Assets & Current Policies
            </h3>

            <NumberSliderInput
              id="insurance-savings-assets"
              label="Current Liquid Savings & Investments"
              value={existingSavingsAndInvestments}
              onChange={setExistingSavingsAndInvestments}
              min={0}
              max={1000000}
              step={5000}
              prefix={config.symbol}
              tooltip="Non-retirement brokerage, savings, and checking accounts that your family could tap."
            />

            <NumberSliderInput
              id="insurance-existing-policy"
              label="Existing Life Insurance Coverage"
              value={existingLifeInsurance}
              onChange={setExistingLifeInsurance}
              min={0}
              max={1000000}
              step={10000}
              prefix={config.symbol}
              tooltip="Current individual term policies or employer group term coverage."
            />
          </div>
        </div>

        {/* Right Column: Results & Itemized Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Result Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="insurance-recommended-coverage-card"
              title="Recommended Coverage (Death Benefit)"
              value={formatMoney(results.recommendedCoverage)}
              subtitle={`Total financial need of ${formatMoney(
                results.grossNeed
              )} minus ${formatMoney(results.existingAssets)} existing assets`}
              highlight={true}
              badge={{
                text: "Recommended Term Size",
                variant: "success",
              }}
            />

            <ResultCard
              id="insurance-gross-need-card"
              title="Total Financial Obligations"
              value={formatMoney(results.grossNeed)}
              subtitle="Sum of D.I.M.E. liabilities"
              highlight={false}
              badge={{
                text: `${yearsOfIncomeReplacement}-Year Support Window`,
                variant: "info",
              }}
            />
          </div>

          {/* Secondary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ResultCard
              id="insurance-income-card"
              title="Income Replacement"
              value={formatMoney(results.dimeIncome)}
              subtitle={`${yearsOfIncomeReplacement} yrs × ${formatMoney(annualIncomeToReplace)}`}
            />
            <ResultCard
              id="insurance-mortgage-card"
              title="Mortgage Payoff"
              value={formatMoney(results.dimeMortgage)}
              subtitle="Full loan payoff"
            />
            <ResultCard
              id="insurance-education-card"
              title="College Funding"
              value={formatMoney(results.dimeEducation)}
              subtitle="Tuition target"
            />
          </div>

          {/* Itemized DIME Bar Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                D.I.M.E. Liability Breakdown
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">By Category</span>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={results.coverageBreakdown}
                  layout="vertical"
                >
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    width={150}
                  />
                  <Tooltip formatter={(val: number) => [formatMoney(val)]} />
                  <Bar dataKey="amount" fill="#0f766e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Term Guidance Callout */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">Recommended Policy Term Length</span>
              <p className="leading-relaxed">
                A <strong>{Math.max(20, yearsOfIncomeReplacement)}-year level term policy</strong> is typically optimal for this scenario. It locks in guaranteed level premiums while covering your family through your peak debt and child-rearing years until your mortgage is extinguished and children are independent.
              </p>
            </div>
          </div>

          {/* YMYL Compliance Insurance Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              <strong>Insurance YMYL Disclaimer:</strong> This tool provides educational illustrations based on the standard DIME methodology. It does not constitute an insurance quote, policy underwriting guarantee, or licensed insurance solicitation. Actual premium rates and coverage eligibility depend on medical underwriting, age, and state regulations. Consult an independent licensed life insurance broker or financial planner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
