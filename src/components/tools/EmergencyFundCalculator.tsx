import React, { useState, useMemo } from "react";
import { EmergencyFundInputs } from "../../types";
import { calculateEmergencyFund } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import { ShieldCheck, AlertCircle, TrendingUp, Sparkles, Umbrella, CheckCircle2 } from "lucide-react";

export const EmergencyFundCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [monthlyHousing, setMonthlyHousing] = useState<number>(1800);
  const [monthlyGroceries, setMonthlyGroceries] = useState<number>(650);
  const [monthlyUtilities, setMonthlyUtilities] = useState<number>(300);
  const [monthlyDebtPayments, setMonthlyDebtPayments] = useState<number>(450);
  const [monthlyInsuranceHealth, setMonthlyInsuranceHealth] = useState<number>(350);
  const [monthlyTransportation, setMonthlyTransportation] = useState<number>(300);
  const [monthlyOtherEssentials, setMonthlyOtherEssentials] = useState<number>(150);

  const [incomeStability, setIncomeStability] = useState<"salaried" | "variable" | "self_employed">("salaried");
  const [targetMonths, setTargetMonths] = useState<number>(6);
  const [currentSavings, setCurrentSavings] = useState<number>(12000);
  const [monthlySavingsContribution, setMonthlySavingsContribution] = useState<number>(600);

  const inputs: EmergencyFundInputs = useMemo(
    () => ({
      monthlyHousing,
      monthlyGroceries,
      monthlyUtilities,
      monthlyDebtPayments,
      monthlyInsuranceHealth,
      monthlyTransportation,
      monthlyOtherEssentials,
      incomeStability,
      targetMonths,
      currentSavings,
      monthlySavingsContribution,
    }),
    [
      monthlyHousing,
      monthlyGroceries,
      monthlyUtilities,
      monthlyDebtPayments,
      monthlyInsuranceHealth,
      monthlyTransportation,
      monthlyOtherEssentials,
      incomeStability,
      targetMonths,
      currentSavings,
      monthlySavingsContribution,
    ]
  );

  const results = useMemo(() => calculateEmergencyFund(inputs), [inputs]);

  // High Yield Savings passive interest estimate at 4.5% APY
  const annualHysaInterest = results.targetAmount * 0.045;

  const stabilityPresets = [
    {
      id: "salaried" as const,
      label: "Salaried / Stable",
      months: 4,
      desc: "Standard 3–6 months for stable, salaried corporate careers.",
    },
    {
      id: "variable" as const,
      label: "Variable / Commission",
      months: 6,
      desc: "6–9 months for sales, bonus-heavy, or single-earner households.",
    },
    {
      id: "self_employed" as const,
      label: "Freelance / Self-Employed",
      months: 9,
      desc: "9–12 months for contractors, business owners, and cyclical income.",
    },
  ];

  return (
    <div id="emergency-fund-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Income Stability Profile */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Employment Stability & Risk Profile
            </label>
            <div className="space-y-2">
              {stabilityPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setIncomeStability(preset.id);
                    setTargetMonths(preset.months);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    incomeStability === preset.id
                      ? "bg-teal-50 border-teal-700 text-teal-950 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{preset.label}</span>
                    <span className="text-[11px] font-semibold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded-md">
                      Rec. {preset.months} mos
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{preset.desc}</p>
                </button>
              ))}
            </div>

            <NumberSliderInput
              id="ef-target-months"
              label="Coverage Goal in Months"
              value={targetMonths}
              onChange={setTargetMonths}
              min={1}
              max={12}
              step={1}
              suffix=" months"
              tooltip="How many months of survival expenses you want kept safe in liquid cash."
            />
          </div>

          {/* Monthly Essential Expenses */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Umbrella className="w-3.5 h-3.5 text-teal-700" />
                Monthly Essential Expenses
              </h3>
              <span className="text-xs font-bold text-slate-900">
                {formatMoney(results.monthlyEssentialExpenses)}/mo
              </span>
            </div>

            <NumberSliderInput
              id="ef-housing"
              label="Housing (Rent or Mortgage PITI)"
              value={monthlyHousing}
              onChange={setMonthlyHousing}
              min={300}
              max={6000}
              step={50}
              prefix={config.symbol}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberSliderInput
                id="ef-groceries"
                label="Groceries & Food"
                value={monthlyGroceries}
                onChange={setMonthlyGroceries}
                min={100}
                max={2000}
                step={25}
                prefix={config.symbol}
              />
              <NumberSliderInput
                id="ef-utilities"
                label="Utilities & Internet"
                value={monthlyUtilities}
                onChange={setMonthlyUtilities}
                min={50}
                max={1000}
                step={25}
                prefix={config.symbol}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberSliderInput
                id="ef-debts"
                label="Minimum Debt Payments"
                value={monthlyDebtPayments}
                onChange={setMonthlyDebtPayments}
                min={0}
                max={3000}
                step={25}
                prefix={config.symbol}
              />
              <NumberSliderInput
                id="ef-health"
                label="Healthcare & Insurance"
                value={monthlyInsuranceHealth}
                onChange={setMonthlyInsuranceHealth}
                min={50}
                max={1500}
                step={25}
                prefix={config.symbol}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberSliderInput
                id="ef-transit"
                label="Transit & Gas"
                value={monthlyTransportation}
                onChange={setMonthlyTransportation}
                min={0}
                max={1000}
                step={25}
                prefix={config.symbol}
              />
              <NumberSliderInput
                id="ef-other"
                label="Other Core Essentials"
                value={monthlyOtherEssentials}
                onChange={setMonthlyOtherEssentials}
                min={0}
                max={1000}
                step={25}
                prefix={config.symbol}
              />
            </div>
          </div>

          {/* Current Savings & Pace */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Reserve & Savings Rate</h3>
            <NumberSliderInput
              id="ef-current-savings"
              label="Current Emergency Cash Saved"
              value={currentSavings}
              onChange={setCurrentSavings}
              min={0}
              max={100000}
              step={500}
              prefix={config.symbol}
              tooltip="Money currently sitting in checking, savings, or money market accounts."
            />
            <NumberSliderInput
              id="ef-monthly-addition"
              label="Monthly Savings Contribution"
              value={monthlySavingsContribution}
              onChange={setMonthlySavingsContribution}
              min={0}
              max={3000}
              step={50}
              prefix={config.symbol}
              suffix="/mo"
              tooltip="Amount added toward this reserve fund each month."
            />
          </div>
        </div>

        {/* Right Column: Key Results & Health Check */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Result Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="result-target-fund"
              title="Target Emergency Fund Goal"
              value={formatMoney(results.targetAmount)}
              subtitle={`Based on ${targetMonths} months @ ${formatMoney(results.monthlyEssentialExpenses)}/mo`}
              highlight={true}
              badge={{
                text: `${results.fundingPercentage}% Funded`,
                variant: results.statusBadge === "safe" ? "positive" : results.statusBadge === "growing" ? "info" : "warning",
              }}
            />

            <ResultCard
              id="result-current-runway"
              title="Current Safety Runway"
              value={`${results.currentRunwayMonths} Months`}
              subtitle={
                results.fundingGap > 0
                  ? `Gap: ${formatMoney(results.fundingGap)} (${results.monthsToReachGoal} mos to goal)`
                  : "Fully Funded Safety Net!"
              }
              highlight={false}
              badge={{
                text: results.statusBadge === "safe" ? "Fully Protected" : "Building Buffer",
                variant: results.statusBadge === "safe" ? "positive" : "warning",
              }}
            />
          </div>

          {/* Visual Progress Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">Reserve Funding Progress</span>
              <span className="text-teal-800">{results.fundingPercentage}% of Target</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-teal-600 to-emerald-500"
                style={{ width: `${Math.min(100, results.fundingPercentage)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Saved: {formatMoney(results.currentSavings)}</span>
              <span>Goal: {formatMoney(results.targetAmount)}</span>
            </div>
          </div>

          {/* Assessment Callout */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              results.statusBadge === "safe"
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : results.statusBadge === "growing"
                ? "bg-teal-50 border-teal-200 text-teal-950"
                : "bg-amber-50 border-amber-200 text-amber-950"
            }`}
          >
            {results.statusBadge === "safe" ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                {results.statusBadge === "safe"
                  ? "Fully Protected Safety Cushion"
                  : results.statusBadge === "growing"
                  ? "Solid Foundation — Target in Sight"
                  : "Critical Exposure — Prioritize Cash Reserves"}
              </p>
              <p className="text-xs mt-1 leading-relaxed">
                {results.statusBadge === "safe"
                  ? `You have reached your ${targetMonths}-month target! You can safely redirect additional surplus savings into wealth-building index funds or retirement accounts.`
                  : `At your savings rate of ${formatMoney(monthlySavingsContribution)}/month, you will close the remaining ${formatMoney(results.fundingGap)} gap in approximately ${results.monthsToReachGoal} months.`}
              </p>
            </div>
          </div>

          {/* High-Yield Savings Passive Income Tip */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              High-Yield Savings Passive Income Opportunity
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Keeping your fully funded goal of <strong>{formatMoney(results.targetAmount)}</strong> in a top 4.5% APY
              High-Yield Savings Account (HYSA) generates approximately{" "}
              <strong className="text-emerald-400">{formatMoney(annualHysaInterest)} / year</strong> (
              {formatMoney(annualHysaInterest / 12)}/month) in completely risk-free interest while staying 100% FDIC insured.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
