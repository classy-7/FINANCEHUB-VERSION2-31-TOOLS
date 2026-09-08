import React, { useState, useEffect, useMemo } from "react";
import { MortgageInputs } from "../../types";
import { calculateMortgage } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import { AmortizationTable } from "../common/AmortizationTable";
import { getQueryParamNumber, updateUrlQueryParams } from "../../utils/urlState";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Sparkles, TrendingDown, Clock } from "lucide-react";

export const MortgageCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  // Initialize with URL query params if present, else sensible defaults
  const [homePrice, setHomePrice] = useState<number>(() => getQueryParamNumber("price", 400000));
  const [downPaymentType, setDownPaymentType] = useState<"percent" | "amount">("percent");
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(() => getQueryParamNumber("downPct", 20));
  const [downPaymentAmount, setDownPaymentAmount] = useState<number>(80000);
  const [loanTermYears, setLoanTermYears] = useState<number>(() => getQueryParamNumber("term", 30));
  const [interestRate, setInterestRate] = useState<number>(() => getQueryParamNumber("rate", 6.5));
  const [propertyTaxRate, setPropertyTaxRate] = useState<number>(1.2);
  const [homeInsuranceAnnual, setHomeInsuranceAnnual] = useState<number>(1200);
  const [pmiRate, setPmiRate] = useState<number>(0.75);
  const [hoaMonthly, setHoaMonthly] = useState<number>(0);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(() => getQueryParamNumber("extra", 100));

  // Sync down payment amount and percent
  const handleDownPercentChange = (pct: number) => {
    setDownPaymentPercent(pct);
    setDownPaymentAmount(Math.round((homePrice * pct) / 100));
  };

  const handleDownAmountChange = (amt: number) => {
    setDownPaymentAmount(amt);
    if (homePrice > 0) {
      setDownPaymentPercent(Number(((amt / homePrice) * 100).toFixed(1)));
    }
  };

  const handleHomePriceChange = (price: number) => {
    setHomePrice(price);
    if (downPaymentType === "percent") {
      setDownPaymentAmount(Math.round((price * downPaymentPercent) / 100));
    } else {
      if (price > 0) {
        setDownPaymentPercent(Number(((downPaymentAmount / price) * 100).toFixed(1)));
      }
    }
  };

  // URL state sync
  useEffect(() => {
    updateUrlQueryParams({
      price: homePrice,
      downPct: downPaymentPercent,
      term: loanTermYears,
      rate: interestRate,
      extra: extraMonthlyPayment,
    });
  }, [homePrice, downPaymentPercent, loanTermYears, interestRate, extraMonthlyPayment]);

  const inputs: MortgageInputs = useMemo(() => ({
    homePrice,
    downPaymentType,
    downPaymentPercent,
    downPaymentAmount,
    loanTermYears,
    interestRate,
    propertyTaxRate,
    homeInsuranceAnnual,
    pmiRate,
    hoaMonthly,
    extraMonthlyPayment,
  }), [
    homePrice,
    downPaymentType,
    downPaymentPercent,
    downPaymentAmount,
    loanTermYears,
    interestRate,
    propertyTaxRate,
    homeInsuranceAnnual,
    pmiRate,
    hoaMonthly,
    extraMonthlyPayment,
  ]);

  const results = useMemo(() => calculateMortgage(inputs), [inputs]);

  // Breakdown chart data
  const chartData = [
    { name: "Principal & Interest", value: Math.round(results.principalAndInterestMonthly), color: "#0f766e" },
    { name: "Property Taxes", value: Math.round(results.propertyTaxMonthly), color: "#0284c7" },
    { name: "Home Insurance", value: Math.round(results.homeInsuranceMonthly), color: "#6366f1" },
    ...(results.pmiMonthly > 0 ? [{ name: "PMI", value: Math.round(results.pmiMonthly), color: "#f59e0b" }] : []),
    ...(results.hoaMonthly > 0 ? [{ name: "HOA Fees", value: Math.round(results.hoaMonthly), color: "#84cc16" }] : []),
  ];

  return (
    <div id="mortgage-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <NumberSliderInput
            id="mortgage-home-price"
            label="Home Purchase Price"
            value={homePrice}
            onChange={handleHomePriceChange}
            min={50000}
            max={2000000}
            step={5000}
            prefix={config.symbol}
            tooltip="The estimated total purchase price of the property."
          />

          {/* Down Payment Section */}
          <div className="py-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">Down Payment</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDownPaymentType("percent")}
                  className={`px-2.5 py-0.5 rounded ${
                    downPaymentType === "percent" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setDownPaymentType("amount")}
                  className={`px-2.5 py-0.5 rounded ${
                    downPaymentType === "amount" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  {config.symbol}
                </button>
              </div>
            </div>

            {downPaymentType === "percent" ? (
              <NumberSliderInput
                id="mortgage-down-percent"
                label="Down Payment %"
                value={downPaymentPercent}
                onChange={handleDownPercentChange}
                min={0}
                max={50}
                step={0.5}
                suffix="%"
                helperText={`Amount: ${formatMoney((homePrice * downPaymentPercent) / 100)}`}
              />
            ) : (
              <NumberSliderInput
                id="mortgage-down-amount"
                label="Down Payment Amount"
                value={downPaymentAmount}
                onChange={handleDownAmountChange}
                min={0}
                max={homePrice}
                step={1000}
                prefix={config.symbol}
                helperText={`Percentage: ${downPaymentPercent}% of purchase price`}
              />
            )}
          </div>

          {/* Loan Term Selection */}
          <div className="py-2 border-t border-slate-100 space-y-2">
            <label className="text-sm font-semibold text-slate-800 block">Loan Term</label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 20, 30].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setLoanTermYears(term)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    loanTermYears === term
                      ? "border-teal-700 bg-teal-800 text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {term} Years
                </button>
              ))}
            </div>
          </div>

          <NumberSliderInput
            id="mortgage-interest-rate"
            label="Interest Rate"
            value={interestRate}
            onChange={setInterestRate}
            min={2.0}
            max={12.0}
            step={0.05}
            suffix="%"
            tooltip="Fixed annual interest rate charged by the lender."
          />

          <NumberSliderInput
            id="mortgage-property-tax"
            label="Property Tax Rate"
            value={propertyTaxRate}
            onChange={setPropertyTaxRate}
            min={0.1}
            max={3.5}
            step={0.05}
            suffix="%"
            helperText={`Est. ${formatMoney(results.propertyTaxMonthly)}/month`}
          />

          <NumberSliderInput
            id="mortgage-insurance"
            label="Home Insurance (Annual)"
            value={homeInsuranceAnnual}
            onChange={setHomeInsuranceAnnual}
            min={300}
            max={5000}
            step={50}
            prefix={config.symbol}
            helperText={`Est. ${formatMoney(homeInsuranceAnnual / 12)}/month`}
          />

          <NumberSliderInput
            id="mortgage-hoa"
            label="HOA Fees (Monthly)"
            value={hoaMonthly}
            onChange={setHoaMonthly}
            min={0}
            max={1500}
            step={10}
            prefix={config.symbol}
            tooltip="Homeowners association or condo maintenance dues."
          />

          <div className="pt-2 border-t border-slate-100">
            <NumberSliderInput
              id="mortgage-extra-payment"
              label="Extra Principal (Monthly)"
              value={extraMonthlyPayment}
              onChange={setExtraMonthlyPayment}
              min={0}
              max={2000}
              step={25}
              prefix={config.symbol}
              tooltip="Accelerate debt freedom by applying extra principal every month."
            />
          </div>
        </div>

        {/* Right Column: Results & Visualization */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Metric Card */}
          <ResultCard
            id="mortgage-total-payment-card"
            title="Total Monthly Housing Cost (PITI + HOA)"
            value={formatMoney(results.totalMonthlyPayment)}
            subtitle={`Loan Amount: ${formatMoney(results.loanAmount)} | Base P&I: ${formatMoney(results.principalAndInterestMonthly)}/mo`}
            highlight
            badge={{ text: `${loanTermYears}-Year Fixed`, variant: "info" }}
          />

          {/* Secondary Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3">
            <ResultCard
              id="mortgage-pi-card"
              title="Principal & Interest"
              value={formatMoney(results.principalAndInterestMonthly, { compact: true })}
            />
            <ResultCard
              id="mortgage-tax-card"
              title="Property Taxes"
              value={formatMoney(results.propertyTaxMonthly, { compact: true })}
            />
            <ResultCard
              id="mortgage-insurance-card"
              title="Insurance & PMI"
              value={formatMoney(results.homeInsuranceMonthly + results.pmiMonthly, { compact: true })}
            />
            <ResultCard
              id="mortgage-total-interest-card"
              title="Total Lifetime Interest"
              value={formatMoney(results.totalInterestPaid, { compact: true })}
            />
          </div>

          {/* Extra Payment Impact Callout */}
          {extraMonthlyPayment > 0 && results.extraPaymentSavingsYears > 0 && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-xs text-emerald-950">
                <span className="font-bold text-sm text-emerald-900 block">
                  Extra Payment Acceleration Active
                </span>
                <p>
                  By paying an extra <strong>{formatMoney(extraMonthlyPayment)}/mo</strong>, you will pay off your home{" "}
                  <strong className="text-emerald-800">{results.extraPaymentSavingsYears} years earlier</strong> and save{" "}
                  <strong className="text-emerald-800">{formatMoney(results.extraPaymentInterestSaved)}</strong> in total mortgage interest!
                </p>
              </div>
            </div>
          )}

          {/* Monthly Payment Composition Recharts Donut */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Monthly Payment Composition</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatMoney(val), "Monthly"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Table Section */}
      <AmortizationTable
        id="mortgage-amortization-table"
        schedule={results.schedule}
        yearlySchedule={results.yearlySchedule}
      />
    </div>
  );
};
