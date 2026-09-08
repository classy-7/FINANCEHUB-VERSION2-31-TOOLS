import React, { useState, useMemo } from "react";
import { TipInputs } from "../../types";
import { calculateTip } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import { Utensils, Users, Percent, DollarSign, Check, Info } from "lucide-react";

export const TipCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [billAmount, setBillAmount] = useState<number>(75);
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [splitCount, setSplitCount] = useState<number>(2);
  const [roundUp, setRoundUp] = useState<boolean>(false);

  const presets = [15, 18, 20, 25];

  const inputs: TipInputs = useMemo(
    () => ({
      billAmount,
      tipPercent,
      splitCount,
      roundUp,
    }),
    [billAmount, tipPercent, splitCount, roundUp]
  );

  const results = useMemo(() => calculateTip(inputs), [inputs]);

  return (
    <div id="tip-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-teal-700" />
              Bill & Gratuity Settings
            </h3>

            {/* Bill Amount */}
            <NumberSliderInput
              id="tip-bill-amount"
              label="Bill Amount"
              value={billAmount}
              onChange={setBillAmount}
              min={1}
              max={1000}
              step={1}
              prefix={config.symbol}
              tooltip="Subtotal before taxes and tip."
            />

            {/* Tip Percentage Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Tip Percentage
              </label>
              <div className="grid grid-cols-4 gap-2">
                {presets.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTipPercent(pct)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                      tipPercent === pct
                        ? "bg-teal-800 text-white border-teal-800 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <NumberSliderInput
              id="tip-percent-slider"
              label="Custom Tip Rate"
              value={tipPercent}
              onChange={setTipPercent}
              min={0}
              max={50}
              step={1}
              suffix="%"
            />

            {/* Number of People */}
            <NumberSliderInput
              id="tip-split-count"
              label="Split Between (Guests)"
              value={splitCount}
              onChange={setSplitCount}
              min={1}
              max={30}
              step={1}
              suffix=" people"
              tooltip="Number of people evenly sharing the final bill."
            />

            {/* Round Up Toggle */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Round Up Total Bill
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Rounds to the next whole dollar
                </span>
              </div>
              <button
                type="button"
                id="tip-round-up-toggle"
                onClick={() => setRoundUp(!roundUp)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-hidden p-0.5 ${
                  roundUp ? "bg-teal-800" : "bg-slate-200"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    roundUp ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Results & Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Result Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="tip-total-person-card"
              title="Per Person Total"
              value={formatMoney(results.perPersonTotal)}
              subtitle={`Bill: ${formatMoney(results.perPersonBill)} + Tip: ${formatMoney(results.perPersonTip)}`}
              highlight={true}
              badge={{
                text: splitCount > 1 ? `Split ${splitCount} Ways` : "Single Payer",
                variant: "success",
              }}
            />

            <ResultCard
              id="tip-total-bill-card"
              title="Total Bill with Tip"
              value={formatMoney(results.totalAmount)}
              subtitle={`Includes ${formatMoney(results.tipAmount)} tip (${results.tipPercent}%)`}
              highlight={false}
              badge={{
                text: `${results.tipPercent}% Tip Added`,
                variant: "info",
              }}
            />
          </div>

          {/* Secondary Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ResultCard
              id="tip-amount-card"
              title="Total Tip"
              value={formatMoney(results.tipAmount)}
              subtitle="Gratuity pool"
            />
            <ResultCard
              id="tip-per-person-tip-card"
              title="Tip Per Person"
              value={formatMoney(results.perPersonTip)}
              subtitle="Per guest tip"
            />
            <ResultCard
              id="tip-per-person-bill-card"
              title="Food Per Person"
              value={formatMoney(results.perPersonBill)}
              subtitle="Excluding tip"
            />
          </div>

          {/* Quick Gratuity Reference Table */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-teal-700" />
              Quick Comparison at Standard Tip Rates
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-2 font-medium">Rate</th>
                    <th className="pb-2 font-medium">Tip Amount</th>
                    <th className="pb-2 font-medium">Total Bill</th>
                    <th className="pb-2 font-medium">Per Person ({splitCount})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {[10, 15, 18, 20, 22, 25].map((pct) => {
                    const tipVal = billAmount * (pct / 100);
                    const tot = billAmount + tipVal;
                    const isSelected = tipPercent === pct;
                    return (
                      <tr
                        key={pct}
                        className={isSelected ? "bg-teal-50/70 font-bold text-teal-900" : ""}
                      >
                        <td className="py-2.5">{pct}%</td>
                        <td className="py-2.5">{formatMoney(tipVal)}</td>
                        <td className="py-2.5">{formatMoney(tot)}</td>
                        <td className="py-2.5">{formatMoney(tot / splitCount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Etiquette Callout */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">US Tipping Etiquette Baseline</span>
              <p className="leading-relaxed">
                15% represents acceptable standard service, 18%–20% is standard for full-service dine-in restaurants, and 25%+ reflects exceptional hospitality. For large parties (typically 6 or more), always verify whether an automatic gratuity has already been included on your final itemized receipt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
