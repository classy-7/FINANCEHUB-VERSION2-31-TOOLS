import React, { useState, useMemo } from "react";
import { RentalRoiInputs } from "../../types";
import { calculateRentalRoi } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Building, DollarSign, Percent, TrendingUp, CheckCircle2, Info } from "lucide-react";

export const RentalPropertyRoiCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [purchasePrice, setPurchasePrice] = useState<number>(350000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [closingCosts, setClosingCosts] = useState<number>(7000);
  const [monthlyRent, setMonthlyRent] = useState<number>(2600);
  const [vacancyRate, setVacancyRate] = useState<number>(5.0);
  const [annualPropertyTax, setAnnualPropertyTax] = useState<number>(4200);
  const [annualInsurance, setAnnualInsurance] = useState<number>(1400);
  const [maintenanceReservePercent, setMaintenanceReservePercent] = useState<number>(8.0);
  const [managementFeePercent, setManagementFeePercent] = useState<number>(8.0);
  const [hoaMonthly, setHoaMonthly] = useState<number>(0);
  const [isFinanced, setIsFinanced] = useState<boolean>(true);
  const [mortgageInterestRate, setMortgageInterestRate] = useState<number>(6.5);
  const [mortgageTermYears, setMortgageTermYears] = useState<number>(30);

  const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);

  const inputs: RentalRoiInputs = useMemo(
    () => ({
      purchasePrice,
      downPayment: downPaymentAmount,
      closingCosts,
      monthlyRent,
      vacancyRate,
      annualPropertyTax,
      annualInsurance,
      maintenanceReservePercent,
      managementFeePercent,
      hoaMonthly,
      isFinanced,
      mortgageInterestRate,
      mortgageTermYears,
    }),
    [
      purchasePrice,
      downPaymentAmount,
      closingCosts,
      monthlyRent,
      vacancyRate,
      annualPropertyTax,
      annualInsurance,
      maintenanceReservePercent,
      managementFeePercent,
      hoaMonthly,
      isFinanced,
      mortgageInterestRate,
      mortgageTermYears,
    ]
  );

  const results = useMemo(() => calculateRentalRoi(inputs), [inputs]);

  return (
    <div id="rental-property-roi-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Purchase & Financing */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-teal-700" />
              Property Acquisition & Financing
            </h3>

            <NumberSliderInput
              id="rental-purchase-price"
              label="Purchase Price"
              value={purchasePrice}
              onChange={setPurchasePrice}
              min={50000}
              max={2000000}
              step={10000}
              prefix={config.symbol}
            />

            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Financed with Mortgage
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Toggle off for all-cash purchase
                </span>
              </div>
              <button
                type="button"
                id="rental-finance-toggle"
                onClick={() => setIsFinanced(!isFinanced)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-hidden p-0.5 ${
                  isFinanced ? "bg-teal-800" : "bg-slate-200"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isFinanced ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {isFinanced && (
              <>
                <NumberSliderInput
                  id="rental-down-payment-pct"
                  label={`Down Payment (${formatMoney(downPaymentAmount)})`}
                  value={downPaymentPercent}
                  onChange={setDownPaymentPercent}
                  min={10}
                  max={50}
                  step={5}
                  suffix="%"
                />

                <NumberSliderInput
                  id="rental-mortgage-rate"
                  label="Mortgage Interest Rate (Investor Rate)"
                  value={mortgageInterestRate}
                  onChange={setMortgageInterestRate}
                  min={3}
                  max={12}
                  step={0.125}
                  suffix="%"
                />
              </>
            )}

            <NumberSliderInput
              id="rental-closing-costs"
              label="Acquisition Closing Costs & Rehab"
              value={closingCosts}
              onChange={setClosingCosts}
              min={1000}
              max={40000}
              step={500}
              prefix={config.symbol}
            />
          </div>

          {/* Income & Operating Expenses */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-teal-700" />
              Rental Income & Operations
            </h3>

            <NumberSliderInput
              id="rental-monthly-rent"
              label="Gross Monthly Rent"
              value={monthlyRent}
              onChange={setMonthlyRent}
              min={500}
              max={15000}
              step={50}
              prefix={config.symbol}
            />

            <NumberSliderInput
              id="rental-vacancy-rate"
              label="Vacancy Rate Reserve"
              value={vacancyRate}
              onChange={setVacancyRate}
              min={0}
              max={15}
              step={0.5}
              suffix="%"
              tooltip="Standard vacancy allowance is 5% (~18 days/year unrented)."
            />

            <div className="grid grid-cols-2 gap-3">
              <NumberSliderInput
                id="rental-tax-annual"
                label="Annual Property Tax"
                value={annualPropertyTax}
                onChange={setAnnualPropertyTax}
                min={0}
                max={25000}
                step={200}
                prefix={config.symbol}
              />
              <NumberSliderInput
                id="rental-insurance-annual"
                label="Annual Hazard Insurance"
                value={annualInsurance}
                onChange={setAnnualInsurance}
                min={0}
                max={10000}
                step={100}
                prefix={config.symbol}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberSliderInput
                id="rental-maintenance-pct"
                label="Repairs & CapEx Reserve"
                value={maintenanceReservePercent}
                onChange={setMaintenanceReservePercent}
                min={0}
                max={20}
                step={1}
                suffix="%"
              />
              <NumberSliderInput
                id="rental-mgmt-fee-pct"
                label="Property Management"
                value={managementFeePercent}
                onChange={setManagementFeePercent}
                min={0}
                max={15}
                step={1}
                suffix="%"
              />
            </div>

            <NumberSliderInput
              id="rental-hoa-monthly"
              label="Monthly HOA / Condo Dues"
              value={hoaMonthly}
              onChange={setHoaMonthly}
              min={0}
              max={1500}
              step={25}
              prefix={config.symbol}
            />
          </div>
        </div>

        {/* Right Column: ROI Results & Metrics */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cash Flow Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              results.monthlyCashFlow > 0
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : "bg-rose-50/70 border-rose-200 text-rose-950"
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-sm block">
                {results.monthlyCashFlow > 0
                  ? `Positive Cash Flow: ${formatMoney(results.monthlyCashFlow)} / Month`
                  : `Negative Cash Flow: -${formatMoney(Math.abs(results.monthlyCashFlow))} / Month`}
              </span>
              <p className="leading-relaxed">
                {results.monthlyCashFlow > 0
                  ? `After accounting for all operating expenses, vacancy reserves, and ${
                      isFinanced ? "mortgage debt service" : "taxes"
                    }, this asset produces ${formatMoney(
                      results.annualCashFlow
                    )} in net annual cash flow with a ${results.cashOnCashReturn}% Cash-on-Cash Return.`
                  : `Operating expenses and debt service exceed your effective gross rental income. Consider renegotiating the purchase price, increasing down payment, or verifying local market rental comps.`}
              </p>
            </div>
          </div>

          {/* Primary Cards: Cap Rate & Cash-on-Cash */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="rental-cap-rate-card"
              title="Capitalization Rate (Cap Rate)"
              value={`${results.capRate}%`}
              subtitle={`NOI of ${formatMoney(results.netOperatingIncome)} / Purchase Price (All-Cash Yield)`}
              highlight={true}
              badge={{
                text: results.capRate >= 6 ? "Strong Cap Rate" : "Standard Cap Rate",
                variant: results.capRate >= 6 ? "success" : "info",
              }}
            />

            <ResultCard
              id="rental-coc-return-card"
              title="Cash-on-Cash Return (CoC)"
              value={`${results.cashOnCashReturn}%`}
              subtitle={`Annual Cash Flow of ${formatMoney(
                results.annualCashFlow
              )} on ${formatMoney(results.totalInitialInvestment)} initial capital`}
              highlight={false}
              badge={{
                text: `${formatMoney(results.monthlyCashFlow)}/mo net`,
                variant: results.cashOnCashReturn >= 8 ? "success" : "info",
              }}
            />
          </div>

          {/* Secondary Financial Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ResultCard
              id="rental-noi-card"
              title="Net Operating Income (NOI)"
              value={formatMoney(results.netOperatingIncome)}
              subtitle="Annual pre-debt income"
            />
            <ResultCard
              id="rental-debt-service-card"
              title="Annual Debt Service (P&I)"
              value={formatMoney(results.annualDebtService)}
              subtitle={isFinanced ? "Mortgage principal & interest" : "Paid in cash"}
            />
            <ResultCard
              id="rental-initial-outlay-card"
              title="Total Cash Out of Pocket"
              value={formatMoney(results.totalInitialInvestment)}
              subtitle="Down payment + closing costs"
            />
          </div>

          {/* 10-Year Wealth Forecast Chart */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                10-Year Total Wealth Creation (Equity + Cash Flow)
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">3% Appreciation Forecast</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.yearlyProjections}>
                  <defs>
                    <linearGradient id="colorRentalTotalProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="totalProfit"
                    name="Net Profit (Equity + Cash Flow)"
                    stroke="#0f766e"
                    fillOpacity={1}
                    fill="url(#colorRentalTotalProfit)"
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    name="Property Equity ($)"
                    stroke="#0284c7"
                    fillOpacity={0.2}
                    fill="#0284c7"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Educational Callout */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">Cap Rate vs. Cash-on-Cash Return</span>
              <p className="leading-relaxed">
                <strong>Cap Rate</strong> measures the unleveraged commercial return of the building itself, allowing apples-to-apples comparison across different properties regardless of mortgage terms. <strong>Cash-on-Cash Return</strong> measures the specific yield on your actual out-of-pocket cash, reflecting the power (or risk) of financial mortgage leverage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
