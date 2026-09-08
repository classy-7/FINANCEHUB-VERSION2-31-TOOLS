import React, { useState } from "react";
import { TOOLS_LIST } from "../data/toolsData";
import { AdSlot } from "../components/common/AdSlot";
import {
  Calculator,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Home,
  DollarSign,
  PiggyBank,
  CreditCard,
  PieChart,
  FileText,
  Flame,
  Bot,
  Clock,
  Landmark,
  Target,
  GraduationCap,
  Briefcase,
  Utensils,
  Car,
  Building,
  Scale,
  HeartPulse,
} from "lucide-react";

interface HomePageProps {
  onNavigate: (route: string) => void;
}

const CATEGORY_TABS = [
  { id: "all", label: `All ${TOOLS_LIST.length} Tools` },
  { id: "borrowing", label: "Borrowing & Debt" },
  { id: "real_estate", label: "Real Estate & Housing" },
  { id: "investing", label: "Investing & Retirement" },
  { id: "income", label: "Income & Paycheck" },
  { id: "savings", label: "Savings, 529 & HSA" },
  { id: "wealth", label: "Wealth, Insurance & FX" },
  { id: "everyday", label: "Everyday Utilities" },
  { id: "taxes", label: "Taxes" },
  { id: "budgeting", label: "Budgeting" },
  { id: "ai", label: "AI Guidance" },
];

const ICONS_MAP: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5 text-teal-700" />,
  DollarSign: <DollarSign className="w-5 h-5 text-teal-700" />,
  PiggyBank: <PiggyBank className="w-5 h-5 text-teal-700" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-teal-700" />,
  TrendingDown: <TrendingDown className="w-5 h-5 text-teal-700" />,
  CreditCard: <CreditCard className="w-5 h-5 text-teal-700" />,
  ShieldAlert: <Zap className="w-5 h-5 text-teal-700" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-teal-700" />,
  PieChart: <PieChart className="w-5 h-5 text-teal-700" />,
  FileText: <FileText className="w-5 h-5 text-teal-700" />,
  Flame: <Flame className="w-5 h-5 text-teal-700" />,
  Bot: <Bot className="w-5 h-5 text-teal-700" />,
  Clock: <Clock className="w-5 h-5 text-teal-700" />,
  Landmark: <Landmark className="w-5 h-5 text-teal-700" />,
  Target: <Target className="w-5 h-5 text-teal-700" />,
  GraduationCap: <GraduationCap className="w-5 h-5 text-teal-700" />,
  Briefcase: <Briefcase className="w-5 h-5 text-teal-700" />,
  Globe: <Globe className="w-5 h-5 text-teal-700" />,
  Utensils: <Utensils className="w-5 h-5 text-teal-700" />,
  Car: <Car className="w-5 h-5 text-teal-700" />,
  Building: <Building className="w-5 h-5 text-teal-700" />,
  Scale: <Scale className="w-5 h-5 text-teal-700" />,
  HeartPulse: <HeartPulse className="w-5 h-5 text-teal-700" />,
};

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = TOOLS_LIST.filter((tool) => {
    const matchesCat = activeCategory === "all" || tool.category === activeCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div id="home-page" className="w-full bg-slate-50/50 min-h-screen pb-20">
      {/* Top Banner Ad Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <AdSlot id="home-top-banner" type="top-banner" />
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-teal-700" />
          <span>Updated for 2026 Federal & State Tax Rules</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display max-w-3xl mx-auto">
          Clear, High-Precision Financial Calculators
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Comprehensive suite of 31 interactive financial planning tools built for accuracy, speed, and privacy. From home mortgage refinancing and 401(k) match optimization to rental property ROI, 2026 take-home pay, debt snowball, and Social Security analysis.
        </p>

        {/* Feature Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-teal-700" /> 100% Client-Side Private
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-amber-600" /> Instant Real-Time Math
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
            <Globe className="w-3.5 h-3.5 text-sky-600" /> Multi-Currency Support
          </span>
        </div>

        {/* Search Input */}
        <div className="mt-8 max-w-xl mx-auto relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search calculators (e.g., mortgage, 401k, snowball, loan emi, fire)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3.5 pl-12 pr-4 text-sm rounded-2xl border border-slate-300 bg-white text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-all font-medium"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
                activeCategory === tab.id
                  ? "bg-teal-800 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {activeCategory === "all" ? "All Financial Tools" : `${CATEGORY_TABS.find(t => t.id === activeCategory)?.label}`}
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredTools.length} of {TOOLS_LIST.length} tools
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onNavigate(tool.route)}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md hover:border-teal-600 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {ICONS_MAP[tool.iconName] || <Calculator className="w-5 h-5 text-teal-700" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {tool.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">
                  Key: <span className="text-slate-700">{tool.primaryMetricLabel}</span>
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-teal-800 group-hover:translate-x-0.5 transition-transform">
                  Launch &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mid-Page Featured Ad */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <AdSlot id="home-in-content-banner" type="in-content" />
      </div>

      {/* Popular Scenarios & Financial Guides */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 mb-2">High-Intent Financial Questions Answered</h3>
          <p className="text-xs text-slate-500 mb-6 max-w-xl">
            Directly test these common scenarios with pre-configured parameters on FinanceHub:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div
              onClick={() => onNavigate("/mortgage-calculator?price=450000&downPct=20&rate=6.5&extra=200")}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-teal-50/50 hover:border-teal-600 cursor-pointer transition-colors"
            >
              <h4 className="font-bold text-slate-900 mb-1">Mortgage Extra Payment</h4>
              <p className="text-slate-500">
                See how paying an extra $200/mo on a $450k home shaves 5+ years off your loan and saves over $60k in interest.
              </p>
            </div>

            <div
              onClick={() => onNavigate("/debt-payoff-planner")}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-teal-50/50 hover:border-teal-600 cursor-pointer transition-colors"
            >
              <h4 className="font-bold text-slate-900 mb-1">Snowball vs. Avalanche</h4>
              <p className="text-slate-500">
                Compare whether knocking out small balances first (Snowball) or high APR cards first (Avalanche) saves more cash.
              </p>
            </div>

            <div
              onClick={() => onNavigate("/fire-calculator")}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-teal-50/50 hover:border-teal-600 cursor-pointer transition-colors"
            >
              <h4 className="font-bold text-slate-900 mb-1">Coast FIRE Calculator</h4>
              <p className="text-slate-500">
                Discover if your current portfolio has already reached the point where compound growth will fund traditional retirement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
