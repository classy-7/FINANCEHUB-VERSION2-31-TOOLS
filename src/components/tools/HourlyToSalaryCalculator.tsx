import React, { useState, useMemo } from "react";
import { HourlyToSalaryInputs } from "../../types";
import { calculateHourlyToSalary } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import { Clock, Briefcase, Calendar, ArrowRight, DollarSign, Calculator } from "lucide-react";

interface HourlyToSalaryCalculatorProps {
  onNavigate?: (route: string) => void;
}

export const HourlyToSalaryCalculator: React.FC<HourlyToSalaryCalculatorProps> = ({ onNavigate }) => {
  const { formatMoney, config } = useCurrency();

  const [inputMode, setInputMode] = useState<"hourly" | "salary">("hourly");
  const [hourlyWage, setHourlyWage] = useState<number>(32);
  const [annualSalary, setAnnualSalary] = useState<number>(65000);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [weeksPerYear, setWeeksPerYear] = useState<number>(52);
  const [overtimeHoursPerWeek, setOvertimeHoursPerWeek] = useState<number>(0);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<number>(1.5);

  const inputs: HourlyToSalaryInputs = useMemo(
    () => ({
      inputMode,
      hourlyWage,
      annualSalary,
      hoursPerWeek,
      weeksPerYear,
      overtimeHoursPerWeek,
      overtimeMultiplier,
    }),
    [inputMode, hourlyWage, annualSalary, hoursPerWeek, weeksPerYear, overtimeHoursPerWeek, overtimeMultiplier]
  );

  const results = useMemo(() => calculateHourlyToSalary(inputs), [inputs]);

  const quickBenchmarks = [
    { hourly: 15, label: "Minimum / Entry" },
    { hourly: 20, label: "Starting Wage" },
    { hourly: 25, label: "Skilled Trade" },
    { hourly: 35, label: "National Median" },
    { hourly: 50, label: "Professional" },
    { hourly: 75, label: "Senior Specialist" },
    { hourly: 100, label: "Executive / Tech" },
  ];

  return (
    <div id="hourly-to-salary-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Mode Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Conversion Direction</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                id="btn-mode-hourly"
                onClick={() => setInputMode("hourly")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  inputMode === "hourly"
                    ? "bg-white text-teal-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Hourly to Salary
              </button>
              <button
                type="button"
                id="btn-mode-salary"
                onClick={() => setInputMode("salary")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  inputMode === "salary"
                    ? "bg-white text-teal-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Salary to Hourly
              </button>
            </div>
          </div>

          {/* Primary Wage Input */}
          {inputMode === "hourly" ? (
            <NumberSliderInput
              id="input-hourly-wage"
              label="Hourly Wage"
              value={hourlyWage}
              onChange={setHourlyWage}
              min={7.25}
              max={250}
              step={0.5}
              prefix={config.symbol}
              suffix="/hr"
              tooltip="Your base unadjusted hourly pay rate."
            />
          ) : (
            <NumberSliderInput
              id="input-annual-salary"
              label="Annual Salary"
              value={annualSalary}
              onChange={setAnnualSalary}
              min={15000}
              max={400000}
              step={1000}
              prefix={config.symbol}
              suffix="/yr"
              tooltip="Your stated gross annual base compensation."
            />
          )}

          {/* Hours & Weeks Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumberSliderInput
              id="input-hours-per-week"
              label="Regular Hours / Week"
              value={hoursPerWeek}
              onChange={setHoursPerWeek}
              min={10}
              max={60}
              step={1}
              suffix=" hrs"
              tooltip="Standard full-time is 40 hours per week."
            />
            <NumberSliderInput
              id="input-weeks-per-year"
              label="Weeks Worked / Year"
              value={weeksPerYear}
              onChange={setWeeksPerYear}
              min={40}
              max={52}
              step={1}
              suffix=" wks"
              tooltip="52 weeks = year-round (including paid time off). Enter 50 if taking 2 unpaid weeks."
            />
          </div>

          {/* Overtime Settings (only in hourly mode) */}
          {inputMode === "hourly" && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                  Overtime Pay (1.5x)
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {overtimeHoursPerWeek > 0 ? `${overtimeHoursPerWeek} hrs/wk @ 1.5x` : "None"}
                </span>
              </div>
              <NumberSliderInput
                id="input-overtime-hours"
                label="Overtime Hours per Week"
                value={overtimeHoursPerWeek}
                onChange={setOvertimeHoursPerWeek}
                min={0}
                max={30}
                step={1}
                suffix=" hrs"
                tooltip="Hours worked beyond 40 per week subject to overtime rate."
              />
            </div>
          )}

          {/* Cross-Link CTA to Tax Calculator */}
          {onNavigate && (
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold">Want to see take-home pay?</p>
                <p className="text-[11px] text-teal-700">Calculate net pay after federal, state & FICA taxes.</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("/salary-calculator")}
                className="px-3 py-1.5 text-xs font-bold bg-teal-800 text-white rounded-lg hover:bg-teal-900 transition-colors flex items-center gap-1 shrink-0"
              >
                Tax Calculator
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Results & Pay Frequencies */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Result Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="result-hero-annual"
              title={inputMode === "hourly" ? "Equivalent Annual Salary" : "Equivalent Hourly Wage"}
              value={
                inputMode === "hourly"
                  ? formatMoney(results.annualSalary)
                  : `${formatMoney(results.hourlyRate)}/hr`
              }
              subtitle={`Based on ${results.totalAnnualHours.toLocaleString()} annual hours worked`}
              highlight={true}
              badge={{
                text: inputMode === "hourly" ? "Gross Pre-Tax Annual" : "Hourly Base",
                variant: "positive",
              }}
            />

            <ResultCard
              id="result-hero-monthly"
              title="Monthly Gross Pay"
              value={formatMoney(results.monthlyRate)}
              subtitle={`Bi-Weekly: ${formatMoney(results.biweeklyRate)} (26 paychecks/yr)`}
              highlight={false}
              badge={{ text: "12 Pay Periods", variant: "info" }}
            />
          </div>

          {/* Pay Frequency Breakdown Grid */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              Paycheck Conversion Across All Frequencies
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Hourly</span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                  {formatMoney(results.hourlyRate)}
                </span>
                <span className="text-[10px] text-slate-400">per hour</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Daily</span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                  {formatMoney(results.dailyRate)}
                </span>
                <span className="text-[10px] text-slate-400">8-hour standard</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Weekly</span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                  {formatMoney(results.weeklyRate)}
                </span>
                <span className="text-[10px] text-slate-400">52 checks / yr</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Bi-Weekly</span>
                <span className="text-base font-extrabold text-teal-800 mt-0.5 block">
                  {formatMoney(results.biweeklyRate)}
                </span>
                <span className="text-[10px] text-slate-400">26 checks / yr</span>
              </div>
            </div>

            {results.overtimeAnnual > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/70 text-xs text-amber-900 flex justify-between items-center">
                <span>
                  <strong>Overtime Premium Added:</strong> {formatMoney(results.overtimeAnnual)}/year ({formatMoney(results.overtimeAnnual / 12)}/mo)
                </span>
                <span className="font-bold text-amber-800">
                  +{Math.round((results.overtimeAnnual / results.regularAnnual) * 100)}% boost
                </span>
              </div>
            )}
          </div>

          {/* Quick Conversion Benchmark Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Standard 40-Hr/Wk Hourly Wage Benchmark Table
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold uppercase">
                    <th className="py-2 px-3">Hourly Rate</th>
                    <th className="py-2 px-3">Tier</th>
                    <th className="py-2 px-3">Bi-Weekly</th>
                    <th className="py-2 px-3">Monthly</th>
                    <th className="py-2 px-3 text-right">Annual (40h/52w)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {quickBenchmarks.map((b) => {
                    const annual = b.hourly * 40 * 52;
                    const isCurrent = Math.abs(results.hourlyRate - b.hourly) < 2.5;
                    return (
                      <tr
                        key={b.hourly}
                        className={`transition-colors ${
                          isCurrent ? "bg-teal-50/80 font-bold text-teal-900" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <td className="py-2 px-3 font-semibold text-slate-900">{formatMoney(b.hourly)}/hr</td>
                        <td className="py-2 px-3 text-slate-500">{b.label}</td>
                        <td className="py-2 px-3">{formatMoney(annual / 26)}</td>
                        <td className="py-2 px-3">{formatMoney(annual / 12)}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{formatMoney(annual)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
