import React, { useState, useMemo } from "react";
import { SelfEmploymentTaxInputs } from "../../types";
import { calculateSelfEmploymentTax } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import { Briefcase, Calendar, ShieldCheck, DollarSign, FileText, CheckCircle2 } from "lucide-react";

export const SelfEmploymentTaxCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [grossSelfEmploymentIncome, setGrossSelfEmploymentIncome] = useState<number>(95000);
  const [businessExpenses, setBusinessExpenses] = useState<number>(18000);
  const [w2Income, setW2Income] = useState<number>(0);
  const [filingStatus, setFilingStatus] = useState<"single" | "married_joint" | "married_separate" | "head_of_household">("single");
  const [stateTaxRate, setStateTaxRate] = useState<number>(4.5);

  const inputs: SelfEmploymentTaxInputs = useMemo(
    () => ({
      grossSelfEmploymentIncome,
      businessExpenses,
      w2Income,
      filingStatus,
      stateTaxRate,
    }),
    [grossSelfEmploymentIncome, businessExpenses, w2Income, filingStatus, stateTaxRate]
  );

  const results = useMemo(() => calculateSelfEmploymentTax(inputs), [inputs]);

  return (
    <div id="self-employment-tax-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Revenue & Expenses */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-teal-700" />
              1099 Business Income & Write-Offs
            </h3>

            <NumberSliderInput
              id="se-gross"
              label="Gross 1099 / Freelance Revenue"
              value={grossSelfEmploymentIncome}
              onChange={setGrossSelfEmploymentIncome}
              min={5000}
              max={500000}
              step={2500}
              prefix={config.symbol}
              tooltip="Total pre-tax revenue received before expenses."
            />

            <NumberSliderInput
              id="se-expenses"
              label="Legitimate Business Expenses"
              value={businessExpenses}
              onChange={setBusinessExpenses}
              min={0}
              max={250000}
              step={1000}
              prefix={config.symbol}
              tooltip="Supplies, software, equipment, home office, travel, contractor costs."
            />

            <NumberSliderInput
              id="se-w2"
              label="Separate W-2 Employment Salary"
              value={w2Income}
              onChange={setW2Income}
              min={0}
              max={250000}
              step={2500}
              prefix={config.symbol}
              tooltip="If you also have a day job, W-2 earnings count toward the Social Security $168,600 cap!"
            />
          </div>

          {/* Filing Status & State Tax */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Filing Status & State
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "single" as const, label: "Single" },
                { id: "married_joint" as const, label: "Married Joint" },
                { id: "married_separate" as const, label: "Married Separate" },
                { id: "head_of_household" as const, label: "Head of House" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setFilingStatus(s.id)}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all text-center ${
                    filingStatus === s.id
                      ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <NumberSliderInput
              id="se-state-rate"
              label="State Income Tax Rate"
              value={stateTaxRate}
              onChange={setStateTaxRate}
              min={0}
              max={13.3}
              step={0.1}
              suffix="%"
              tooltip="0% for TX, FL, WA, NV, TN, WY, SD, NH, AK. Up to 13.3% in CA."
            />
          </div>
        </div>

        {/* Right Column: Key Tax Results & Quarterly Vouchers */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Result Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="result-se-tax"
              title="Self-Employment (FICA) Tax"
              value={formatMoney(results.selfEmploymentTax)}
              subtitle={`Social Security: ${formatMoney(results.socialSecurityTax)} | Medicare: ${formatMoney(results.medicareTax)}`}
              highlight={true}
              badge={{
                text: `${results.effectiveSeTaxRate.toFixed(1)}% Effective SE Tax`,
                variant: "warning",
              }}
            />

            <ResultCard
              id="result-quarterly-voucher"
              title="Quarterly Estimated Payment (IRS)"
              value={`${formatMoney(results.quarterlyEstimatedPayment)}/qtr`}
              subtitle={`Total combined Federal, SE & State: ${formatMoney(results.totalTaxLiability)}/yr`}
              highlight={false}
              badge={{
                text: "4 Equal Deadlines",
                variant: "info",
              }}
            />
          </div>

          {/* Net Profit & Take-Home Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Schedule C Net Profit</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
                {formatMoney(results.netScheduleCProfit)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Revenue ({formatMoney(grossSelfEmploymentIncome)}) minus Expenses ({formatMoney(businessExpenses)})
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Annual Net Take-Home</span>
              <span className="text-xl sm:text-2xl font-black text-teal-800 mt-1 block">
                {formatMoney(results.takeHomePay)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                ~{formatMoney(results.takeHomePay / 12)} / month after all taxes
              </span>
            </div>
          </div>

          {/* Deductions & Credits Callout */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-900">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              Valuable Self-Employed Tax Breaks Applied
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 bg-white/80 rounded-lg border border-teal-100">
                <span className="font-bold block text-teal-950">50% SE Tax Deduction (Line 15)</span>
                <span className="text-teal-700 mt-0.5 block">
                  {formatMoney(results.deductibleSeTaxHalf)} deducted above-the-line from gross income.
                </span>
              </div>
              <div className="p-2.5 bg-white/80 rounded-lg border border-teal-100">
                <span className="font-bold block text-teal-950">Section 199A QBI 20% Deduction</span>
                <span className="text-teal-700 mt-0.5 block">
                  {formatMoney(results.qualifiedBusinessIncomeDeduction)} deducted from eligible qualified profits!
                </span>
              </div>
            </div>
          </div>

          {/* IRS Quarterly Schedule Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              IRS Form 1040-ES Quarterly Payment Schedule
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { q: "Q1", due: "April 15", period: "Jan 1 – Mar 31" },
                { q: "Q2", due: "June 15", period: "Apr 1 – May 31" },
                { q: "Q3", due: "Sept 15", period: "Jun 1 – Aug 31" },
                { q: "Q4", due: "Jan 15 (Next)", period: "Sep 1 – Dec 31" },
              ].map((item) => (
                <div key={item.q} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-teal-800 uppercase block">{item.q} Due</span>
                  <span className="text-xs font-semibold text-slate-900 block mt-0.5">{item.due}</span>
                  <span className="text-base font-extrabold text-slate-900 mt-1 block">
                    {formatMoney(results.quarterlyEstimatedPayment)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{item.period}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
