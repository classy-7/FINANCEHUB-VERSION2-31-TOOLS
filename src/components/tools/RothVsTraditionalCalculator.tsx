import React, { useState, useMemo } from "react";
import { RothVsTraditionalInputs } from "../../types";
import { calculateRothVsTraditional } from "../../utils/financeMath";
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
  Legend,
} from "recharts";
import {
  Scale,
  Percent,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";

export const RothVsTraditionalCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [annualContribution, setAnnualContribution] = useState<number>(7000);
  const [currentTaxRate, setCurrentTaxRate] = useState<number>(24);
  const [retirementTaxRate, setRetirementTaxRate] = useState<number>(18);
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState<number>(7.5);

  const inputs: RothVsTraditionalInputs = useMemo(
    () => ({
      currentAge,
      retirementAge,
      annualContribution,
      currentTaxRate,
      retirementTaxRate,
      expectedAnnualReturn,
    }),
    [
      currentAge,
      retirementAge,
      annualContribution,
      currentTaxRate,
      retirementTaxRate,
      expectedAnnualReturn,
    ]
  );

  const results = useMemo(() => calculateRothVsTraditional(inputs), [inputs]);

  return (
    <div id="roth-vs-traditional-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Contribution & Timeframe */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-700" />
              Horizon & Contributions
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <NumberSliderInput
                id="roth-current-age"
                label="Current Age"
                value={currentAge}
                onChange={setCurrentAge}
                min={18}
                max={70}
                step={1}
              />
              <NumberSliderInput
                id="roth-retirement-age"
                label="Retirement Age"
                value={retirementAge}
                onChange={setRetirementAge}
                min={currentAge + 1}
                max={80}
                step={1}
              />
            </div>

            <NumberSliderInput
              id="roth-annual-contrib"
              label="Annual Contribution"
              value={annualContribution}
              onChange={setAnnualContribution}
              min={500}
              max={23500}
              step={250}
              prefix={config.symbol}
              tooltip="2026 IRA limit: $7,000 ($8,000 if 50+). 401(k) limit: $23,500 ($31,000 if 50+)."
            />

            <NumberSliderInput
              id="roth-annual-return"
              label="Expected Annual Return"
              value={expectedAnnualReturn}
              onChange={setExpectedAnnualReturn}
              min={1}
              max={12}
              step={0.25}
              suffix="%"
            />
          </div>

          {/* Tax Rates Comparison */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-teal-700" />
              Tax Bracket Comparison
            </h3>

            <NumberSliderInput
              id="roth-current-tax-rate"
              label="Current Marginal Tax Rate (Fed + State)"
              value={currentTaxRate}
              onChange={setCurrentTaxRate}
              min={0}
              max={50}
              step={1}
              suffix="%"
              tooltip="The tax rate you pay today on your highest dollar of income."
            />

            <NumberSliderInput
              id="roth-retire-tax-rate"
              label="Expected Retirement Tax Rate"
              value={retirementTaxRate}
              onChange={setRetirementTaxRate}
              min={0}
              max={50}
              step={1}
              suffix="%"
              tooltip="Expected effective tax rate when withdrawing funds during retirement."
            />

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1">
              <span className="font-bold text-slate-800 block">The Core Tax Rule:</span>
              <p>
                If your tax rate will be <strong>higher in retirement</strong>, pay taxes now with <strong>Roth</strong>. If your tax rate will be <strong>lower in retirement</strong>, take the upfront tax break now with <strong>Traditional</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Results & Comparison */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recommendation Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              results.advantageType === "roth"
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : results.advantageType === "traditional"
                ? "bg-blue-50/70 border-blue-200 text-blue-950"
                : "bg-slate-50 border-slate-200 text-slate-900"
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-sm block">
                {results.advantageType === "roth"
                  ? "Roth IRA / 401(k) Is Recommended"
                  : results.advantageType === "traditional"
                  ? "Traditional IRA / 401(k) Is Recommended"
                  : "Both Options Offer Equivalent Value"}
              </span>
              <p className="leading-relaxed">{results.recommendation}</p>
            </div>
          </div>

          {/* Core Result Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="roth-after-tax-card"
              title="Roth After-Tax Value"
              value={formatMoney(results.rothAfterTaxValue)}
              subtitle={`100% tax-free withdrawals at age ${retirementAge}`}
              highlight={results.advantageType === "roth"}
              badge={{
                text: "Tax-Free Growth",
                variant: results.advantageType === "roth" ? "success" : "info",
              }}
            />

            <ResultCard
              id="trad-after-tax-card"
              title="Traditional After-Tax Value"
              value={formatMoney(results.traditionalWithTaxSavingsInvested)}
              subtitle={`With upfront tax savings invested (${formatMoney(
                results.traditionalAfterTaxValue
              )} net from 401k/IRA)`}
              highlight={results.advantageType === "traditional"}
              badge={{
                text: "Upfront Tax Deduction",
                variant: results.advantageType === "traditional" ? "success" : "info",
              }}
            />
          </div>

          {/* Secondary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ResultCard
              id="roth-advantage-amt-card"
              title="Net Advantage"
              value={formatMoney(results.differenceAmount)}
              subtitle={`Favoring ${results.advantageType.toUpperCase()}`}
            />
            <ResultCard
              id="trad-nominal-balance-card"
              title="Traditional Pre-Tax Balance"
              value={formatMoney(results.traditionalBalance)}
              subtitle="Before retirement taxes"
            />
            <ResultCard
              id="trad-tax-owed-card"
              title="Taxes Due in Retirement"
              value={formatMoney(results.traditionalTaxAtRetirement)}
              subtitle={`At ${retirementTaxRate}% rate`}
            />
          </div>

          {/* Balance Comparison Bar Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                After-Tax Purchasing Power at Retirement
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">Age {retirementAge}</span>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Roth (100% Tax-Free)",
                      value: results.rothAfterTaxValue,
                      fill: "#0f766e",
                    },
                    {
                      name: "Traditional (Base Net)",
                      value: results.traditionalAfterTaxValue,
                      fill: "#64748b",
                    },
                    {
                      name: "Traditional (+ Invested Savings)",
                      value: results.traditionalWithTaxSavingsInvested,
                      fill: "#0284c7",
                    },
                  ]}
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
                    width={180}
                  />
                  <Tooltip formatter={(val: number) => [formatMoney(val)]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* YMYL Tax Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              <strong>Tax & Retirement YMYL Disclaimer:</strong> Future Federal and State income tax brackets are subject to legislative revision. This model assumes constant marginal tax brackets and full reinvestment of upfront tax savings. Neither FinanceHub nor this calculator provides certified tax or legal counsel. Always consult a Certified Public Accountant (CPA) or CFP before finalizing account election structures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
