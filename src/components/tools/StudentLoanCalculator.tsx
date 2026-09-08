import React, { useState, useMemo } from "react";
import { StudentLoanInputs, StudentLoanPlanType, StudentLoanPlanComparison } from "../../types";
import { calculateStudentLoan } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import { GraduationCap, ShieldCheck, Zap, Scale, ArrowRight, HelpCircle } from "lucide-react";

export const StudentLoanCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [loanBalance, setLoanBalance] = useState<number>(38000);
  const [interestRate, setInterestRate] = useState<number>(6.2);
  const [selectedPlan, setSelectedPlan] = useState<StudentLoanPlanType>("standard_10");
  const [annualAgi, setAnnualAgi] = useState<number>(55000);
  const [householdSize, setHouseholdSize] = useState<number>(1);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(50);

  const inputs: StudentLoanInputs = useMemo(
    () => ({
      loanBalance,
      interestRate,
      selectedPlan,
      annualAgi,
      householdSize,
      extraMonthlyPayment,
    }),
    [loanBalance, interestRate, selectedPlan, annualAgi, householdSize, extraMonthlyPayment]
  );

  const results = useMemo(() => calculateStudentLoan(inputs), [inputs]);

  const plansList = [
    {
      id: "standard_10" as StudentLoanPlanType,
      name: "Standard 10-Year",
      desc: "Fixed payments over 120 months. Minimizes total interest paid.",
    },
    {
      id: "save_idr" as StudentLoanPlanType,
      name: "SAVE / IDR Plan",
      desc: "5%–10% of discretionary income above 225% poverty line. Forgives remaining balance.",
    },
    {
      id: "graduated_10" as StudentLoanPlanType,
      name: "Graduated 10-Year",
      desc: "Starts low and steps up every 2 years. Best for expected rapid salary growth.",
    },
    {
      id: "extended_25" as StudentLoanPlanType,
      name: "Extended 25-Year",
      desc: "Lowest fixed monthly payments, but significantly more interest paid over 300 months.",
    },
  ];

  return (
    <div id="student-loan-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Loan Details */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
              Student Loan Balance & Rate
            </h3>

            <NumberSliderInput
              id="sl-balance"
              label="Total Student Loan Balance"
              value={loanBalance}
              onChange={setLoanBalance}
              min={2000}
              max={250000}
              step={1000}
              prefix={config.symbol}
            />

            <NumberSliderInput
              id="sl-rate"
              label="Weighted Average Interest Rate"
              value={interestRate}
              onChange={setInterestRate}
              min={2.5}
              max={12.0}
              step={0.1}
              suffix="%"
              tooltip="Federal direct undergraduate rates are typically 5%–6.5%; Direct Plus/Private can be 8%–11%."
            />

            <NumberSliderInput
              id="sl-extra"
              label="Extra Monthly Principal Accelerator"
              value={extraMonthlyPayment}
              onChange={setExtraMonthlyPayment}
              min={0}
              max={500}
              step={10}
              prefix={config.symbol}
              suffix="/mo"
              tooltip="Extra payment directed 100% to high-rate loan principal."
            />
          </div>

          {/* Plan Picker */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Federal Repayment Plan
            </label>
            <div className="space-y-2">
              {plansList.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    selectedPlan === plan.id
                      ? "bg-teal-50 border-teal-700 text-teal-950 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{plan.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        selectedPlan === plan.id ? "bg-teal-800 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {results.planComparisons[plan.id]?.termMonths / 12} Yrs
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{plan.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Income-Driven Details (Only if SAVE / IDR selected) */}
          {selectedPlan === "save_idr" && (
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
                SAVE / IDR Eligibility Factors
              </h4>
              <NumberSliderInput
                id="sl-agi"
                label="Adjusted Gross Income (AGI)"
                value={annualAgi}
                onChange={setAnnualAgi}
                min={20000}
                max={200000}
                step={1000}
                prefix={config.symbol}
                tooltip="Your taxable income from Form 1040 (Line 11)."
              />
              <NumberSliderInput
                id="sl-household"
                label="Household Size"
                value={householdSize}
                onChange={setHouseholdSize}
                min={1}
                max={8}
                step={1}
                suffix=" people"
                tooltip="Yourself, spouse (if filing jointly), and qualifying dependents."
              />
            </div>
          )}
        </div>

        {/* Right Column: Key Results & Multi-Plan Comparison */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Result Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="result-monthly-payment"
              title={`${results.activePlan.planName} Payment`}
              value={`${formatMoney(results.activePlan.initialMonthlyPayment)}/mo`}
              subtitle={`Total interest over term: ${formatMoney(results.activePlan.totalInterestPaid)}`}
              highlight={true}
              badge={{
                text: `${results.activePlan.termMonths / 12} Year Horizon`,
                variant: "positive",
              }}
            />

            <ResultCard
              id="result-payoff-total"
              title="Total Lifetime Cost"
              value={formatMoney(results.activePlan.totalPaid)}
              subtitle={
                results.activePlan.estimatedForgiveness > 0
                  ? `Est. Loan Forgiveness: ${formatMoney(results.activePlan.estimatedForgiveness)}`
                  : `Principal: ${formatMoney(loanBalance)} | Interest: ${formatMoney(results.activePlan.totalInterestPaid)}`
              }
              highlight={false}
              badge={{
                text: results.activePlan.estimatedForgiveness > 0 ? "Eligible for Forgiveness" : "Full Principal Payoff",
                variant: results.activePlan.estimatedForgiveness > 0 ? "positive" : "info",
              }}
            />
          </div>

          {/* Extra Payment Savings Callout */}
          {results.acceleratedSavings && results.acceleratedSavings.monthsSaved > 0 && (
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 flex items-start gap-3.5">
              <Zap className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  Extra Payment Impact (+{formatMoney(extraMonthlyPayment)}/mo)
                </p>
                <p className="text-xs mt-1 leading-relaxed">
                  Adding just <strong>{formatMoney(extraMonthlyPayment)}/month</strong> shaves{" "}
                  <strong>{results.acceleratedSavings.monthsSaved} months</strong> off your repayment and saves you{" "}
                  <strong>{formatMoney(results.acceleratedSavings.interestSaved)} in interest</strong>!
                </p>
              </div>
            </div>
          )}

          {/* Multi-Plan Comprehensive Matrix */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-700" />
              Side-by-Side Federal Repayment Plans Comparison
            </h3>

            <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
              <table className="w-full min-w-[480px] text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold uppercase">
                    <th className="py-2 px-3">Plan Name</th>
                    <th className="py-2 px-3">Monthly Payment</th>
                    <th className="py-2 px-3">Total Interest</th>
                    <th className="py-2 px-3">Total Repaid</th>
                    <th className="py-2 px-3 text-right">Forgiveness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(Object.values(results.planComparisons) as StudentLoanPlanComparison[]).map((plan) => {
                    const isSelected = plan.planType === selectedPlan;
                    return (
                      <tr
                        key={plan.planType}
                        className={`transition-colors ${
                          isSelected ? "bg-teal-50/90 font-bold text-teal-900" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span className="block font-semibold text-slate-900">{plan.planName}</span>
                          <span className="text-[10px] text-slate-400">{plan.termMonths / 12} years</span>
                        </td>
                        <td className="py-3 px-3">{formatMoney(plan.initialMonthlyPayment)}/mo</td>
                        <td className="py-3 px-3 text-slate-600">{formatMoney(plan.totalInterestPaid)}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{formatMoney(plan.totalPaid)}</td>
                        <td className="py-3 px-3 text-right">
                          {plan.estimatedForgiveness > 0 ? (
                            <span className="text-emerald-700 font-bold">
                              {formatMoney(plan.estimatedForgiveness)}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
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
