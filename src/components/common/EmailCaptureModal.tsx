import React, { useState } from "react";
import { Mail, Check, X, ShieldAlert, Sparkles } from "lucide-react";
import { trackEvent } from "../../utils/analytics";

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorTitle?: string;
  keyResultSummary?: string;
  calculationSummary?: string;
}

export const EmailCaptureModal: React.FC<EmailCaptureModalProps> = ({
  isOpen,
  onClose,
  calculatorTitle = "FinanceHub Calculation",
  keyResultSummary,
  calculationSummary,
}) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const displaySummary = keyResultSummary || calculationSummary || "Custom financial breakdown";

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Please provide a valid email address.");
      return;
    }

    setError("");
    setSubmitted(true);
    trackEvent({
      action: "submit_email_capture",
      category: "monetization",
      label: calculatorTitle,
    });

    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setEmail("");
    }, 2500);
  };

  return (
    <div
      id="email-capture-overlay"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Calculations Sent!</h3>
            <p className="text-sm text-slate-600">
              We've dispatched your full summary breakdown for <strong>{calculatorTitle}</strong> to{" "}
              <span className="font-semibold text-slate-800">{email}</span>.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
              <Mail className="w-4 h-4" />
              Save Your Financial Plan
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Email Me These Results</h3>
              <p className="text-xs text-slate-500 mt-1">
                Receive a private, clean PDF and markdown copy of your {calculatorTitle} inputs and outcomes.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700">
              <span className="text-[11px] uppercase font-bold text-slate-400 block mb-0.5">
                Current Calculation Summary:
              </span>
              <span className="font-bold text-teal-900 text-sm">{displaySummary}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="capture-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="capture-email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  required
                />
                {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                id="submit-email-btn"
                className="w-full py-2.5 px-4 rounded-xl bg-teal-800 text-white font-bold text-sm hover:bg-teal-900 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-teal-200" />
                Send My Breakdown Free
              </button>
            </form>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              No spam. We respect your privacy. All financial math is processed safely. Unsubscribe anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
