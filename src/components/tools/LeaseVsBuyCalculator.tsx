import React, { useState, useMemo } from "react";
import { LeaseVsBuyInputs } from "../../types";
import { calculateLeaseVsBuy } from "../../utils/financeMath";
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
import { Car, DollarSign, Calendar, Percent, CheckCircle2, Info, ArrowRight } from "lucide-react";

export const LeaseVsBuyCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [vehiclePrice, setVehiclePrice] = useState<number>(38000);
  const [downPayment, setDownPayment] = useState<number>(4000);
  const [buyLoanRate, setBuyLoanRate] = useState<number>(6.5);
  const [buyLoanTermMonths, setBuyLoanTermMonths] = useState<number>(60);
  const [buySalesTaxRate, setBuySalesTaxRate] = useState<number>(7.0);
  const [leaseTermMonths, setLeaseTermMonths] = useState<number>(36);
  const [leaseMonthlyPayment, setLeaseMonthlyPayment] = useState<number>(440);
  const [leaseDueAtSigning, setLeaseDueAtSigning] = useState<number>(3000);
  const [leaseResidualValue, setLeaseResidualValue] = useState<number>(21000);
  const [ownershipYears, setOwnershipYears] = useState<number>(5);

  const inputs: LeaseVsBuyInputs = useMemo(
    () => ({
      vehiclePrice,
      downPayment,
      buyLoanRate,
      buyLoanTermMonths,
      buySalesTaxRate,
      leaseTermMonths,
      leaseMonthlyPayment,
      leaseDueAtSigning,
      leaseResidualValue,
      ownershipYears,
    }),
    [
      vehiclePrice,
      downPayment,
      buyLoanRate,
      buyLoanTermMonths,
      buySalesTaxRate,
      leaseTermMonths,
      leaseMonthlyPayment,
      leaseDueAtSigning,
      leaseResidualValue,
      ownershipYears,
    ]
  );

  const results = useMemo(() => calculateLeaseVsBuy(inputs), [inputs]);

  return (
    <div id="lease-vs-buy-car-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* General Vehicle Info */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-teal-700" />
              Vehicle & Timeline
            </h3>

            <NumberSliderInput
              id="car-price-input"
              label="Vehicle Negotiated Price (MSRP)"
              value={vehiclePrice}
              onChange={setVehiclePrice}
              min={10000}
              max={150000}
              step={1000}
              prefix={config.symbol}
            />

            <NumberSliderInput
              id="car-down-payment-input"
              label="Cash Down Payment (Buy Option)"
              value={downPayment}
              onChange={setDownPayment}
              min={0}
              max={50000}
              step={500}
              prefix={config.symbol}
            />

            <NumberSliderInput
              id="car-ownership-horizon-input"
              label="Comparison Horizon (Years to Keep)"
              value={ownershipYears}
              onChange={setOwnershipYears}
              min={2}
              max={8}
              step={1}
              suffix=" years"
              tooltip="How many years you plan to drive the car before replacing or selling."
            />
          </div>

          {/* Financing (Buy) Parameters */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-teal-800" />
              Loan Financing Parameters (Buy)
            </h3>

            <NumberSliderInput
              id="car-loan-rate-input"
              label="Auto Loan Interest Rate (APR)"
              value={buyLoanRate}
              onChange={setBuyLoanRate}
              min={1}
              max={18}
              step={0.25}
              suffix="%"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Loan Term (Months)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[36, 48, 60, 72].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setBuyLoanTermMonths(term)}
                    className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all text-center ${
                      buyLoanTermMonths === term
                        ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {term} mo
                  </button>
                ))}
              </div>
            </div>

            <NumberSliderInput
              id="car-sales-tax-rate"
              label="State & Local Sales Tax"
              value={buySalesTaxRate}
              onChange={setBuySalesTaxRate}
              min={0}
              max={12}
              step={0.25}
              suffix="%"
            />
          </div>

          {/* Lease Parameters */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-teal-700" />
              Lease Contract Parameters
            </h3>

            <NumberSliderInput
              id="car-lease-monthly-payment"
              label="Monthly Lease Payment"
              value={leaseMonthlyPayment}
              onChange={setLeaseMonthlyPayment}
              min={150}
              max={2000}
              step={10}
              prefix={config.symbol}
            />

            <NumberSliderInput
              id="car-lease-due-at-signing"
              label="Due at Signing (Down + Acq Fee)"
              value={leaseDueAtSigning}
              onChange={setLeaseDueAtSigning}
              min={0}
              max={15000}
              step={250}
              prefix={config.symbol}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Standard Lease Term
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[24, 36].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setLeaseTermMonths(term)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                      leaseTermMonths === term
                        ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {term} Months
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparison Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Winner Recommendation Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              results.winner === "buy"
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : "bg-blue-50/70 border-blue-200 text-blue-950"
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-sm block">
                Verdict: {results.winner === "buy" ? "Buying Is Cheaper" : "Leasing Is Cheaper"}
              </span>
              <p className="leading-relaxed">{results.summary}</p>
            </div>
          </div>

          {/* Primary Cards Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="car-buy-net-cost-card"
              title="Buy Net Cost (True Cost)"
              value={formatMoney(results.buyNetCost)}
              subtitle={`Total cash spent ${formatMoney(
                results.buyTotalPayments
              )} minus ${formatMoney(results.buyEstimatedEquity)} vehicle equity`}
              highlight={results.winner === "buy"}
              badge={{
                text: results.winner === "buy" ? "Lower Net Cost" : "Higher Net Cost",
                variant: results.winner === "buy" ? "success" : "info",
              }}
            />

            <ResultCard
              id="car-lease-net-cost-card"
              title="Lease Total Cost"
              value={formatMoney(results.leaseNetCost)}
              subtitle={`All payments over ${ownershipYears} yrs (equity = $0)`}
              highlight={results.winner === "lease"}
              badge={{
                text: results.winner === "lease" ? "Lower Cash Outlay" : "Higher Net Cost",
                variant: results.winner === "lease" ? "success" : "info",
              }}
            />
          </div>

          {/* Secondary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ResultCard
              id="car-buy-monthly-card"
              title="Loan Monthly Payment"
              value={formatMoney(results.buyMonthlyPayment)}
              subtitle={`${buyLoanTermMonths} mo term`}
            />
            <ResultCard
              id="car-equity-retained-card"
              title="Vehicle Equity Retained"
              value={formatMoney(results.buyEstimatedEquity)}
              subtitle={`Value at Yr ${ownershipYears}`}
            />
            <ResultCard
              id="car-cost-diff-card"
              title="Net Savings"
              value={formatMoney(results.savings)}
              subtitle={`Over ${ownershipYears} years`}
            />
          </div>

          {/* Side by Side Cost Breakdown Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Cumulative Cost Over Time: Buy vs. Lease
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">Annual Progression</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results.yearlySchedule}>
                  <XAxis
                    dataKey="year"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `Yr ${val}`}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatMoney(val)]}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="buyNetCost"
                    name="Buy Net Cost (Spent - Equity)"
                    fill="#0f766e"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="leaseCumulativeCost"
                    name="Lease Total Cash Outlay"
                    fill="#64748b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Educational Callout */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">The 3-Year Turning Point</span>
              <p className="leading-relaxed">
                Leasing offers lower monthly payments during the initial 24–36 months and hassle-free warranty coverage. However, after year 3, buying creates substantial equity. If you keep vehicles for 5+ years, buying almost always delivers a far lower total cost of ownership.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
