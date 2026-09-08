import React, { useState, useEffect } from "react";
import { ToolMeta, EducationalContent } from "../../types";
import { TOOLS_LIST, getEducationalContent } from "../../data/toolsData";
import { AdSlot } from "../common/AdSlot";
import { LeadGenPartnerCard } from "../common/LeadGenPartnerCard";
import { EmailCaptureModal } from "../common/EmailCaptureModal";
import {
  Share2,
  Copy,
  Check,
  Mail,
  ChevronRight,
  HelpCircle,
  Sparkles,
  ChevronDown,
  FileDown,
} from "lucide-react";
import { trackEvent } from "../../utils/analytics";
import { getShareableUrl } from "../../utils/urlState";

interface CalculatorLayoutProps {
  toolMeta?: ToolMeta;
  tool?: ToolMeta;
  educationalContent?: EducationalContent;
  primaryResultDisplay?: string;
  primaryResultLabel?: string;
  inputsComponent?: React.ReactNode;
  resultsComponent?: React.ReactNode;
  chartComponent?: React.ReactNode;
  tablesComponent?: React.ReactNode;
  summaryTextForCopy?: string;
  onNavigate: (route: string) => void;
  onOpenEmailModal?: (summary?: string) => void;
  children?: React.ReactNode;
}

export const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
  toolMeta: propToolMeta,
  tool,
  educationalContent: propEduContent,
  primaryResultDisplay,
  primaryResultLabel,
  inputsComponent,
  resultsComponent,
  chartComponent,
  tablesComponent,
  summaryTextForCopy = "",
  onNavigate,
  onOpenEmailModal,
  children,
}) => {
  const toolMeta: ToolMeta = propToolMeta || tool || TOOLS_LIST[0];
  const educationalContent: EducationalContent =
    propEduContent ||
    (toolMeta?.id ? getEducationalContent(toolMeta.id) : undefined) || {
      h1: toolMeta?.name || "Financial Calculator",
      intro: toolMeta?.description || "High-precision financial planning calculator.",
      howItWorks: "Calculates precise financial outcomes based on your parameters and standard financial arithmetic.",
      formulaDescription: "Standard compound interest, amortization, and tax allocation formulas.",
      workedExample: "Enter your figures above to see real-time recalculations and visual projections.",
      faqs: [],
      relatedToolRoutes: ["/mortgage-calculator", "/salary-calculator", "/retirement-calculator"],
    };

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Set document title and meta description dynamically
  useEffect(() => {
    if (!toolMeta) return;
    document.title = toolMeta.metaTitle || `${toolMeta.name} | FinanceHub`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && toolMeta.metaDescription) {
      metaDesc.setAttribute("content", toolMeta.metaDescription);
    }

    // Inject FAQPage Schema
    if (toolMeta.id && educationalContent?.faqs?.length) {
      const scriptId = `faq-schema-${toolMeta.id}`;
      let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = scriptId;
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: educationalContent.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      };
      scriptTag.textContent = JSON.stringify(schema);

      return () => {
        const el = document.getElementById(scriptId);
        if (el) el.remove();
      };
    }
  }, [toolMeta, educationalContent]);

  const handleCopyLink = () => {
    const url = getShareableUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    trackEvent({ action: "copy_share_url", category: "share", label: toolMeta.id });
  };

  const handleCopySummary = () => {
    const label = primaryResultLabel || toolMeta.primaryMetricLabel || "Result";
    const textToCopy =
      summaryTextForCopy ||
      (primaryResultDisplay
        ? `${toolMeta.name}: ${label} = ${primaryResultDisplay}\nCalculated with FinanceHub: ${window.location.href}`
        : `${toolMeta.name} - Free Financial Calculation Tool\nExplore at: ${window.location.href}`);
    navigator.clipboard.writeText(textToCopy);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
    trackEvent({ action: "copy_results_text", category: "share", label: toolMeta.id });
  };

  const handlePrint = () => {
    trackEvent({ action: "print_pdf", category: "export", label: toolMeta.id });
    window.print();
  };

  const handleEmailResults = () => {
    const summary = primaryResultDisplay
      ? `${toolMeta.name}: ${primaryResultLabel || toolMeta.primaryMetricLabel} = ${primaryResultDisplay}`
      : `${toolMeta.name} Calculation Results`;

    if (onOpenEmailModal) {
      onOpenEmailModal(summary);
    } else {
      setEmailModalOpen(true);
    }
  };

  const scrollToResults = () => {
    const el = document.getElementById("calculator-results-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isLendingTool = toolMeta.id === "mortgage-calculator" || toolMeta.id === "loan-calculator";

  return (
    <div className="w-full bg-slate-50/50 min-h-screen pb-20">
      {/* Top Banner Ad Container (Zero CLS) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <AdSlot id={`top-banner-${toolMeta.id}`} type="top-banner" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="hover:text-teal-800 transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="capitalize text-slate-600">{toolMeta.category}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate">{toolMeta.shortName}</span>
        </nav>

        {/* Header Title and Intro (50-80 words) */}
        <div className="mb-8 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            {educationalContent.h1}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {educationalContent.intro}
          </p>

          {/* Quick Action Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold print:hidden">
            <button
              type="button"
              id="action-copy-link"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              {copiedLink ? "Link Copied!" : "Share Link"}
            </button>

            <button
              type="button"
              id="action-copy-results"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              {copiedSummary ? "Results Copied!" : "Copy Results"}
            </button>

            <button
              type="button"
              id="action-print-pdf"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              Export PDF / Print
            </button>

            <button
              type="button"
              id="action-email-results"
              onClick={handleEmailResults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 transition-colors shadow-xs"
            >
              <Mail className="w-3.5 h-3.5 text-teal-700" />
              Email Results
            </button>

            <button
              type="button"
              id="action-ai-advice"
              onClick={() => onNavigate(`/ai-finance-assistant?from=${toolMeta.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-800 bg-teal-800 text-white hover:bg-teal-900 transition-colors shadow-xs ml-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              Ask AI About This
            </button>
          </div>
        </div>

        {/* Main 2-Column Calculator + Sticky Skyscraper Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Interactive Grid */}
          <div className="flex-1 w-full space-y-8">
            {children ? (
              <div id="calculator-results-section" className="w-full">
                {children}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Input Form (5 cols on lg) */}
                <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900">Calculator Inputs</h2>
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                      Live Recalculation
                    </span>
                  </div>
                  {inputsComponent}
                </div>

                {/* Right Column: Key Results & Visualization (7 cols on lg) */}
                <div id="calculator-results-section" className="lg:col-span-7 space-y-6">
                  {resultsComponent}

                  {/* In-Content / Results Ad Slot (Responsive 300x250) */}
                  <AdSlot id={`in-content-ad-${toolMeta.id}`} type="in-content" />

                  {/* Chart Visualization */}
                  {chartComponent && (
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                      {chartComponent}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* In-Content Ad Slot for children mode */}
            {children && (
              <AdSlot id={`in-content-ad-${toolMeta.id}`} type="in-content" />
            )}

            {/* Optional Lead-Gen Lender Partner Card for Lending Tools */}
            {isLendingTool && (
              <LeadGenPartnerCard
                id={`lead-partner-${toolMeta.id}`}
                toolType={toolMeta.id === "mortgage-calculator" ? "mortgage" : "loan"}
              />
            )}

            {/* Detailed Table (Amortization, Yearly Breakdown, or Schedule) */}
            {tablesComponent && (
              <div className="pt-2">
                {tablesComponent}
              </div>
            )}

            {/* 300-500 Word Educational Article Section */}
            <article className="mt-12 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
                  Financial Guide & Analysis
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  How the {toolMeta.name} Works
                </h2>
              </div>

              <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-4 text-slate-700">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Mathematical Principle</h3>
                  <p>{educationalContent.howItWorks}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-normal">
                  <span className="font-bold text-slate-500 block mb-1 font-sans text-xs">Standard Formula:</span>
                  {educationalContent.formulaDescription}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Worked Numerical Example</h3>
                  <p>{educationalContent.workedExample}</p>
                </div>
              </div>
            </article>

            {/* Bottom of Article Ad Slot */}
            <AdSlot id={`bottom-article-ad-${toolMeta.id}`} type="bottom-article" />

            {/* FAQ Accordion Section (Schema-ready) */}
            {educationalContent.faqs && educationalContent.faqs.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-6">
                  <HelpCircle className="w-5 h-5 text-teal-700" />
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    Frequently Asked Questions
                  </h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {educationalContent.faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0">
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full text-left flex items-center justify-between gap-4 font-bold text-slate-800 text-sm sm:text-base hover:text-teal-800 transition-colors"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                              isOpen ? "rotate-180 text-teal-700" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Related Tools Internal Links */}
            {educationalContent.relatedToolRoutes && educationalContent.relatedToolRoutes.length > 0 && (
              <div className="p-6 rounded-2xl border border-slate-200/80 bg-linear-to-r from-teal-50/50 via-slate-50 to-teal-50/30">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Related Financial Tools</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {educationalContent.relatedToolRoutes.map((route) => {
                    return (
                      <button
                        key={route}
                        type="button"
                        onClick={() => onNavigate(route)}
                        className="p-3 bg-white rounded-xl border border-slate-200 text-left hover:border-teal-700 hover:shadow-xs transition-all group"
                      >
                        <span className="text-xs font-bold text-slate-800 group-hover:text-teal-800 line-clamp-1">
                          {route.replace("/", "").replace(/-/g, " ").toUpperCase()}
                        </span>
                        <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1 mt-1">
                          Explore tool &rarr;
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Skyscraper Sticky Sidebar Ad (hidden on mobile) */}
          <AdSlot id={`sidebar-skyscraper-${toolMeta.id}`} type="sidebar-skyscraper" />
        </div>
      </main>

      {/* Sticky Mobile Key Result Bar (Mobile Only) */}
      {primaryResultDisplay && (
        <div className="fixed bottom-0 inset-x-0 z-30 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg flex items-center justify-between gap-3 print:hidden">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              {primaryResultLabel || toolMeta.primaryMetricLabel || "Result"}
            </span>
            <span className="text-lg font-bold text-teal-900 tabular-nums">
              {primaryResultDisplay}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollToResults}
              className="px-3 py-1.5 rounded-lg bg-teal-800 text-white font-bold text-xs shadow-xs"
            >
              View Details
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label="Share calculations"
              className="p-2 rounded-lg border border-slate-200 text-slate-700"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        calculatorTitle={toolMeta.name}
        keyResultSummary={`${primaryResultLabel || toolMeta.primaryMetricLabel || "Result"}: ${primaryResultDisplay || "Calculations"}`}
      />
    </div>
  );
};
