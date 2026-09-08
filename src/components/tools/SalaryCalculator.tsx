import React, { useState, useEffect, useMemo } from "react";
import { SalaryInputs } from "../../types";
import { calculateSalary } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import { getQueryParamNumber, getQueryParamString, updateUrlQueryParams } from "../../utils/urlState";
import taxRules2026 from "../../../data/tax-rules/2026.json";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Briefcase, Info, ArrowDownRight } from "lucide-react";

export const SalaryCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [grossSalary, setGrossSalary] = useState<number>(() => getQueryParamNumber("salary", 75000));
  const [salaryPeriod, setSalaryPeriod] = useState<"annual" | "monthly" | "biweekly" | "weekly" | "hourly">(
    () => getQueryParamString("period", "annual") as any
  );
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [payFrequency, setPayFrequency] = useState<"weekly" | "biweekly" | "semimonthly" | "monthly" | "annual">(
    () => getQueryParamString("freq", "biweekly") as any
  );
  const [filingStatus, setFilingStatus] = useState<"single" | "married" | "headOfHousehold">(
    () => getQueryParamString("status", "single") as any
  );
  const [stateCode, setStateCode] = useState<string>(() => getQueryParamString("state", "CA"));
  const [preTax401kPercent, setPreTax401kPercent] = useState<number>(5);
  const [preTaxHealthInsurance, setPreTaxHealthInsurance] = useState<number>(150);
  const [postTaxDeductions, setPostTaxDeductions] = useState<number>(0);

  // Sync with URL query parameters
  useEffect(() => {
    updateUrlQueryParams({
      salary: grossSalary,
      period: salaryPeriod,
      freq: payFrequency,
      status: filingStatus,
      state: stateCode,
    });
  }, [grossSalary, salaryPeriod, payFrequency, filingStatus, stateCode]);

  const inputs: SalaryInputs = useMemo(() => ({
    grossSalary,
    salaryPeriod,
    hoursPerWeek,
    payFrequency,
    filingStatus,
    stateCode,
    preTax401kPercent,
    preTaxHealthInsurance,
    postTaxDeductions,
  }), [
    grossSalary,
    salaryPeriod,
    hoursPerWeek,
    payFrequency,
    filingStatus,
    stateCode,
    preTax401kPercent,
    preTaxHealthInsurance,
    postTaxDeductions,
  ]);

  const results = useMemo(() => calculateSalary(inputs), [inputs]);

  // States list from tax rules
  const availableStates = Object.entries(taxRules2026.states).map(([code, s]) => ({
    code,
    name: s.name,
    isZeroTax: s.type === "none",
  }));

  const waterfallData = [
    { name: "Gross Annual", amount: Math.round(results.grossAnnual), color: "#0f766e" },
    { name: "Pre-Tax 401(k)/HSA", amount: Math.round(results.preTaxDeductionsAnnual), color: "#0284c7" },
    { name: "Federal Taxes", amount: Math.round(results.federalTaxAnnual), color: "#f43f5e" },
    { name: "FICA (SS & Med)", amount: Math.round(results.socialSecurityAnnual + results.medicareAnnual), color: "#f97316" },
    { name: "State Taxes", amount: Math.round(results.stateTaxAnnual), color: "#eab308" },
    { name: "Net Take-Home", amount: Math.round(results.netAnnual), color: "#10b981" },
  ];

  return (
    <div id="salary-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-4">
          {/* Gross Salary & Period Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-800">Pay Basis / Period</label>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                {(["annual", "monthly", "hourly"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSalaryPeriod(p)}
                    className={`px-2 py-0.5 rounded capitalize ${
                      salaryPeriod === p ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <NumberSliderInput
              id="salary-gross"
              label={salaryPeriod === "hourly" ? "Hourly Wage" : `Gross ${salaryPeriod} Pay`}
              value={grossSalary}
              onChange={setGrossSalary}
              min={salaryPeriod === "hourly" ? 10 : 15000}
              max={salaryPeriod === "hourly" ? 250 : 500000}
              step={salaryPeriod === "hourly" ? 1 : 1000}
              prefix={config.symbol}
              tooltip="Your gross earnings before any tax withholdings or pre-tax deductions."
            />

            {salaryPeriod === "hourly" && (
              <NumberSliderInput
                id="salary-hours-per-week"
                label="Hours Worked Per Week"
                value={hoursPerWeek}
                onChange={setHoursPerWeek}
                min={5}
                max={80}
                step={1}
                suffix=" hrs"
              />
            )}
          </div>

          {/* Pay Frequency */}
          <div className="py-2 border-t border-slate-100 space-y-2">
            <label className="text-sm font-semibold text-slate-800 block">Paycheck Frequency</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 text-xs font-semibold">
              {[
                { id: "weekly", label: "Weekly (52x)" },
                { id: "biweekly", label: "Bi-Weekly (26x)" },
                { id: "semimonthly", label: "Semi-Mo (24x)" },
                { id: "monthly", label: "Monthly (12x)" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPayFrequency(f.id as any)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                    payFrequency === f.id
                      ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tax Filing Status */}
          <div className="py-2 border-t border-slate-100 space-y-2">
            <label className="text-sm font-semibold text-slate-800 block">Filing Status</label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
              {[
                { id: "single", label: "Single" },
                { id: "married", label: "Married" },
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

          {/* State Selector */}
          <div className="py-2 border-t border-slate-100 space-y-1.5">
            <label htmlFor="salary-state" className="text-sm font-semibold text-slate-800 block">
              State of Residence (2026 Rules)
            </label>
            <select
              id="salary-state"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="w-full text-sm font-medium py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              {availableStates.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} {s.isZeroTax ? "(0% State Tax)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Pre-Tax Deductions */}
          <div className="py-2 border-t border-slate-100 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block">
              Pre-Tax Benefits (Lower Your Taxes)
            </span>
            <NumberSliderInput
              id="salary-401k"
              label="Traditional 401(k) / IRA %"
              value={preTax401kPercent}
              onChange={setPreTax401kPercent}
              min={0}
              max={30}
              step={1}
              suffix="%"
              helperText={`Savings: ${formatMoney((results.grossAnnual * preTax401kPercent) / 100)}/yr`}
            />

            <NumberSliderInput
              id="salary-health"
              label="Pre-Tax Health / Dental (Monthly)"
              value={preTaxHealthInsurance}
              onChange={setPreTaxHealthInsurance}
              min={0}
              max={1500}
              step={25}
              prefix={config.symbol}
            />
          </div>
        </div>

        {/* Right Column: Key Paycheck Metrics */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Metric: Take-home per paycheck */}
          <ResultCard
            id="salary-net-paycheck-card"
            title={`Net Take-Home Pay (Per ${payFrequency.replace("semi", "semi-")})`}
            value={formatMoney(results.netPerPaycheck)}
            subtitle={`Monthly Take-Home: ${formatMoney(results.netMonthly)} | Annual Net: ${formatMoney(results.netAnnual)}`}
            highlight
            badge={{
              text: `${results.effectiveTaxRate.toFixed(1)}% Effective Tax Rate`,
              variant: "info",
            }}
          />

          {/* Secondary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3">
            <ResultCard
              id="salary-gross-card"
              title="Gross Annual"
              value={formatMoney(results.grossAnnual, { compact: true })}
            />
            <ResultCard
              id="salary-federal-tax-card"
              title="Federal Income Tax"
              value={formatMoney(results.federalTaxAnnual, { compact: true })}
            />
            <ResultCard
              id="salary-fica-card"
              title="Social Security & Med"
              value={formatMoney(results.socialSecurityAnnual + results.medicareAnnual, { compact: true })}
            />
            <ResultCard
              id="salary-state-tax-card"
              title="State Income Tax"
              value={formatMoney(results.stateTaxAnnual, { compact: true })}
            />
          </div>

          {/* Waterfall Breakdown Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Annual Income & Tax Waterfall</h4>
            <p className="text-xs text-slate-500 mb-4">
              Visualizing how gross earnings reduce through pre-tax benefits and mandatory taxes into your final take-home pay.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterfallData} layout="vertical" margin={{ left: 40, right: 30, top: 10, bottom: 10 }}>
                  <XAxis type="number" tickFormatter={(v) => formatMoney(v, { compact: true })} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [formatMoney(val), "Annual"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                    {waterfallData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
