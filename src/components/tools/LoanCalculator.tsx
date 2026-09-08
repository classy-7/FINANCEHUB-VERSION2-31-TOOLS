import React, { useState, useEffect, useMemo } from "react";
import { LoanInputs, LoanComparisonOffer } from "../../types";
import { calculateLoan } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import { AmortizationTable } from "../common/AmortizationTable";
import { getQueryParamNumber, updateUrlQueryParams } from "../../utils/urlState";
import { Check, Columns, CreditCard, ShieldAlert } from "lucide-react";

export const LoanCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [activeTab, setActiveTab] = useState<"standard" | "compare">("standard");

  // Standard loan inputs
  const [loanAmount, setLoanAmount] = useState<number>(() => getQueryParamNumber("amt", 25000));
  const [interestRate, setInterestRate] = useState<number>(() => getQueryParamNumber("rate", 6.5));
  const [loanTermMonths, setLoanTermMonths] = useState<number>(() => getQueryParamNumber("months", 60));
  const [originationFeePercent, setOriginationFeePercent] = useState<number>(1.0);
  const [loanType, setLoanType] = useState<"personal" | "auto" | "student" | "other">("auto");

  // Multi-Offer Comparison state (3 offers)
  const [offers, setOffers] = useState<LoanComparisonOffer[]>([
    { id: "A", name: "Offer A (Short Term)", loanAmount: 25000, interestRate: 5.5, loanTermMonths: 36, originationFee: 200 },
    { id: "B", name: "Offer B (Balanced)", loanAmount: 25000, interestRate: 6.5, loanTermMonths: 60, originationFee: 250 },
    { id: "C", name: "Offer C (Lowest Payment)", loanAmount: 25000, interestRate: 7.5, loanTermMonths: 72, originationFee: 300 },
  ]);

  useEffect(() => {
    updateUrlQueryParams({
      amt: loanAmount,
      rate: interestRate,
      months: loanTermMonths,
    });
  }, [loanAmount, interestRate, loanTermMonths]);

  const standardInputs: LoanInputs = useMemo(() => ({
    loanAmount,
    interestRate,
    loanTermMonths,
    loanType,
    originationFeePercent,
  }), [loanAmount, interestRate, loanTermMonths, loanType, originationFeePercent]);

  const standardResults = useMemo(() => calculateLoan(standardInputs), [standardInputs]);

  // Comparison results
  const comparedResults = useMemo(() => {
    return offers.map((o) => {
      const res = calculateLoan({
        loanAmount: o.loanAmount,
        interestRate: o.interestRate,
        loanTermMonths: o.loanTermMonths,
        loanType: "personal",
        originationFeePercent: 0,
      });
      return {
        ...o,
        monthlyPayment: res.monthlyPayment,
        totalInterest: res.totalInterest,
        totalCost: o.loanAmount + res.totalInterest + o.originationFee,
      };
    });
  }, [offers]);

  return (
    <div id="loan-calculator-tool" className="space-y-8">
      {/* Mode Switcher */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl max-w-sm text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("standard")}
          className={`flex-1 py-2 px-3 rounded-lg transition-all ${
            activeTab === "standard"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Standard Loan / EMI
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("compare")}
          className={`flex-1 py-2 px-3 rounded-lg transition-all ${
            activeTab === "compare"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Compare 3 Offers
        </button>
      </div>

      {activeTab === "standard" ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-5 space-y-4">
              <div className="py-1 space-y-2">
                <label className="text-sm font-semibold text-slate-800 block">Loan Category</label>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
                  {(["auto", "personal", "student", "other"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLoanType(t)}
                      className={`py-1.5 px-2 rounded-lg border capitalize text-center transition-all ${
                        loanType === t
                          ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <NumberSliderInput
                id="loan-amount"
                label="Loan Borrowing Amount"
                value={loanAmount}
                onChange={setLoanAmount}
                min={1000}
                max={100000}
                step={500}
                prefix={config.symbol}
                tooltip="Total principal borrowed."
              />

              <NumberSliderInput
                id="loan-interest-rate"
                label="Interest Rate (APR)"
                value={interestRate}
                onChange={setInterestRate}
                min={1.0}
                max={25.0}
                step={0.1}
                suffix="%"
                tooltip="Annual percentage interest rate."
              />

              {/* Term in Months */}
              <div className="py-2 border-t border-slate-100 space-y-2">
                <label className="text-sm font-semibold text-slate-800 block">Loan Term Length</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 text-xs font-semibold">
                  {[12, 24, 36, 48, 60, 72].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setLoanTermMonths(m)}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                        loanTermMonths === m
                          ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {m} Mo
                    </button>
                  ))}
                </div>
              </div>

              <NumberSliderInput
                id="loan-origination-fee"
                label="Lender Origination Fee"
                value={originationFeePercent}
                onChange={setOriginationFeePercent}
                min={0}
                max={6}
                step={0.25}
                suffix="%"
                helperText={`Upfront fee: ${formatMoney(standardResults.totalFees)}`}
              />
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-7 space-y-6">
              <ResultCard
                id="loan-monthly-emi-card"
                title="Monthly Loan Payment (EMI)"
                value={formatMoney(standardResults.monthlyPayment)}
                subtitle={`Total Repayment: ${formatMoney(standardResults.totalCost)} over ${loanTermMonths} months`}
                highlight
                badge={{ text: `${loanTermMonths} Months Term`, variant: "info" }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <ResultCard
                  id="loan-principal-card"
                  title="Principal"
                  value={formatMoney(standardResults.totalPrincipal, { compact: true })}
                />
                <ResultCard
                  id="loan-interest-card"
                  title="Total Interest"
                  value={formatMoney(standardResults.totalInterest, { compact: true })}
                />
                <ResultCard
                  id="loan-fees-card"
                  title="Origination Fee"
                  value={formatMoney(standardResults.totalFees, { compact: true })}
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block text-sm">Loan Payoff Summary:</span>
                <p>
                  Borrowing <strong>{formatMoney(loanAmount)}</strong> at <strong>{interestRate}%</strong> APR over <strong>{loanTermMonths} months</strong> requires paying <strong>{formatMoney(standardResults.monthlyPayment)}</strong> every month. You will pay a total of <strong>{formatMoney(standardResults.totalInterest)}</strong> in interest charges plus <strong>{formatMoney(standardResults.totalFees)}</strong> in upfront lender fees.
                </p>
              </div>
            </div>
          </div>

          <AmortizationTable id="loan-schedule-table" schedule={standardResults.schedule} />
        </div>
      ) : (
        /* Multi-Offer Comparison Mode */
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Side-by-Side Loan Offer Comparison</h3>
            <p className="text-xs text-slate-500 mb-6">
              Adjust interest rates, loan terms, and origination fees across 3 competing offers to discover the true lowest-cost financing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {offers.map((offer, idx) => {
                const res = comparedResults[idx];
                const isLowestCost = comparedResults.every((r) => r.totalCost >= res.totalCost);

                return (
                  <div
                    key={offer.id}
                    className={`p-5 rounded-xl border transition-all ${
                      isLowestCost
                        ? "border-emerald-600 bg-emerald-50/30 shadow-md ring-1 ring-emerald-600"
                        : "border-slate-200 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-slate-900">{offer.name}</span>
                      {isLowestCost && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Best Value
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Interest Rate (APR)
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={offer.interestRate}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const updated = [...offers];
                              updated[idx].interestRate = val;
                              setOffers(updated);
                            }}
                            className="w-full text-xs font-bold py-1.5 px-2.5 rounded border border-slate-300 bg-white"
                          />
                          <span className="text-xs font-bold text-slate-400">%</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Term Length (Months)
                        </label>
                        <input
                          type="number"
                          step="12"
                          value={offer.loanTermMonths}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 12;
                            const updated = [...offers];
                            updated[idx].loanTermMonths = val;
                            setOffers(updated);
                          }}
                          className="w-full text-xs font-bold py-1.5 px-2.5 rounded border border-slate-300 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Origination Fee ({config.symbol})
                        </label>
                        <input
                          type="number"
                          step="50"
                          value={offer.originationFee}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const updated = [...offers];
                            updated[idx].originationFee = val;
                            setOffers(updated);
                          }}
                          className="w-full text-xs font-bold py-1.5 px-2.5 rounded border border-slate-300 bg-white"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200/80 space-y-2 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-500">Monthly Payment:</span>
                        <span className="font-bold text-slate-900">{formatMoney(res.monthlyPayment)}/mo</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-500">Total Interest:</span>
                        <span className="font-bold text-amber-700">{formatMoney(res.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-200">
                        <span className="text-slate-900">Total Cost:</span>
                        <span className={isLowestCost ? "text-emerald-700" : "text-slate-900"}>
                          {formatMoney(res.totalCost)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
