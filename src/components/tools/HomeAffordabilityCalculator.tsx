import React, { useState, useMemo } from "react";
import { HomeAffordabilityInputs } from "../../types";
import { calculateHomeAffordability } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import { Home, ShieldCheck, AlertTriangle, ArrowRight, DollarSign, PieChart as PieIcon } from "lucide-react";

interface HomeAffordabilityCalculatorProps {
  onNavigate?: (route: string) => void;
}

export const HomeAffordabilityCalculator: React.FC<HomeAffordabilityCalculatorProps> = ({ onNavigate }) => {
  const { formatMoney, config } = useCurrency();

  const [annualIncome, setAnnualIncome] = useState<number>(110000);
  const [monthlyDebts, setMonthlyDebts] = useState<number>(600);
  const [downPaymentSavings, setDownPaymentSavings] = useState<number>(60000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [desiredDtiPercent, setDesiredDtiPercent] = useState<number>(36);
  const [propertyTaxRate, setPropertyTaxRate] = useState<number>(1.2);
  const [homeInsuranceAnnual, setHomeInsuranceAnnual] = useState<number>(1400);
  const [hoaMonthly, setHoaMonthly] = useState<number>(0);

  const inputs: HomeAffordabilityInputs = useMemo(
    () => ({
      annualIncome,
      monthlyDebts,
      downPaymentSavings,
      interestRate,
      loanTermYears,
      desiredDtiPercent,
      propertyTaxRate,
      homeInsuranceAnnual,
      hoaMonthly,
    }),
    [
      annualIncome,
      monthlyDebts,
      downPaymentSavings,
      interestRate,
      loanTermYears,
      desiredDtiPercent,
      propertyTaxRate,
      homeInsuranceAnnual,
      hoaMonthly,
    ]
  );

  const results = useMemo(() => calculateHomeAffordability(inputs), [inputs]);

  const dtiPresets = [
    { label: "Conservative (28%)", value: 28, desc: "Lender-preferred safe budget" },
    { label: "Moderate (36%)", value: 36, desc: "Standard conventional guideline" },
    { label: "Aggressive (43%)", value: 43, desc: "FHA / Maximum qualification limit" },
  ];

  return (
    <div id="home-affordability-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Income & Debts */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Income & Existing Debts</h3>
            <NumberSliderInput
              id="afford-annual-income"
              label="Gross Annual Household Income"
              value={annualIncome}
              onChange={setAnnualIncome}
              min={30000}
              max={500000}
              step={2500}
              prefix={config.symbol}
              tooltip="Total combined pre-tax annual income for all borrowers."
            />
            <NumberSliderInput
              id="afford-monthly-debts"
              label="Monthly Debt Obligations"
              value={monthlyDebts}
              onChange={setMonthlyDebts}
              min={0}
              max={5000}
              step={50}
              prefix={config.symbol}
              tooltip="Total monthly minimums for car loans, student debt, personal loans, and credit cards."
            />
            <NumberSliderInput
              id="afford-down-payment"
              label="Cash Available for Down Payment"
              value={downPaymentSavings}
              onChange={setDownPaymentSavings}
              min={5000}
              max={300000}
              step={2500}
              prefix={config.symbol}
              tooltip="Liquid savings set aside strictly for down payment (excluding closing costs & reserves)."
            />
          </div>

          {/* DTI Strategy Toggle */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Debt-to-Income (DTI) Strategy
            </label>
            <div className="grid grid-cols-3 gap-2">
              {dtiPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setDesiredDtiPercent(preset.value)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    desiredDtiPercent === preset.value
                      ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-xs font-bold block">{preset.value}% DTI</span>
                  <span
                    className={`text-[10px] block leading-tight mt-0.5 ${
                      desiredDtiPercent === preset.value ? "text-teal-200" : "text-slate-500"
                    }`}
                  >
                    {preset.label.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
            <NumberSliderInput
              id="afford-dti-slider"
              label="Custom Target DTI Ratio"
              value={desiredDtiPercent}
              onChange={setDesiredDtiPercent}
              min={20}
              max={50}
              step={1}
              suffix="%"
              tooltip="The percentage of your gross monthly income allocated to all debt payments."
            />
          </div>

          {/* Loan & Property Assumptions */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Loan & Property Terms</h3>
            <div className="grid grid-cols-2 gap-3">
              <NumberSliderInput
                id="afford-rate"
                label="Interest Rate"
                value={interestRate}
                onChange={setInterestRate}
                min={3.5}
                max={10.5}
                step={0.1}
                suffix="%"
              />
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Loan Term</label>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {[15, 30].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLoanTermYears(t)}
                      className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                        loanTermYears === t
                          ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {t} Yrs
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberSliderInput
                id="afford-property-tax"
                label="Property Tax Rate"
                value={propertyTaxRate}
                onChange={setPropertyTaxRate}
                min={0.4}
                max={3.0}
                step={0.1}
                suffix="%"
              />
              <NumberSliderInput
                id="afford-hoa"
                label="Monthly HOA Fee"
                value={hoaMonthly}
                onChange={setHoaMonthly}
                min={0}
                max={800}
                step={25}
                prefix={config.symbol}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Key Results & Visual Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Result Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="result-max-home-price"
              title="Maximum Affordable Home Price"
              value={formatMoney(results.maxHomePrice)}
              subtitle={`Down payment: ${formatMoney(results.downPaymentAmount)} (${results.downPaymentPercentOfPrice}% down)`}
              highlight={true}
              badge={{
                text: `${desiredDtiPercent}% Target DTI`,
                variant: results.dtiStatus === "conservative" ? "positive" : results.dtiStatus === "moderate" ? "info" : "warning",
              }}
            />

            <ResultCard
              id="result-max-monthly-payment"
              title="Estimated Maximum Monthly Payment"
              value={formatMoney(results.maxMonthlyPayment)}
              subtitle={`P&I: ${formatMoney(results.principalAndInterest)} | Taxes & Ins: ${formatMoney(results.monthlyPropertyTax + results.monthlyHomeInsurance)}`}
              highlight={false}
              badge={{
                text: `${results.backEndDti}% Back-End DTI`,
                variant: results.dtiStatus === "conservative" ? "positive" : "warning",
              }}
            />
          </div>

          {/* DTI Health Status Assessment */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              results.dtiStatus === "conservative"
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : results.dtiStatus === "moderate"
                ? "bg-teal-50 border-teal-200 text-teal-950"
                : "bg-amber-50 border-amber-200 text-amber-950"
            }`}
          >
            {results.dtiStatus === "conservative" ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                {results.dtiStatus === "conservative"
                  ? "Comfortable & Strong Approval Profile"
                  : results.dtiStatus === "moderate"
                  ? "Standard Industry Benchmark Profile"
                  : "Stretched / Maximum Approval Threshold"}
              </p>
              <p className="text-xs mt-1 leading-relaxed">
                {results.dtiStatus === "conservative"
                  ? "Your back-end DTI is 30% or lower. Lenders view this as low risk, leaving comfortable room for savings, retirement, and life events."
                  : results.dtiStatus === "moderate"
                  ? "Your total debt payments consume between 31% and 38% of your gross income. This is the sweet spot for Fannie Mae and Freddie Mac conventional loans."
                  : "Your DTI exceeds 38%. While loan programs like FHA permit up to 43%–45%, this level leaves less room in your budget for non-housing expenses."}
              </p>
            </div>
          </div>

          {/* Monthly Housing Payment Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-teal-700" />
              Monthly Housing Budget Allocation (PITI)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Principal & Interest</span>
                <span className="text-base font-extrabold text-teal-900 mt-1 block">
                  {formatMoney(results.principalAndInterest)}
                </span>
                <span className="text-[10px] text-slate-400">Loan: {formatMoney(results.maxLoanAmount)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Property Taxes</span>
                <span className="text-base font-extrabold text-slate-900 mt-1 block">
                  {formatMoney(results.monthlyPropertyTax)}
                </span>
                <span className="text-[10px] text-slate-400">{propertyTaxRate}% / yr</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Home Insurance</span>
                <span className="text-base font-extrabold text-slate-900 mt-1 block">
                  {formatMoney(results.monthlyHomeInsurance)}
                </span>
                <span className="text-[10px] text-slate-400">{formatMoney(homeInsuranceAnnual)} / yr</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">HOA / Dues</span>
                <span className="text-base font-extrabold text-slate-900 mt-1 block">
                  {formatMoney(results.monthlyHoa)}
                </span>
                <span className="text-[10px] text-slate-400">Monthly</span>
              </div>
            </div>
          </div>

          {/* Cross-Link Card to Mortgage Amortization */}
          {onNavigate && (
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold">Ready to see your exact 30-year amortization schedule?</p>
                <p className="text-[11px] text-slate-600">Explore complete payment schedules and extra payoff savings.</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("/mortgage-calculator")}
                className="px-3.5 py-2 text-xs font-bold bg-teal-800 text-white rounded-lg hover:bg-teal-900 transition-colors flex items-center gap-1.5 shrink-0"
              >
                Mortgage Amortization
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
