import React, { useState, useMemo } from "react";
import { InflationInputs } from "../../types";
import { calculateInflation } from "../../utils/financeMath";
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
import { TrendingDown, Calendar, History, ArrowRight, DollarSign } from "lucide-react";

export const InflationCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [startingAmount, setStartingAmount] = useState<number>(100);
  const [startYear, setStartYear] = useState<number>(1990);
  const [endYear, setEndYear] = useState<number>(2025);
  const [customFutureInflationRate, setCustomFutureInflationRate] = useState<number>(3.0);

  const inputs: InflationInputs = useMemo(
    () => ({
      startingAmount,
      startYear,
      endYear,
      customFutureInflationRate,
    }),
    [startingAmount, startYear, endYear, customFutureInflationRate]
  );

  const results = useMemo(() => calculateInflation(inputs), [inputs]);

  const yearPresets = [
    { label: "1970 (70s Stagflation)", start: 1970 },
    { label: "1980 (Peak CPI)", start: 1980 },
    { label: "1990 (35 Yrs Ago)", start: 1990 },
    { label: "2000 (Dot-Com)", start: 2000 },
    { label: "2010 (Post-GFC)", start: 2010 },
    { label: "2020 (Pandemic Shock)", start: 2020 },
  ];

  return (
    <div id="inflation-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-700" />
              Inflation Timeframe
            </h3>

            <NumberSliderInput
              id="inf-start-amount"
              label="Starting Currency Amount"
              value={startingAmount}
              onChange={setStartingAmount}
              min={1}
              max={100000}
              step={10}
              prefix={config.symbol}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberSliderInput
                id="inf-start-year"
                label="Start Year"
                value={startYear}
                onChange={setStartYear}
                min={1913}
                max={2025}
                step={1}
                tooltip="Historical US Bureau of Labor Statistics CPI tracking began in 1913."
              />
              <NumberSliderInput
                id="inf-end-year"
                label="End Year"
                value={endYear}
                onChange={setEndYear}
                min={1914}
                max={2035}
                step={1}
              />
            </div>

            {/* Quick Era Presets */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-slate-500 block">Popular Historical Eras</label>
              <div className="grid grid-cols-2 gap-1.5">
                {yearPresets.map((p) => (
                  <button
                    key={p.start}
                    type="button"
                    onClick={() => {
                      setStartYear(p.start);
                      setEndYear(2025);
                    }}
                    className={`py-1.5 px-2 text-[11px] rounded-lg border text-left transition-all ${
                      startYear === p.start && endYear === 2025
                        ? "bg-teal-50 text-teal-900 border-teal-600 font-bold"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {endYear > 2025 && (
              <NumberSliderInput
                id="inf-future-rate"
                label="Projected Future Annual Inflation"
                value={customFutureInflationRate}
                onChange={setCustomFutureInflationRate}
                min={1.5}
                max={8.0}
                step={0.1}
                suffix="%"
                tooltip="Federal Reserve target is 2.0%; long-run US average is ~3.2%."
              />
            )}
          </div>
        </div>

        {/* Right Column: Results & Historical Chart */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Result Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="result-adjusted-amount"
              title={`Equivalent Value in ${endYear}`}
              value={formatMoney(results.adjustedAmount)}
              subtitle={`${formatMoney(startingAmount)} in ${startYear} equals ${formatMoney(results.adjustedAmount)} in ${endYear}`}
              highlight={true}
              badge={{
                text: `+${results.cumulativeInflationPercent.toFixed(1)}% Cumulative`,
                variant: "warning",
              }}
            />

            <ResultCard
              id="result-annual-rate"
              title="Annualized Inflation Rate"
              value={`${results.averageAnnualRatePercent.toFixed(2)}%`}
              subtitle={`Compound annual growth over ${results.yearSpan} years`}
              highlight={false}
              badge={{
                text: "Compound Annual",
                variant: "info",
              }}
            />
          </div>

          {/* Purchasing Power Decay Callout */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3.5">
            <TrendingDown className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Purchasing Power Erosion</p>
              <p className="text-xs mt-1 leading-relaxed">
                A dollar in <strong>{startYear}</strong> had substantially more purchasing power than a dollar in{" "}
                <strong>{endYear}</strong>. To buy what <strong>{formatMoney(startingAmount)}</strong> bought in {startYear},
                you now need <strong>{formatMoney(results.adjustedAmount)}</strong> today — representing an overall{" "}
                <strong>{results.cumulativeInflationPercent.toFixed(1)}% rise in the general price level</strong>.
              </p>
            </div>
          </div>

          {/* Historical Trajectory Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-teal-700" />
                Value Needed Over Time ({startYear} → {endYear})
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">BLS Consumer Price Index</span>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.schedule} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="infGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `${config.symbol}${val.toFixed(0)}`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatMoney(Number(val)), "Equivalent Value"]}
                    labelFormatter={(y) => `Year ${y}`}
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
                    dataKey="equivalentValue"
                    name="Cost of Constant Goods"
                    stroke="#d97706"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#infGrad)"
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
