import React, { useState, useMemo } from "react";
import { SocialSecurityInputs } from "../../types";
import { calculateSocialSecurity } from "../../utils/financeMath";
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
  Cell,
} from "recharts";
import { Landmark, Calendar, DollarSign, TrendingUp, AlertTriangle, ShieldAlert, CheckCircle2, ExternalLink } from "lucide-react";

export const SocialSecurityCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [currentAge, setCurrentAge] = useState<number>(55);
  const [currentAnnualSalary, setCurrentAnnualSalary] = useState<number>(95000);
  const [plannedClaimingAge, setPlannedClaimingAge] = useState<number>(67);

  const inputs: SocialSecurityInputs = useMemo(
    () => ({
      currentAge,
      currentAnnualSalary,
      plannedClaimingAge,
    }),
    [currentAge, currentAnnualSalary, plannedClaimingAge]
  );

  const results = useMemo(() => calculateSocialSecurity(inputs), [inputs]);

  return (
    <div id="social-security-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Personal Info & Salary */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-teal-700" />
              Earnings & Claiming Target
            </h3>

            <NumberSliderInput
              id="ssa-current-age"
              label="Current Age"
              value={currentAge}
              onChange={setCurrentAge}
              min={25}
              max={69}
              step={1}
            />

            <NumberSliderInput
              id="ssa-annual-salary"
              label="Current / Career Average Annual Salary"
              value={currentAnnualSalary}
              onChange={setCurrentAnnualSalary}
              min={15000}
              max={250000}
              step={2500}
              prefix={config.symbol}
              tooltip="Social Security taxes are capped at the maximum taxable earnings limit ($176,100 in 2026)."
            />

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Planned Claiming Age ({plannedClaimingAge})
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[62, 67, 70].map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => setPlannedClaimingAge(age)}
                    className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all text-center ${
                      plannedClaimingAge === age
                        ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Age {age} {age === 62 ? "(Early)" : age === 67 ? "(FRA)" : "(Max)"}
                  </button>
                ))}
              </div>
            </div>

            <NumberSliderInput
              id="ssa-claiming-age-slider"
              label="Fine-Tune Claiming Age"
              value={plannedClaimingAge}
              onChange={setPlannedClaimingAge}
              min={62}
              max={70}
              step={1}
              suffix=" years old"
            />
          </div>

          {/* Quick Key Reference Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              The Claiming Timeline Rule
            </h4>
            <div className="space-y-2 text-slate-600 leading-relaxed">
              <p>
                • <strong>Age 62 (Earliest):</strong> Permanent 30% reduction from your Full Retirement Age baseline.
              </p>
              <p>
                • <strong>Age 67 (Full Retirement Age):</strong> 100% of your Primary Insurance Amount (PIA).
              </p>
              <p>
                • <strong>Age 70 (Maximum):</strong> Earns 8% per year in delayed retirement credits (+24% permanent boost).
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Results & Break-Even Analysis */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="ssa-monthly-benefit-card"
              title={`Monthly Benefit at Age ${plannedClaimingAge}`}
              value={formatMoney(results.benefitAtClaimingAge)}
              subtitle={`${formatMoney(results.benefitAtClaimingAge * 12)}/yr (${
                results.percentageOfPia
              }% of Full PIA)`}
              highlight={true}
              badge={{
                text:
                  plannedClaimingAge === 67
                    ? "Full Benefit (100%)"
                    : plannedClaimingAge < 67
                    ? `${100 - results.percentageOfPia}% Early Reduction`
                    : `+${results.percentageOfPia - 100}% Delayed Credit`,
                variant:
                  plannedClaimingAge >= 67 ? "success" : "warning",
              }}
            />

            <ResultCard
              id="ssa-full-pia-card"
              title="Full Retirement Age (Age 67)"
              value={formatMoney(results.benefitAt67)}
              subtitle={`${formatMoney(results.benefitAt67 * 12)}/year (100% PIA)`}
              highlight={false}
              badge={{
                text: "Baseline Benchmark",
                variant: "info",
              }}
            />
          </div>

          {/* Age 62 vs 67 vs 70 Comparison Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ResultCard
              id="ssa-age-62-card"
              title="Age 62 (Early)"
              value={formatMoney(results.benefitAt62)}
              subtitle="70% of PIA"
            />
            <ResultCard
              id="ssa-age-70-card"
              title="Age 70 (Delayed)"
              value={formatMoney(results.benefitAt70)}
              subtitle="124% of PIA (+24%)"
            />
            <ResultCard
              id="ssa-breakeven-card"
              title="Break-Even Age (62 vs 67)"
              value={`~Age ${results.breakEvenAge62vs67}`}
              subtitle="Crossover point"
            />
          </div>

          {/* Benefit Comparison Bar Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Monthly Payout by Claiming Age (62 to 70)
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">Permanent Monthly Income</span>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results.ageBenefitTable}>
                  <XAxis
                    dataKey="age"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `Age ${val}`}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatMoney(val), "Monthly Benefit"]}
                    labelFormatter={(label) => `Claiming at Age ${label}`}
                  />
                  <Bar dataKey="monthlyBenefit" radius={[4, 4, 0, 0]}>
                    {results.ageBenefitTable.map((entry) => (
                      <Cell
                        key={`cell-${entry.age}`}
                        fill={entry.age === plannedClaimingAge ? "#0f766e" : "#cbd5e1"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Official SSA Link & Guidance */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-start gap-2.5">
            <ExternalLink className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">
                Official Social Security Administration Verification
              </span>
              <p className="leading-relaxed">
                For your exact lifetime wage history and certified estimates, create an account on the official{" "}
                <a
                  href="https://www.ssa.gov/myaccount/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-teal-800 hover:underline"
                >
                  SSA.gov my Social Security portal
                </a>
                . Actual benefits are based on your highest 35 years of indexed earnings.
              </p>
            </div>
          </div>

          {/* YMYL Compliance Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              <strong>Social Security YMYL Disclaimer:</strong> This calculator provides mathematical estimations based on statutory formulas, 2026 bend points, and constant real earnings. It does not account for spousal benefits, survivor benefits, the Government Pension Offset (GPO), or Windfall Elimination Provision (WEP). Consult the Social Security Administration or a licensed CFP for personalized retirement planning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
