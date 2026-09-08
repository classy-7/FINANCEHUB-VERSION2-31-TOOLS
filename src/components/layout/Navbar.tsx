import React, { useState } from "react";
import { useCurrency, CURRENCIES } from "../../context/CurrencyContext";
import { CurrencyCode } from "../../types";
import { TOOLS_LIST } from "../../data/toolsData";
import {
  Calculator,
  Search,
  ChevronDown,
  Globe,
  Sparkles,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";

interface NavbarProps {
  currentRoute?: string;
  onNavigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute = "/", onNavigate }) => {
  const { currency, setCurrency } = useCurrency();
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = TOOLS_LIST.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToolSelect = (route: string) => {
    onNavigate(route);
    setToolsDropdownOpen(false);
    setMobileMenuOpen(false);
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          id="nav-brand-logo"
          onClick={() => handleToolSelect("/")}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-md shadow-teal-900/10 group-hover:bg-teal-900 transition-colors">
            <Calculator className="w-5 h-5 text-teal-200" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 font-display">
              Finance<span className="text-teal-800">Hub</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200/60">
              2026 Engine
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-semibold text-slate-600">
          <button
            type="button"
            id="nav-all-calculators-btn"
            onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
          >
            All Calculators
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                toolsDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => handleToolSelect("/mortgage-calculator")}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentRoute === "/mortgage-calculator"
                ? "text-teal-800 font-bold bg-teal-50"
                : "hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            Mortgage
          </button>

          <button
            type="button"
            onClick={() => handleToolSelect("/salary-calculator")}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentRoute === "/salary-calculator"
                ? "text-teal-800 font-bold bg-teal-50"
                : "hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            Salary
          </button>

          <button
            type="button"
            onClick={() => handleToolSelect("/retirement-calculator")}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentRoute === "/retirement-calculator"
                ? "text-teal-800 font-bold bg-teal-50"
                : "hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            Retirement
          </button>

          <button
            type="button"
            onClick={() => handleToolSelect("/debt-payoff-planner")}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentRoute === "/debt-payoff-planner"
                ? "text-teal-800 font-bold bg-teal-50"
                : "hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            Debt Payoff
          </button>

          <button
            type="button"
            onClick={() => handleToolSelect("/ai-finance-assistant")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
              currentRoute === "/ai-finance-assistant"
                ? "bg-teal-800 text-white border-teal-800 shadow-sm"
                : "bg-teal-50/70 text-teal-900 border-teal-200 hover:bg-teal-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            AI Assistant
          </button>
        </nav>

        {/* Right Actions: Search + Currency Switcher + Mobile Toggle */}
        <div className="flex items-center gap-2">
          {/* Quick Search Trigger */}
          <button
            type="button"
            id="nav-search-trigger"
            onClick={() => setSearchOpen(true)}
            aria-label="Search financial calculators"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-800 transition-colors text-xs font-medium"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search calculators...</span>
            <kbd className="hidden lg:inline-block text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 font-mono">
              /
            </kbd>
          </button>

          {/* Currency Switcher */}
          <div className="relative">
            <button
              type="button"
              id="currency-selector-btn"
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{currency}</span>
              <span className="text-slate-400 font-mono">({CURRENCIES[currency].symbol})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {currencyDropdownOpen && (
              <div
                id="currency-dropdown-menu"
                className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white p-1.5 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Currency
                </div>
                {(Object.keys(CURRENCIES) as CurrencyCode[]).map((cCode) => (
                  <button
                    key={cCode}
                    type="button"
                    onClick={() => {
                      setCurrency(cCode);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      currency === cCode
                        ? "bg-teal-50 text-teal-900 font-bold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{CURRENCIES[cCode].name}</span>
                    <span className="font-mono font-bold">{CURRENCIES[cCode].symbol} {cCode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            id="mobile-menu-toggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* "All Calculators" Desktop Mega-Menu Dropdown */}
      {toolsDropdownOpen && (
        <div
          id="tools-mega-menu"
          className="hidden md:block absolute top-16 inset-x-0 bg-white border-b border-slate-200 shadow-2xl z-50 p-6 animate-in fade-in duration-150"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                All {TOOLS_LIST.length} Interactive Financial Calculators
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Client-side calculations • No registration needed
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-h-[65vh] overflow-y-auto pr-1">
              {TOOLS_LIST.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.route)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                    currentRoute === tool.route
                      ? "border-teal-700 bg-teal-50/50 shadow-xs"
                      : "border-slate-100 hover:border-slate-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                      {tool.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-700 transition-colors" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-900 line-clamp-1">
                    {tool.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div
          id="search-overlay"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search calculators (mortgage, 401k, snowball, tax...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm font-medium text-slate-900 focus:outline-none placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-50">
              {filteredTools.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No calculators found matching "{searchQuery}".
                </div>
              ) : (
                filteredTools.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToolSelect(t.route)}
                    className="p-3 rounded-xl hover:bg-teal-50/60 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                          {t.name}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {t.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-700 transition-colors shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer-menu"
          className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3"
        >
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">
            Quick Tools
          </div>
          <div className="grid grid-cols-1 gap-1">
            {TOOLS_LIST.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleToolSelect(tool.route)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                  currentRoute === tool.route
                    ? "bg-teal-50 text-teal-900 font-bold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{tool.name}</span>
                <span className="text-[10px] text-slate-400 uppercase">{tool.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
