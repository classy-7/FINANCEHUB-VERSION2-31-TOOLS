import React, { useState, useMemo } from "react";
import { RentVsBuyInputs } from "../../types";
import { calculateRentVsBuy } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Home, KeyRound, TrendingUp, CheckCircle, Scale, DollarSign } from "lucide-react";

export const RentVsBuyCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [monthlyRent, setMonthlyRent] = useState<number>(2200);
  const [expectedRentIncreasePercent, setExpectedRentIncreasePercent] = useState<number>(3.5);
  const [homePrice, setHomePrice] = useState<number>(450000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [mortgageRate, setMortgageRate] = useState<number>(6.5);
  const [mortgageTermYears, setMortgageTermYears] = useState<number>(30);
  const [propertyTaxRate, setPropertyTaxRate] = useState<number>(1.2);
  const [maintenanceRate, setMaintenanceRate] = useState<number>(1.5);
  const [homeAppreciationRate, setHomeAppreciationRate] = useState<number>(3.8);
  const [planningHorizonYears, setPlanningHorizonYears] = useState<number>(10);
  const [investmentReturnRate, setInvestmentReturnRate] = useState<number>(7.0);

  const inputs: RentVsBuyInputs = useMemo(
    () => ({
      monthlyRent,
      expectedRentIncreasePercent,
      homePrice,
      downPaymentPercent,
      mortgageRate,
      mortgageTermYears,
      propertyTaxRate,
      maintenanceRate,
      homeAppreciationRate,
      planningHorizonYears,
      investmentReturnRate,
    }),
    [
      monthlyRent,
      expectedRentIncreasePercent,
      homePrice,
      downPaymentPercent,
      mortgageRate,
      mortgageTermYears,
      propertyTaxRate,
      maintenanceRate,
      homeAppreciationRate,
      planningHorizonYears,
      investmentReturnRate,
    ]
  );

  const results = useMemo(() => calculateRentVsBuy(inputs), [inputs]);

  return (
    <div id="rent-vs-buy-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          {/* Rent Parameters */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-teal-700" />
              Rental Scenario Inputs
            </h3>
            <NumberSliderInput
              id="rent-monthly"
              label="Current Monthly Rent"
              value={monthlyRent}
              onChange={setMonthlyRent}
              min={500}
              max={8000}
              step={50}
              prefix={config.symbol}
              tooltip="Your current or expected monthly rent."
            />
            <NumberSliderInput
              id="rent-increase"
              label="Annual Rent Increase"
              value={expectedRentIncreasePercent}
              onChange={setExpectedRentIncreasePercent}
              min={0}
              max={10}
              step={0.1}
              suffix="%"
              tooltip="Historical US national rent inflation averages 3.0% - 4.5% annually."
            />
            <NumberSliderInput
              id="rent-invest-return"
              label="Renter's Investment Return"
              value={investmentReturnRate}
              onChange={setInvestmentReturnRate}
              min={3}
              max={12}
              step={0.5}
              suffix="%"
              tooltip="Expected return on the down payment money invested in index funds instead of real estate."
            />
          </div>

          {/* Buy Parameters */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-teal-700" />
              Home Purchase Inputs
            </h3>
            <NumberSliderInput
              id="buy-home-price"
              label="Target Home Purchase Price"
              value={homePrice}
              onChange={setHomePrice}
              min={100000}
              max={1500000}
              step={5000}
              prefix={config.symbol}
              tooltip="Asking price of the home you are considering buying."
            />
            <div className="grid grid-cols-2 gap-3">
              <NumberSliderInput
                id="buy-down-payment"
                label="Down Payment"
                value={downPaymentPercent}
                onChange={setDownPaymentPercent}
                min={3}
                max={50}
                step={1}
                suffix="%"
                tooltip="Percentage of home price paid upfront in cash."
              />
              <NumberSliderInput
                id="buy-mortgage-rate"
                label="Mortgage Rate"
                value={mortgageRate}
                onChange={setMortgageRate}
                min={3.5}
                max={11.0}
                step={0.1}
                suffix="%"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberSliderInput
                id="buy-appreciation"
                label="Home Appreciation"
                value={homeAppreciationRate}
                onChange={setHomeAppreciationRate}
                min={1}
                max={8}
                step={0.1}
                suffix="%"
                tooltip="Expected yearly appreciation of the property."
              />
              <NumberSliderInput
                id="buy-property-tax"
                label="Property Tax Rate"
                value={propertyTaxRate}
                onChange={setPropertyTaxRate}
                min={0.4}
                max={3.0}
                step={0.1}
                suffix="%"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberSliderInput
                id="buy-maintenance"
                label="Maintenance / Repair"
                value={maintenanceRate}
                onChange={setMaintenanceRate}
                min={0.5}
                max={3.0}
                step={0.1}
                suffix="%"
                tooltip="Annual upkeep budget (standard rule of thumb is 1% - 1.5% of home value)."
              />
              <NumberSliderInput
                id="buy-horizon"
                label="Years Planning to Stay"
                value={planningHorizonYears}
                onChange={setPlanningHorizonYears}
                min={2}
                max={30}
                step={1}
                suffix=" yrs"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Comparison Verdict & Chart */}
        <div className="lg:col-span-7 space-y-6">
          {/* Verdict Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="result-verdict"
              title={`Verdict After ${planningHorizonYears} Years`}
              value={
                results.betterOption === "buy"
                  ? `Buy (+${formatMoney(results.netAdvantageAmount)})`
                  : `Rent (+${formatMoney(results.netAdvantageAmount)})`
              }
              subtitle={
                results.breakEvenYear
                  ? `Break-even occurs in Year ${results.breakEvenYear} • Saves ${formatMoney(results.netAdvantageAmount)}`
                  : `Buying does not break even within ${planningHorizonYears} years`
              }
              highlight={true}
              badge={{
                text: results.betterOption === "buy" ? "Homeowner Advantage" : "Renter Advantage",
                variant: results.betterOption === "buy" ? "positive" : "warning",
              }}
            />

            <ResultCard
              id="result-breakeven"
              title="Break-Even Horizon"
              value={results.breakEvenYear ? `Year ${results.breakEvenYear}` : "Over 30+ Yrs"}
              subtitle={
                results.breakEvenYear
                  ? `Stay longer than ${results.breakEvenYear} yrs for buying to be strictly superior`
                  : "Due to high borrowing rates or strong market investment returns"
              }
              highlight={false}
              badge={{
                text: results.breakEvenYear && results.breakEvenYear <= planningHorizonYears ? "Achieved" : "Not Yet",
                variant: results.breakEvenYear && results.breakEvenYear <= planningHorizonYears ? "positive" : "neutral",
              }}
            />
          </div>

          {/* Net Worth Comparison Metric Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Buyer Net Worth (Equity)</span>
              <span className="text-xl sm:text-2xl font-black text-teal-800 mt-1 block">
                {formatMoney(results.finalNetWorthBuying)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Home value minus remaining loan & 6% selling costs
              </span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Renter Net Worth (Invested)</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
                {formatMoney(results.finalNetWorthRenting)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Down payment & monthly difference compounding at {investmentReturnRate}%
              </span>
            </div>
          </div>

          {/* Interactive Trajectory Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-700" />
                Net Worth Trajectory Over Time
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">Real-time projection</span>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.yearlySchedule} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="buyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="rentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tickFormatter={(y) => `Yr ${y}`} stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `${config.symbol}${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatMoney(Number(val)), ""]}
                    labelFormatter={(label) => `Year ${label}`}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="buyingNetWorth"
                    name="Buyer Net Worth (Equity)"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#buyGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="rentingNetWorth"
                    name="Renter Net Worth (Investments)"
                    stroke="#64748b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#rentGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-700" />
              Annual Financial Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold uppercase">
                    <th className="py-2 px-3">Year</th>
                    <th className="py-2 px-3">Buyer Equity</th>
                    <th className="py-2 px-3">Renter Portfolio</th>
                    <th className="py-2 px-3">Loan Balance</th>
                    <th className="py-2 px-3 text-right">Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {results.yearlySchedule.map((row) => {
                    const diff = row.buyingNetWorth - row.rentingNetWorth;
                    return (
                      <tr key={row.year} className="hover:bg-slate-50 text-slate-700 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-900">Yr {row.year}</td>
                        <td className="py-2 px-3 text-teal-900 font-medium">{formatMoney(row.buyingNetWorth)}</td>
                        <td className="py-2 px-3">{formatMoney(row.rentingNetWorth)}</td>
                        <td className="py-2 px-3 text-slate-500">{formatMoney(row.mortgageBalance)}</td>
                        <td
                          className={`py-2 px-3 text-right font-bold ${
                            diff >= 0 ? "text-teal-700" : "text-amber-700"
                          }`}
                        >
                          {diff >= 0 ? `+${formatMoney(diff)} (Buy)` : `+${formatMoney(Math.abs(diff))} (Rent)`}
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
