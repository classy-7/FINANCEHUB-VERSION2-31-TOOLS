import React from "react";
import { ShieldCheck, Calculator, Cpu, Sparkles } from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Company & Mission</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">About FinanceHub</h1>
        <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
          FinanceHub was created with a straightforward mission: deliver the fastest, most reliable, and 100% private financial calculators on the web.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Client-Side First</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your financial figures belong to you. Our calculators execute all amortization, compound interest, and tax formulas right inside your browser. No financial data leaves your device.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">2026 Engine Rules</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We continuously verify our tax tables against updated IRS brackets, Social Security wage base caps ($176,100), and state income tax updates across all 50 states.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Modern Fintech Design</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspired by world-class fintech interfaces, FinanceHub avoids cluttered ad walls or slow legacy code, focusing on clarity, typography, and mathematical precision.
          </p>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900 font-display">Privacy Policy</h1>
      <p className="text-xs text-slate-400 font-semibold">Effective Date: January 1, 2026</p>

      <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 space-y-4">
        <h3 className="text-base font-bold text-slate-900">1. Client-Side Financial Calculation Privacy</h3>
        <p>
          FinanceHub does not collect, record, or store the specific financial figures you input into our calculators (including mortgage amounts, loan balances, salary figures, and investment balances). All arithmetic computations execute locally in your web browser.
        </p>

        <h3 className="text-base font-bold text-slate-900">2. Cookies and Local Storage</h3>
        <p>
          We use browser local storage solely to retain your selected display currency (e.g. USD, EUR, GBP, INR) and cookie preferences across sessions. You can clear this anytime through your browser settings.
        </p>

        <h3 className="text-base font-bold text-slate-900">3. AI Assistant Queries</h3>
        <p>
          If you interact with the optional AI Finance Assistant, your natural language prompts are transmitted over secure TLS to our serverless endpoint to generate responses. We do not link these prompts to personally identifiable accounts.
        </p>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900 font-display">Terms of Service</h1>
      <p className="text-xs text-slate-400 font-semibold">Last Updated: 2026</p>

      <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 space-y-4">
        <h3 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h3>
        <p>
          By accessing and utilizing FinanceHub, you agree to these Terms of Service. If you do not agree with any portion of these terms, please discontinue use of the tools immediately.
        </p>

        <h3 className="text-base font-bold text-slate-900">2. Educational & Informational Purpose Only</h3>
        <p>
          All tools, calculators, content, and AI interactions on FinanceHub are provided solely for personal educational and informational estimation. FinanceHub is not a registered investment advisor, broker-dealer, mortgage lender, or certified public accountant.
        </p>

        <h3 className="text-base font-bold text-slate-900">3. Limitation of Liability</h3>
        <p>
          In no event shall FinanceHub or its operators be liable for any direct, indirect, incidental, or consequential damages resulting from the use of, or inability to use, our calculations, formulas, or third-party partner offers.
        </p>
      </div>
    </div>
  );
};

export const DisclaimerPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900 font-display">Legal & Financial Disclaimer</h1>
      <p className="text-xs text-slate-400 font-semibold">Mandatory Regulatory Notice</p>

      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-sm leading-relaxed space-y-3">
        <h3 className="font-bold text-base text-amber-900">Not Financial, Legal, or Tax Advice</h3>
        <p>
          The information, formulas, and estimates presented on FinanceHub do not constitute financial advice, investment advice, tax advice, or legal advice. The calculations are approximations based on standard mathematical formulas and statutory tax laws active for the 2026 calendar year.
        </p>
        <p>
          Actual loan terms, mortgage approvals, interest payments, tax obligations, and investment returns will depend on individual underwriting, market fluctuations, credit history, and changing regulatory conditions.
        </p>
        <p className="font-bold text-amber-900">
          Always seek the guidance of a qualified Certified Financial Planner (CFP®), CPA, or licensed attorney before entering into any loan, real estate transaction, retirement plan, or tax filing.
        </p>
      </div>
    </div>
  );
};
