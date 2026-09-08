import React, { useState, useMemo } from "react";
import { CreditCardPayoffInputs } from "../../types";
import { calculateCreditCardPayoff } from "../../utils/financeMath";
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
import { CreditCard, AlertTriangle, Zap, CheckCircle2, TrendingDown, DollarSign } from "lucide-react";

export const CreditCardPayoffCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [currentBalance, setCurrentBalance] = useState<number>(8500);
  const [apr, setApr] = useState<number>(24.99);
  const [paymentType, setPaymentType] = useState<"minimum" | "fixed">("fixed");
  const [fixedMonthlyPayment, setFixedMonthlyPayment] = useState<number>(300);
  const [additionalMonthlyPayment, setAdditionalMonthlyPayment] = useState<number>(50);
  const [minPaymentPercent, setMinPaymentPercent] = useState<number>(2.5);

  const inputs: CreditCardPayoffInputs = useMemo(
    () => ({
      currentBalance,
      apr,
      paymentType,
      fixedMonthlyPayment,
      additionalMonthlyPayment,
      minPaymentPercent,
    }),
    [
      currentBalance,
      apr,
      paymentType,
      fixedMonthlyPayment,
      additionalMonthlyPayment,
      minPaymentPercent,
    ]
  );

  const results = useMemo(() => calculateCreditCardPayoff(inputs), [inputs]);

  // Combine monthly balance schedules for the comparison chart
  const chartData = useMemo(() => {
    const maxMonths = Math.min(
      60,
      Math.max(results.minimumScenario.monthlySchedule.length, results.chosenScenario.monthlySchedule.length)
    );
    const data = [];
    for (let m = 1; m <= maxMonths; m++) {
      const minPt = results.minimumScenario.monthlySchedule.find((s) => s.month === m);
      const chosenPt = results.chosenScenario.monthlySchedule.find((s) => s.month === m);
      data.push({
        month: m,
        minBalance: minPt ? minPt.balance : 0,
        chosenBalance: chosenPt ? chosenPt.balance : 0,
      });
    }
    return data;
  }, [results]);

  return (
    <div id="credit-card-payoff-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-teal-700" />
              Credit Card Parameters
            </h3>

            <NumberSliderInput
              id="cc-balance"
              label="Current Credit Card Balance"
              value={currentBalance}
              onChange={setCurrentBalance}
              min={500}
              max={50000}
              step={100}
              prefix={config.symbol}
              tooltip="Total current statement balance."
            />

            <NumberSliderInput
              id="cc-apr"
              label="Annual Percentage Rate (APR)"
              value={apr}
              onChange={setApr}
              min={9.99}
              max={36.0}
              step={0.1}
              suffix="%"
              tooltip="Current credit card interest rate (US national average is ~21%–25%)."
            />
          </div>

          {/* Strategy Selection */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Payment Strategy
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                id="btn-strat-fixed"
                onClick={() => setPaymentType("fixed")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  paymentType === "fixed"
                    ? "bg-white text-teal-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Fixed Monthly Amount
              </button>
              <button
                type="button"
                id="btn-strat-min"
                onClick={() => setPaymentType("minimum")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  paymentType === "minimum"
                    ? "bg-white text-teal-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Minimum Only
              </button>
            </div>

            {paymentType === "fixed" ? (
              <NumberSliderInput
                id="cc-fixed-payment"
                label="Target Monthly Payment"
                value={fixedMonthlyPayment}
                onChange={setFixedMonthlyPayment}
                min={50}
                max={2500}
                step={25}
                prefix={config.symbol}
                suffix="/mo"
                tooltip="Amount you commit to paying each month until the card is paid off."
              />
            ) : (
              <NumberSliderInput
                id="cc-min-percent"
                label="Minimum Payment Percentage"
                value={minPaymentPercent}
                onChange={setMinPaymentPercent}
                min={1.5}
                max={4.0}
                step={0.1}
                suffix="%"
                tooltip="Card issuer formula: usually 2% - 2.5% of balance or $35."
              />
            )}

            <NumberSliderInput
              id="cc-extra-payment"
              label="Extra Monthly Accelerator"
              value={additionalMonthlyPayment}
              onChange={setAdditionalMonthlyPayment}
              min={0}
              max={500}
              step={10}
              prefix={config.symbol}
              suffix="/mo"
              tooltip="Extra cash added on top of your payment to extinguish debt faster."
            />
          </div>
        </div>

        {/* Right Column: Comparison & Trajectory */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Result Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="result-debt-free-date"
              title="Debt-Free Target Date"
              value={results.chosenScenario.payoffDateString}
              subtitle={`Time to payoff: ${Math.floor(results.chosenScenario.monthsToPayoff / 12)} yrs ${
                results.chosenScenario.monthsToPayoff % 12
              } mos`}
              highlight={true}
              badge={{
                text: `${results.monthsSaved} Months Saved!`,
                variant: "positive",
              }}
            />

            <ResultCard
              id="result-interest-saved"
              title="Total Interest Saved"
              value={formatMoney(results.interestSaved)}
              subtitle={`Total interest paid: ${formatMoney(results.chosenScenario.totalInterestPaid)}`}
              highlight={false}
              badge={{
                text: "Accelerated Plan",
                variant: "info",
              }}
            />
          </div>

          {/* Minimum Payment Trap Warning Callout */}
          {results.trapWarning && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">The Minimum Payment Trap Alert</p>
                <p className="text-xs mt-1 leading-relaxed">
                  Paying only the minimum takes{" "}
                  <strong>
                    {Math.floor(results.minimumScenario.monthsToPayoff / 12)} years
                  </strong>{" "}
                  and costs{" "}
                  <strong>{formatMoney(results.minimumScenario.totalInterestPaid)} in pure interest</strong> — more than
                  the entire original balance borrowed!
                </p>
              </div>
            </div>
          )}

          {/* Side-by-Side Comparison Matrix */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Minimum Payments vs. Your Strategy
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Minimum Payment Only
                </span>
                <span className="text-lg font-black text-rose-700 mt-1 block">
                  {results.minimumScenario.payoffDateString}
                </span>
                <span className="text-xs text-slate-600 mt-1 block">
                  Interest: <strong>{formatMoney(results.minimumScenario.totalInterestPaid)}</strong>
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Total Paid: {formatMoney(results.minimumScenario.totalPaid)}
                </span>
              </div>

              <div className="p-4 bg-teal-50/80 rounded-xl border border-teal-200">
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                  Your Accelerated Plan
                </span>
                <span className="text-lg font-black text-teal-900 mt-1 block">
                  {results.chosenScenario.payoffDateString}
                </span>
                <span className="text-xs text-teal-950 mt-1 block">
                  Interest: <strong>{formatMoney(results.chosenScenario.totalInterestPaid)}</strong>
                </span>
                <span className="text-[11px] text-teal-700 block mt-0.5">
                  Total Paid: {formatMoney(results.chosenScenario.totalPaid)}
                </span>
              </div>
            </div>
          </div>

          {/* Payoff Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-teal-700" />
              Debt Balance Payoff Trajectory
            </h3>
            <div className="h-60 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chosenPayoffGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="minPayoffGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tickFormatter={(m) => `M${m}`} stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `${config.symbol}${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatMoney(Number(val)), "Remaining Balance"]}
                    labelFormatter={(label) => `Month ${label}`}
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
                    dataKey="chosenBalance"
                    name="Accelerated Plan"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#chosenPayoffGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="minBalance"
                    name="Minimum Payment Only"
                    stroke="#e11d48"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#minPayoffGrad)"
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
