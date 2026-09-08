import React from "react";
import { BadgeCheck, ArrowRight, Shield, Zap } from "lucide-react";
import { trackEvent } from "../../utils/analytics";

interface LeadGenPartnerCardProps {
  id: string;
  toolType: "mortgage" | "loan";
}

export const LeadGenPartnerCard: React.FC<LeadGenPartnerCardProps> = ({ id, toolType }) => {
  const handleClick = () => {
    trackEvent({
      action: "click_lender_cta",
      category: "monetization",
      label: toolType,
    });
  };

  const isMortgage = toolType === "mortgage";

  return (
    <div
      id={id}
      className="my-6 rounded-xl border-2 border-dashed border-teal-600/40 bg-teal-50/40 p-5 sm:p-6 transition-all hover:border-teal-600 hover:bg-teal-50/70"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-teal-900 bg-teal-200/80 px-2 py-0.5 rounded-md">
              <BadgeCheck className="w-3.5 h-3.5" />
              Verified Lending Network
            </span>
            <span className="text-xs text-slate-500 font-medium">Free, no-obligation comparison</span>
          </div>

          <h4 className="text-base sm:text-lg font-bold text-slate-900">
            {isMortgage
              ? "Compare Today's Lowest Mortgage & Refinance Rates"
              : "Compare Pre-Qualified Loan Offers with Zero Credit Score Impact"}
          </h4>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isMortgage
              ? "See how much you could save each month by shopping multiple institutional and online lenders side by side."
              : "Check rates from top national lenders in under 2 minutes. Borrow from $1,000 to $100,000 with flexible terms."}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-teal-700" /> Secure 256-Bit Encryption
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-600" /> Soft Credit Pull Only
            </span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
          <a
            href="#partner-rates-portal"
            onClick={handleClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-800 text-white font-bold text-sm hover:bg-teal-900 shadow-sm transition-all text-center"
          >
            {isMortgage ? "View Live Mortgage Rates" : "Compare Loan Offers"}
            <ArrowRight className="w-4 h-4" />
          </a>
          <span className="text-[10px] text-center text-slate-400">
            Rates updated daily for 2026
          </span>
        </div>
      </div>
    </div>
  );
};
