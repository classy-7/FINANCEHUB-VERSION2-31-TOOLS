import React, { useState, useMemo, useEffect } from "react";
import { NetWorthInputs, NetWorthSnapshot } from "../../types";
import { calculateNetWorth } from "../../utils/financeMath";
import { useCurrency } from "../../context/CurrencyContext";
import { NumberSliderInput } from "../common/NumberSliderInput";
import { ResultCard } from "../common/ResultCard";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Landmark, TrendingUp, Save, Trash2, Award, ShieldAlert, CheckCircle2 } from "lucide-react";

export const NetWorthCalculator: React.FC = () => {
  const { formatMoney, config } = useCurrency();

  const [age, setAge] = useState<number>(32);

  // Assets
  const [cashAndChecking, setCashAndChecking] = useState<number>(12000);
  const [emergencySavings, setEmergencySavings] = useState<number>(20000);
  const [taxableInvestments, setTaxableInvestments] = useState<number>(35000);
  const [retirementAccounts, setRetirementAccounts] = useState<number>(78000);
  const [primaryRealEstate, setPrimaryRealEstate] = useState<number>(350000);
  const [vehicles, setVehicles] = useState<number>(22000);
  const [otherAssets, setOtherAssets] = useState<number>(5000);

  // Liabilities
  const [mortgageBalance, setMortgageBalance] = useState<number>(270000);
  const [autoLoans, setAutoLoans] = useState<number>(14000);
  const [studentLoans, setStudentLoans] = useState<number>(18000);
  const [creditCardDebt, setCreditCardDebt] = useState<number>(2500);
  const [otherPersonalDebt, setOtherPersonalDebt] = useState<number>(0);

  // Snapshots stored in localStorage
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem("financehub_networth_snapshots");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const inputs: NetWorthInputs = useMemo(
    () => ({
      age,
      assets: {
        cashAndChecking,
        emergencySavings,
        taxableInvestments,
        retirementAccounts,
        primaryRealEstate,
        vehicles,
        otherAssets,
      },
      liabilities: {
        mortgageBalance,
        autoLoans,
        studentLoans,
        creditCardDebt,
        otherPersonalDebt,
      },
    }),
    [
      age,
      cashAndChecking,
      emergencySavings,
      taxableInvestments,
      retirementAccounts,
      primaryRealEstate,
      vehicles,
      otherAssets,
      mortgageBalance,
      autoLoans,
      studentLoans,
      creditCardDebt,
      otherPersonalDebt,
    ]
  );

  const results = useMemo(() => calculateNetWorth(inputs), [inputs]);

  const handleSaveSnapshot = () => {
    const newSnapshot: NetWorthSnapshot = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      totalNetWorth: results.netWorth,
      totalAssets: results.totalAssets,
      totalLiabilities: results.totalLiabilities,
    };
    const updated = [newSnapshot, ...snapshots.slice(0, 9)];
    setSnapshots(updated);
    try {
      localStorage.setItem("financehub_networth_snapshots", JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteSnapshot = (id: string) => {
    const updated = snapshots.filter((s) => s.id !== id);
    setSnapshots(updated);
    try {
      localStorage.setItem("financehub_networth_snapshots", JSON.stringify(updated));
    } catch {}
  };

  return (
    <div id="net-worth-calculator-tool" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Assets & Liabilities Inputs */}
        <div className="lg:col-span-5 space-y-5">
          {/* Age Selector */}
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <NumberSliderInput
              id="nw-age"
              label="Your Current Age"
              value={age}
              onChange={setAge}
              min={18}
              max={85}
              step={1}
              suffix=" yrs"
              tooltip="Used to benchmark your net worth against Federal Reserve demographic survey data."
            />
          </div>

          {/* Assets Section */}
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" />
                Assets (What You Own)
              </h3>
              <span className="text-xs font-bold text-teal-900">{formatMoney(results.totalAssets)}</span>
            </div>

            <NumberSliderInput
              id="nw-asset-cash"
              label="Cash & Checking"
              value={cashAndChecking}
              onChange={setCashAndChecking}
              min={0}
              max={100000}
              step={1000}
              prefix={config.symbol}
            />
            <NumberSliderInput
              id="nw-asset-emergency"
              label="Emergency Savings / HYSA"
              value={emergencySavings}
              onChange={setEmergencySavings}
              min={0}
              max={150000}
              step={1000}
              prefix={config.symbol}
            />
            <NumberSliderInput
              id="nw-asset-brokerage"
              label="Taxable Brokerage / Stocks"
              value={taxableInvestments}
              onChange={setTaxableInvestments}
              min={0}
              max={500000}
              step={2500}
              prefix={config.symbol}
            />
            <NumberSliderInput
              id="nw-asset-retirement"
              label="Retirement (401k, IRA, HSA)"
              value={retirementAccounts}
              onChange={setRetirementAccounts}
              min={0}
              max={1000000}
              step={5000}
              prefix={config.symbol}
            />
            <NumberSliderInput
              id="nw-asset-real-estate"
              label="Primary Real Estate Value"
              value={primaryRealEstate}
              onChange={setPrimaryRealEstate}
              min={0}
              max={1500000}
              step={10000}
              prefix={config.symbol}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberSliderInput
                id="nw-asset-vehicles"
                label="Vehicles Market Value"
                value={vehicles}
                onChange={setVehicles}
                min={0}
                max={150000}
                step={1000}
                prefix={config.symbol}
              />
              <NumberSliderInput
                id="nw-asset-other"
                label="Other Personal Assets"
                value={otherAssets}
                onChange={setOtherAssets}
                min={0}
                max={100000}
                step={1000}
                prefix={config.symbol}
              />
            </div>
          </div>

          {/* Liabilities Section */}
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Liabilities (What You Owe)
              </h3>
              <span className="text-xs font-bold text-rose-800">{formatMoney(results.totalLiabilities)}</span>
            </div>

            <NumberSliderInput
              id="nw-liab-mortgage"
              label="Primary Mortgage Balance"
              value={mortgageBalance}
              onChange={setMortgageBalance}
              min={0}
              max={1200000}
              step={5000}
              prefix={config.symbol}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberSliderInput
                id="nw-liab-auto"
                label="Auto Loans Balance"
                value={autoLoans}
                onChange={setAutoLoans}
                min={0}
                max={100000}
                step={1000}
                prefix={config.symbol}
              />
              <NumberSliderInput
                id="nw-liab-student"
                label="Student Loans"
                value={studentLoans}
                onChange={setStudentLoans}
                min={0}
                max={200000}
                step={1000}
                prefix={config.symbol}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberSliderInput
                id="nw-liab-cc"
                label="Credit Card Debt"
                value={creditCardDebt}
                onChange={setCreditCardDebt}
                min={0}
                max={50000}
                step={500}
                prefix={config.symbol}
              />
              <NumberSliderInput
                id="nw-liab-other"
                label="Other Personal Debt"
                value={otherPersonalDebt}
                onChange={setOtherPersonalDebt}
                min={0}
                max={100000}
                step={1000}
                prefix={config.symbol}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Key Results, Benchmark & Visualizations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Result Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              id="result-net-worth"
              title="Total Net Worth"
              value={formatMoney(results.netWorth)}
              subtitle={`Assets: ${formatMoney(results.totalAssets)} | Liabilities: ${formatMoney(results.totalLiabilities)}`}
              highlight={true}
              badge={{
                text: results.netWorth >= 0 ? "Positive Equity" : "Negative Net Worth",
                variant: results.netWorth >= 0 ? "positive" : "warning",
              }}
            />

            <ResultCard
              id="result-benchmark-tier"
              title={`Peer Age Benchmark (${results.ageGroupBenchmark.bracket})`}
              value={`~Top ${100 - results.ageGroupBenchmark.percentileEstimate}%`}
              subtitle={`Median: ${formatMoney(results.ageGroupBenchmark.median)} | Average: ${formatMoney(results.ageGroupBenchmark.average)}`}
              highlight={false}
              badge={{
                text: "Fed SCF Survey",
                variant: "info",
              }}
            />
          </div>

          {/* Benchmark Explanation Box */}
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 flex items-start gap-3.5">
            <Award className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                Demographic Standing for Age {age} ({results.ageGroupBenchmark.bracket})
              </p>
              <p className="text-xs mt-1 leading-relaxed">
                Based on the Federal Reserve Survey of Consumer Finances, median net worth for households in your age
                bracket is <strong>{formatMoney(results.ageGroupBenchmark.median)}</strong>, with an average of{" "}
                <strong>{formatMoney(results.ageGroupBenchmark.average)}</strong>. Your current net worth places you
                around the <strong>{results.ageGroupBenchmark.percentileEstimate}th percentile</strong>.
              </p>
            </div>
          </div>

          {/* Asset Allocation Donut Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-700" />
              Asset Distribution Breakdown
            </h3>
            <div className="h-60 w-full flex items-center justify-center">
              {results.assetBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={results.assetBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {results.assetBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatMoney(Number(val)), ""]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "0.75rem",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400">Enter your assets to view allocation breakdown.</p>
              )}
            </div>
          </div>

          {/* Snapshot History Tracker */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Save className="w-4 h-4 text-teal-700" />
                  Save Snapshot & Track Progress
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Privately saved in your browser storage.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveSnapshot}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                Save Snapshot
              </button>
            </div>

            {snapshots.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {snapshots.map((s) => (
                  <div key={s.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block">{s.date}</span>
                      <span className="text-[11px] text-slate-500">
                        Assets: {formatMoney(s.totalAssets)} | Liab: {formatMoney(s.totalLiabilities)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-teal-900 text-sm">{formatMoney(s.totalNetWorth)}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSnapshot(s.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete snapshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No snapshots saved yet. Click "Save Snapshot" above to log your current milestone.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
