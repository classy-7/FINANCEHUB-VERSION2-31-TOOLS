import React from "react";
import { TOOLS_LIST } from "../../data/toolsData";
import { ShieldAlert, Calculator, Sparkles } from "lucide-react";

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compliance Financial Disclaimer Banner */}
        <div className="mb-12 p-4 sm:p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3.5">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <span className="font-bold text-white block">Important Financial & Legal Disclaimer:</span>
            FinanceHub calculators and tools are designed exclusively for self-directed educational, illustrative, and informational purposes. Results, projections, and estimations provided by our engines (including Federal and State tax estimates, loan amortization figures, investment forecasts, and AI financial guidance) do not constitute certified legal, tax, accounting, or professional financial advice. Actual loan terms, taxes, and investment returns will vary based on personal circumstances, underwriting guidelines, and regulatory changes. Always consult a qualified Certified Financial Planner (CFP), CPA, or licensed attorney before making significant financial commitments.
          </div>
        </div>

        {/* Multi-column navigation links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2 lg:col-span-2 space-y-3">
            <div
              onClick={() => onNavigate("/")}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                <Calculator className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Finance<span className="text-teal-400">Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The high-precision financial suite powering 31 consumer tools: mortgage refinancing, rental property ROI, 401(k) employer match, Roth conversion, HSA health wealth, take-home paychecks, and AI financial guidance. All mathematical calculations run 100% client-side.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Tax Engine & Market Formulas: Active for 2026</span>
            </div>
          </div>

          {/* Borrowing & Real Estate */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Borrowing & Property
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/mortgage-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Mortgage Calculator
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/refinance-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Mortgage Refinance
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/rental-property-roi-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Rental Property ROI & Cap Rate
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/lease-vs-buy-car-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Car Lease vs. Buy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/rent-vs-buy-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Rent vs. Buy Calculator
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/home-affordability-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Home Affordability
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/credit-card-payoff-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Credit Card Payoff
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/debt-payoff-planner")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Debt Snowball vs Avalanche
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/student-loan-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Student Loan Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Retirement, Investing & Wealth */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Retirement & Investing
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/401k-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  401(k) & Employer Match
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/roth-vs-traditional-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Roth vs. Traditional IRA
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/social-security-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Social Security Estimator
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/retirement-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Retirement Nest Egg
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/investment-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Compound Growth Planner
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/dividend-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Dividend DRIP Snowball
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/fire-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  FIRE Early Retirement
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/life-insurance-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Life Insurance (DIME)
                </button>
              </li>
            </ul>
          </div>

          {/* Taxes, Savings & Everyday */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Tax, Savings & Everyday
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/salary-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Salary / Take-Home Pay
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/hsa-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  HSA Healthcare Wealth
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/529-college-savings-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  529 College Savings
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/tip-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Tip & Bill Splitter
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/self-employment-tax-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  1099 Self-Employment Tax
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/tax-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  2026 Income Tax Estimator
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/net-worth-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Net Worth Tracker
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/savings-goal-calculator")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Savings Goal Planner
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/currency-converter")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Live Currency Converter
                </button>
              </li>
            </ul>
          </div>

          {/* Assistant & Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Company & AI
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/ai-finance-assistant")}
                  className="flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-semibold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Finance Assistant
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/about")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  About FinanceHub
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/privacy")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/terms")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("/disclaimer")}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Disclaimer
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Subfooter */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FinanceHub. All rights reserved. Fast, private, accessible financial tools.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer" onClick={() => onNavigate("/privacy")}>Privacy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer" onClick={() => onNavigate("/terms")}>Terms</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer" onClick={() => onNavigate("/disclaimer")}>Disclosures</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
