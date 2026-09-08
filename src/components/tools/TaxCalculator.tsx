import React, { useState, useMemo } from "react";
import { TaxInputs } from "../../types";
import { calculateTax } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import taxRules2026 from "../../../data/tax-rules/2026.json";
import { ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export const TaxCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [filingStatus, setFilingStatus] = useState<"single" | "married" | "headOfHousehold">("single");
  const [annualIncome, setAnnualIncome] = useState<number>(95000);
  const [stateCode, setStateCode] = useState<string>("TX");
  const [deductionType, setDeductionType] = useState<"standard" | "itemized">("standard");
  const [itemizedDeductions, setItemizedDeductions] = useState<number>(18000);
  const [dependentsCount, setDependentsCount] = useState<number>(0);
  const [retirement401kContributions, setRetirement401kContributions] = useState<number>(6000);
  const [otherPreTaxDeductions, setOtherPreTaxDeductions] = useState<number>(1200);

  const standardDed =
    taxRules2026.federal.standardDeductions[filingStatus] ||
    taxRules2026.federal.standardDeductions.single;

  const inputs: TaxInputs = useMemo(() => ({
    filingStatus,
    annualIncome,
    stateCode,
    deductionType,
    itemizedDeductions,
    dependentsCount,
    retirement401kContributions,
    otherPreTaxDeductions,
  }), [
    filingStatus,
    annualIncome,
    stateCode,
    deductionType,
    itemizedDeductions,
    dependentsCount,
    retirement401kContributions,
    otherPreTaxDeductions,
  ]);

  const results = useMemo(() => calculateTax(inputs), [inputs]);

  const availableStates = Object.entries(taxRules2026.states).map(([code, s]) => ({
    code,
    name: s.name,
    isZero: s.type === "none",
  }));

  return (
    <div id="tax-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filing Status */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800 block">Filing Status</label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
              {[
                { id: "single", label: "Single" },
                { id: "married", label: "Married Joint" },
                { id: "headOfHousehold", label: "Head of House" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setFilingStatus(s.id as any)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                    filingStatus === s.id
                      ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <NumberSliderInput
            id="tax-annual-income"
            label="Gross Annual Household Income"
            value={annualIncome}
            onChange={setAnnualIncome}
            min={15000}
            max={600000}
            step={1000}
            prefix={config.symbol}
            tooltip="W-2 wages, 1099 earnings, and other taxable income."
          />

          {/* State Selector */}
          <div className="py-2 border-t border-slate-100 space-y-1.5">
            <label htmlFor="tax-state-select" className="text-sm font-semibold text-slate-800 block">
              State of Residence
            </label>
            <select
              id="tax-state-select"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="w-full text-sm font-medium py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              {availableStates.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} {s.isZero ? "(0% State Tax)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Deduction Type Toggle */}
          <div className="py-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-800">Deduction Method</label>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDeductionType("standard")}
                  className={`px-2.5 py-0.5 rounded ${
                    deductionType === "standard" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  Standard ({formatMoney(standardDed)})
                </button>
                <button
                  type="button"
                  onClick={() => setDeductionType("itemized")}
                  className={`px-2.5 py-0.5 rounded ${
                    deductionType === "itemized" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  Itemized
                </button>
              </div>
            </div>

            {deductionType === "itemized" && (
              <NumberSliderInput
                id="tax-itemized-amt"
                label="Itemized Deductions (Mortgage Int, SALT, Charity)"
                value={itemizedDeductions}
                onChange={setItemizedDeductions}
                min={0}
                max={60000}
                step={500}
                prefix={config.symbol}
              />
            )}
          </div>

          {/* Dependents */}
          <NumberSliderInput
            id="tax-dependents"
            label="Qualifying Children / Dependents"
            value={dependentsCount}
            onChange={setDependentsCount}
            min={0}
            max={8}
            step={1}
            helperText={`Child Tax Credit: ${formatMoney(dependentsCount * 2000)} direct credit`}
          />

          {/* Pre-Tax 401(k) */}
          <NumberSliderInput
            id="tax-401k"
            label="Pre-Tax 401(k) / IRA Contributions"
            value={retirement401kContributions}
            onChange={setRetirement401kContributions}
            min={0}
            max={23500}
            step={250}
            prefix={config.symbol}
            tooltip="2026 IRS contribution limit is $23,500 for employee elective deferrals."
          />
        </div>

        {/* Right Column: Tax Results & Bracket Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <ResultCard
            id="tax-total-owed-card"
            title="Total Estimated Tax Liability (2026)"
            value={formatMoney(results.totalTaxOwed)}
            subtitle={`Net After-Tax Income: ${formatMoney(results.grossIncome - results.totalTaxOwed)} | Taxable Income: ${formatMoney(results.taxableIncome)}`}
            highlight
            badge={{
              text: `${results.effectiveTaxRate.toFixed(1)}% Effective Tax Rate`,
              variant: "info",
            }}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3">
            <ResultCard
              id="tax-fed-card"
              title="Federal Income Tax"
              value={formatMoney(results.netFederalTax, { compact: true })}
            />
            <ResultCard
              id="tax-fica-card"
              title="FICA (SS & Medicare)"
              value={formatMoney(results.ficaTaxOwed, { compact: true })}
            />
            <ResultCard
              id="tax-state-card"
              title="State Income Tax"
              value={formatMoney(results.stateTaxOwed, { compact: true })}
            />
            <ResultCard
              id="tax-marginal-card"
              title="Marginal Bracket"
              value={`${results.marginalTaxBracket}%`}
              subtitle="Top tier applied"
            />
          </div>

          {/* Federal Tax Bracket Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-900">
                2026 Federal Progressive Bracket Breakdown
              </h4>
              <p className="text-xs text-slate-500">
                Under progressive taxation, only income within each tier is taxed at that specific rate.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-semibold text-[10px]">
                    <th className="py-2.5 px-4">Bracket</th>
                    <th className="py-2.5 px-4">Income Range</th>
                    <th className="py-2.5 px-4 text-right">Taxable in Tier</th>
                    <th className="py-2.5 px-4 text-right">Tax Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {results.bracketBreakdown.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2 px-4 font-bold text-teal-800">{b.rate}%</td>
                      <td className="py-2 px-4 text-slate-600">{b.rangeLabel}</td>
                      <td className="py-2 px-4 text-right font-medium">{formatMoney(b.taxableInBracket)}</td>
                      <td className="py-2 px-4 text-right font-bold text-slate-900">{formatMoney(b.taxAmount)}</td>
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
