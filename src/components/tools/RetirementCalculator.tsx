import React, { useState, useEffect, useMemo } from "react";
import { RetirementInputs } from "../../types";
import { calculateRetirement } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import { getQueryParamNumber, updateUrlQueryParams } from "../../utils/urlState";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

export const RetirementCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [currentAge, setCurrentAge] = useState<number>(() => getQueryParamNumber("age", 30));
  const [retirementAge, setRetirementAge] = useState<number>(() => getQueryParamNumber("retAge", 65));
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(88);
  const [currentSavings, setCurrentSavings] = useState<number>(() => getQueryParamNumber("savings", 35000));
  const [monthlyContribution, setMonthlyContribution] = useState<number>(() => getQueryParamNumber("contrib", 600));
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState<number>(() => getQueryParamNumber("retRate", 7.5));
  const [expectedInflation, setExpectedInflation] = useState<number>(2.5);
  const [desiredAnnualRetirementIncome, setDesiredAnnualRetirementIncome] = useState<number>(
    () => getQueryParamNumber("targetInc", 60000)
  );

  useEffect(() => {
    updateUrlQueryParams({
      age: currentAge,
      retAge: retirementAge,
      savings: currentSavings,
      contrib: monthlyContribution,
      retRate: expectedAnnualReturn,
      targetInc: desiredAnnualRetirementIncome,
    });
  }, [
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    expectedAnnualReturn,
    desiredAnnualRetirementIncome,
  ]);

  const inputs: RetirementInputs = useMemo(() => ({
    currentAge,
    retirementAge,
    lifeExpectancy,
    currentSavings,
    monthlyContribution,
    expectedAnnualReturn,
    expectedInflation,
    desiredAnnualRetirementIncome,
  }), [
    currentAge,
    retirementAge,
    lifeExpectancy,
    currentSavings,
    monthlyContribution,
    expectedAnnualReturn,
    expectedInflation,
    desiredAnnualRetirementIncome,
  ]);

  const results = useMemo(() => calculateRetirement(inputs), [inputs]);

  return (
    <div id="retirement-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <NumberSliderInput
              id="retire-current-age"
              label="Current Age"
              value={currentAge}
              onChange={(val) => {
                setCurrentAge(val);
                if (val >= retirementAge) setRetirementAge(val + 5);
              }}
              min={18}
              max={75}
              step={1}
              suffix=" yrs"
            />
            <NumberSliderInput
              id="retire-retire-age"
              label="Retirement Age"
              value={retirementAge}
              onChange={setRetirementAge}
              min={currentAge + 1}
              max={85}
              step={1}
              suffix=" yrs"
            />
          </div>

          <NumberSliderInput
            id="retire-current-savings"
            label="Current Retirement Savings"
            value={currentSavings}
            onChange={setCurrentSavings}
            min={0}
            max={1000000}
            step={2500}
            prefix={config.symbol}
            tooltip="Total 401(k), IRA, and investment portfolio balance today."
          />

          <NumberSliderInput
            id="retire-monthly-contrib"
            label="Monthly Contribution"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            min={0}
            max={5000}
            step={50}
            prefix={config.symbol}
            tooltip="How much you and your employer add to retirement investments each month."
          />

          <NumberSliderInput
            id="retire-annual-return"
            label="Expected Annual Return"
            value={expectedAnnualReturn}
            onChange={setExpectedAnnualReturn}
            min={3.0}
            max={14.0}
            step={0.1}
            suffix="%"
            tooltip="Historically, broad index funds return 7%–10% annually before inflation."
          />

          <NumberSliderInput
            id="retire-inflation-rate"
            label="Expected Inflation Rate"
            value={expectedInflation}
            onChange={setExpectedInflation}
            min={1.0}
            max={6.0}
            step={0.1}
            suffix="%"
            tooltip="Average long-term inflation rate (the historical US average is ~2.5%–3%)."
          />

          <NumberSliderInput
            id="retire-target-income"
            label="Desired Annual Income in Retirement"
            value={desiredAnnualRetirementIncome}
            onChange={setDesiredAnnualRetirementIncome}
            min={20000}
            max={250000}
            step={2500}
            prefix={config.symbol}
            tooltip="Annual spending budget in retirement, stated in today's purchasing power."
          />
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Result Card */}
          <ResultCard
            id="retire-projected-nestegg-card"
            title="Projected Nest Egg at Retirement"
            value={formatMoney(results.projectedNestEggAtRetirement, { compact: true })}
            subtitle={`In Today's Purchasing Power: ${formatMoney(results.projectedNestEggInflationAdjusted, { compact: true })}`}
            highlight
            badge={{
              text: results.isGoalMet ? "Goal On Track" : "Savings Shortfall",
              variant: results.isGoalMet ? "positive" : "warning",
            }}
          />

          {/* Goal Status Feedback Banner */}
          {results.isGoalMet ? (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-sm text-emerald-900 block">
                  You are fully on track to meet your retirement goal!
                </span>
                <p>
                  At age {retirementAge}, your portfolio is projected to safely generate{" "}
                  <strong>{formatMoney(results.annualSafeRetirementIncome)}/year</strong> (under the 4% safe withdrawal rule), exceeding your desired target of {formatMoney(desiredAnnualRetirementIncome)}/year.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-950 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-sm text-amber-900 block">
                  Projected Income Shortfall: {formatMoney(Math.abs(results.surplusOrShortfall))}/yr
                </span>
                <p>
                  To bridge this gap and reach your target of {formatMoney(desiredAnnualRetirementIncome)}/yr, consider raising your monthly contributions by{" "}
                  <strong className="text-amber-900 font-bold">
                    +{formatMoney(results.additionalMonthlySavingsNeeded)}/month
                  </strong>{" "}
                  (or delaying retirement by 2–3 years).
                </p>
              </div>
            </div>
          )}

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <ResultCard
              id="retire-safe-income-card"
              title="Safe Annual Income (4%)"
              value={formatMoney(results.annualSafeRetirementIncome, { compact: true })}
            />
            <ResultCard
              id="retire-years-growing-card"
              title="Years of Growth"
              value={`${retirementAge - currentAge} Years`}
            />
            <ResultCard
              id="retire-surplus-shortfall-card"
              title={results.isGoalMet ? "Annual Surplus" : "Annual Deficit"}
              value={formatMoney(Math.abs(results.surplusOrShortfall), { compact: true })}
            />
          </div>

          {/* Projection Area Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Portfolio Growth Timeline (Age {currentAge} to {retirementAge})</h4>
            <p className="text-xs text-slate-500 mb-4">
              Comparing your out-of-pocket contributions against total compounded capital.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.yearlyProjection} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="age" tickFormatter={(age) => `Age ${age}`} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(val) => formatMoney(val, { compact: true })} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [formatMoney(val), ""]}
                    labelFormatter={(label) => `At Age ${label}`}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Area
                    type="monotone"
                    name="Projected Nest Egg"
                    dataKey="balanceNominal"
                    stroke="#0f766e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorNominal)"
                  />
                  <Area
                    type="monotone"
                    name="Total Contributions"
                    dataKey="contributionsTotal"
                    stroke="#0284c7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorContrib)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
