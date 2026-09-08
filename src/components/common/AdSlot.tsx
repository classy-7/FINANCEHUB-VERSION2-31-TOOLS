import React, { useState } from "react";
import { Sparkles, ArrowUpRight, ShieldCheck, X } from "lucide-react";

export type AdSlotType = "top-banner" | "in-content" | "sidebar-skyscraper" | "bottom-article" | "sticky-mobile-footer";

interface AdSlotProps {
  id: string;
  type: AdSlotType;
  className?: string;
  fallbackSponsorName?: string;
  fallbackTitle?: string;
  fallbackDesc?: string;
  fallbackCtaText?: string;
  fallbackUrl?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  id,
  type,
  className = "",
  fallbackSponsorName = "FinanceHub Partner",
  fallbackTitle = "High-Yield Savings & Low-Rate Loans",
  fallbackDesc = "Compare verified rates up to 5.25% APY and refinance existing debt today.",
  fallbackCtaText = "Compare Rates",
  fallbackUrl = "#affiliate-rates",
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (type === "top-banner") {
    return (
      <div
        id={id}
        data-ad-slot="top-banner"
        className={`w-full flex items-center justify-center my-4 overflow-hidden rounded-xl border border-slate-200/80 bg-linear-to-r from-slate-50 via-teal-50/40 to-slate-50 min-h-[50px] sm:min-h-[90px] ${className}`}
      >
        <div className="w-full max-w-[728px] py-2 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-600">
              Sponsor
            </span>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">{fallbackTitle}</p>
              <p className="text-[11px] text-slate-500 hidden sm:block line-clamp-1">{fallbackDesc}</p>
            </div>
          </div>
          <a
            href={fallbackUrl}
            className="shrink-0 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-800 text-white hover:bg-teal-900 transition-colors shadow-xs"
          >
            {fallbackCtaText}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  if (type === "in-content") {
    return (
      <div
        id={id}
        data-ad-slot="in-content"
        className={`w-full min-h-[250px] my-6 rounded-xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between shadow-xs ${className}`}
      >
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
          <span>{fallbackSponsorName}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Sponsored Notice</span>
        </div>
        <div className="my-auto py-3">
          <div className="inline-flex p-2 bg-teal-50 text-teal-700 rounded-lg mb-2.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-slate-900">{fallbackTitle}</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{fallbackDesc}</p>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">FDIC-Insured Partners</span>
          <a
            href={fallbackUrl}
            className="flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-950 font-semibold"
          >
            {fallbackCtaText} &rarr;
          </a>
        </div>
      </div>
    );
  }

  if (type === "sidebar-skyscraper") {
    return (
      <aside
        id={id}
        data-ad-slot="sidebar-skyscraper"
        className={`hidden lg:block w-[300px] shrink-0 sticky top-24 min-h-[600px] rounded-xl border border-slate-200/80 bg-linear-to-b from-slate-50 via-white to-slate-50 p-6 flex flex-col justify-between shadow-xs ${className}`}
      >
        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest pb-3 border-b border-slate-200/60">
            <span>Featured Partner</span>
            <span>Ad</span>
          </div>

          <div className="pt-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-teal-800 text-teal-100 rounded-2xl flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-teal-300" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 leading-snug">
              Compare Lending Rates in Real Time
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Find top-tier personal loan rates starting from 5.99% APR or check mortgage refinance options with zero impact to your credit score.
            </p>
          </div>

          <div className="mt-8 space-y-2 bg-white rounded-lg p-3 border border-slate-200 text-xs">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Average Savings:</span>
              <span className="text-emerald-700 font-bold">$2,840/yr</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Credit Check:</span>
              <span className="text-slate-700 font-medium">Soft Pull Only</span>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <a
            href={fallbackUrl}
            className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 transition-all shadow-md"
          >
            Check My Rates Now
            <ArrowUpRight className="w-4 h-4" />
          </a>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            No obligation. Licensed nationwide.
          </p>
        </div>
      </aside>
    );
  }

  if (type === "bottom-article") {
    return (
      <div
        id={id}
        data-ad-slot="bottom-article"
        className={`w-full min-h-[140px] my-8 rounded-xl border border-teal-200/70 bg-linear-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-6 shadow-md ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-300">
              Financial Opportunity
            </span>
            <h4 className="text-lg font-bold text-white">Optimize Your Monthly Interest & Debt</h4>
            <p className="text-xs text-teal-100/80 max-w-xl">
              Consolidate high-interest credit card balances into a single fixed monthly installment and save thousands in finance charges.
            </p>
          </div>
          <a
            href={fallbackUrl}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 transition-colors shadow-sm self-start sm:self-auto"
          >
            Explore Options
            <ArrowUpRight className="w-4 h-4 text-teal-900" />
          </a>
        </div>
      </div>
    );
  }

  if (type === "sticky-mobile-footer") {
    return (
      <div
        id={id}
        data-ad-slot="sticky-mobile-footer"
        className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-slate-900/95 backdrop-blur-xs text-white border-t border-slate-800 px-3 py-2 flex items-center justify-between gap-2 shadow-2xl"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-[9px] font-bold uppercase bg-teal-700 px-1.5 py-0.5 rounded text-white">
            Partner
          </span>
          <span className="text-xs font-semibold truncate text-slate-200">
            Compare Top 2026 Savings & Loan Rates
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={fallbackUrl}
            className="text-[11px] font-bold px-2.5 py-1 bg-teal-600 text-white rounded-md"
          >
            View
          </a>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
