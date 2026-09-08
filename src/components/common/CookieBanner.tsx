import React, { useState, useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("financehub_cookie_consent");
      if (!consent) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("financehub_cookie_consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("financehub_cookie_consent", "essential_only");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      id="cookie-consent-banner"
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-teal-50 text-teal-700 rounded-xl shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h4 className="text-sm font-bold text-slate-900">Your Privacy & Cookies</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            FinanceHub uses essential cookies and local browser storage to save calculator inputs and improve performance. No financial calculation data is sold or persisted to remote servers.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              id="cookie-accept-btn"
              onClick={handleAccept}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-800 text-white hover:bg-teal-900 transition-colors"
            >
              Accept All
            </button>
            <button
              type="button"
              id="cookie-essential-btn"
              onClick={handleDecline}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Essential Only
            </button>
            <a href="/privacy" className="text-xs text-slate-500 hover:underline ml-auto font-medium">
              Privacy Policy
            </a>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDecline}
          aria-label="Dismiss cookie notice"
          className="text-slate-400 hover:text-slate-700 p-1 -mr-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
