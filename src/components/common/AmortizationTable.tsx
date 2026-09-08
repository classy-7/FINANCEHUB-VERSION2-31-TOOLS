import React, { useState } from "react";
import { AmortizationRow } from "../../types";
import { useCurrency } from "../../context/CurrencyContext";
import { Download, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { trackEvent } from "../../utils/analytics";

interface AmortizationTableProps {
  id: string;
  schedule: AmortizationRow[];
  yearlySchedule?: {
    year: number;
    principalPaid: number;
    interestPaid: number;
    endingBalance: number;
  }[];
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  id,
  schedule,
  yearlySchedule,
}) => {
  const { formatMoney } = useCurrency();
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">(yearlySchedule ? "yearly" : "monthly");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [copied, setCopied] = useState(false);

  const totalMonthlyPages = Math.ceil(schedule.length / pageSize);
  const currentMonthlyRows = schedule.slice((page - 1) * pageSize, page * pageSize);

  const handleCopy = () => {
    let text = "";
    if (viewMode === "yearly" && yearlySchedule) {
      text = "Year\tPrincipal Paid\tInterest Paid\tEnding Balance\n" +
        yearlySchedule.map(r => `${r.year}\t${r.principalPaid.toFixed(2)}\t${r.interestPaid.toFixed(2)}\t${r.endingBalance.toFixed(2)}`).join("\n");
    } else {
      text = "Month\tPayment\tPrincipal\tInterest\tBalance\n" +
        schedule.map(r => `${r.month}\t${r.payment.toFixed(2)}\t${r.principal.toFixed(2)}\t${r.interest.toFixed(2)}\t${r.remainingBalance.toFixed(2)}`).join("\n");
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackEvent({ action: "copy_table", category: "export", label: id });
  };

  const handleDownloadCsv = () => {
    let csv = "";
    if (viewMode === "yearly" && yearlySchedule) {
      csv = "Year,Principal Paid,Interest Paid,Ending Balance\n" +
        yearlySchedule.map(r => `${r.year},${r.principalPaid.toFixed(2)},${r.interestPaid.toFixed(2)},${r.endingBalance.toFixed(2)}`).join("\n");
    } else {
      csv = "Month,Year,Payment,Principal,Interest,Remaining Balance,Total Interest\n" +
        schedule.map(r => `${r.month},${r.year},${r.payment.toFixed(2)},${r.principal.toFixed(2)},${r.interest.toFixed(2)},${r.remainingBalance.toFixed(2)},${r.totalInterestPaid.toFixed(2)}`).join("\n");
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `amortization-schedule-${viewMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    trackEvent({ action: "download_csv", category: "export", label: id });
  };

  return (
    <div id={id} className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-slate-800 text-base">Amortization Schedule</h3>
          {yearlySchedule && yearlySchedule.length > 0 && (
            <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                id={`${id}-tab-yearly`}
                onClick={() => setViewMode("yearly")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === "yearly" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Annual Summary
              </button>
              <button
                type="button"
                id={`${id}-tab-monthly`}
                onClick={() => setViewMode("monthly")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === "monthly" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly Breakdown
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id={`${id}-copy-btn`}
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            type="button"
            id={`${id}-csv-btn`}
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100/70 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            CSV
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              {viewMode === "yearly" ? (
                <>
                  <th className="py-2.5 px-4 sm:px-6">Year</th>
                  <th className="py-2.5 px-4 text-right">Principal Paid</th>
                  <th className="py-2.5 px-4 text-right">Interest Paid</th>
                  <th className="py-2.5 px-4 sm:px-6 text-right">Ending Balance</th>
                </>
              ) : (
                <>
                  <th className="py-2.5 px-4 sm:px-6">Month</th>
                  <th className="py-2.5 px-4 text-right">Payment</th>
                  <th className="py-2.5 px-4 text-right">Principal</th>
                  <th className="py-2.5 px-4 text-right">Interest</th>
                  <th className="py-2.5 px-4 sm:px-6 text-right">Balance</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700 tabular-nums">
            {viewMode === "yearly" && yearlySchedule ? (
              yearlySchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-4 sm:px-6 font-semibold text-slate-900">Year {row.year}</td>
                  <td className="py-2 px-4 text-right text-emerald-700">{formatMoney(row.principalPaid)}</td>
                  <td className="py-2 px-4 text-right text-amber-700">{formatMoney(row.interestPaid)}</td>
                  <td className="py-2 px-4 sm:px-6 text-right font-semibold text-slate-900">
                    {formatMoney(row.endingBalance)}
                  </td>
                </tr>
              ))
            ) : (
              currentMonthlyRows.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-4 sm:px-6 font-semibold text-slate-900">M{row.month} (Yr {row.year})</td>
                  <td className="py-2 px-4 text-right">{formatMoney(row.payment)}</td>
                  <td className="py-2 px-4 text-right text-emerald-700">{formatMoney(row.principal)}</td>
                  <td className="py-2 px-4 text-right text-amber-700">{formatMoney(row.interest)}</td>
                  <td className="py-2 px-4 sm:px-6 text-right font-semibold text-slate-900">
                    {formatMoney(row.remainingBalance)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination for monthly view */}
      {viewMode === "monthly" && totalMonthlyPages > 1 && (
        <div className="p-3 sm:px-6 flex items-center justify-between border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600 font-medium">
          <span>
            Showing months {(page - 1) * pageSize + 1}–{Math.min(schedule.length, page * pageSize)} of {schedule.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              id={`${id}-prev-page`}
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1 rounded border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold">
              Page {page} of {totalMonthlyPages}
            </span>
            <button
              type="button"
              id={`${id}-next-page`}
              disabled={page >= totalMonthlyPages}
              onClick={() => setPage(page + 1)}
              className="p-1 rounded border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
