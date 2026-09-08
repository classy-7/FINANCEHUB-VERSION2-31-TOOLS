import React, { useState, useEffect } from "react";
import { CurrencyProvider } from "./context/CurrencyContext";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { CalculatorLayout } from "./components/layout/CalculatorLayout";
import { HomePage } from "./pages/HomePage";
import { AboutPage, PrivacyPage, TermsPage, DisclaimerPage } from "./pages/InfoPages";
import { CookieBanner } from "./components/common/CookieBanner";
import { EmailCaptureModal } from "./components/common/EmailCaptureModal";
import { getToolByRoute } from "./data/toolsData";

// Tool Components
import { MortgageCalculator } from "./components/tools/MortgageCalculator";
import { SalaryCalculator } from "./components/tools/SalaryCalculator";
import { RetirementCalculator } from "./components/tools/RetirementCalculator";
import { InvestmentCalculator } from "./components/tools/InvestmentCalculator";
import { LoanCalculator } from "./components/tools/LoanCalculator";
import { DebtPayoffPlanner } from "./components/tools/DebtPayoffPlanner";
import { BudgetCalculator } from "./components/tools/BudgetCalculator";
import { TaxCalculator } from "./components/tools/TaxCalculator";
import { FireCalculator } from "./components/tools/FireCalculator";
import { AiFinanceAssistant } from "./components/tools/AiFinanceAssistant";
import { HourlyToSalaryCalculator } from "./components/tools/HourlyToSalaryCalculator";
import { RentVsBuyCalculator } from "./components/tools/RentVsBuyCalculator";
import { HomeAffordabilityCalculator } from "./components/tools/HomeAffordabilityCalculator";
import { CreditCardPayoffCalculator } from "./components/tools/CreditCardPayoffCalculator";
import { NetWorthCalculator } from "./components/tools/NetWorthCalculator";
import { EmergencyFundCalculator } from "./components/tools/EmergencyFundCalculator";
import { SavingsGoalCalculator } from "./components/tools/SavingsGoalCalculator";
import { InflationCalculator } from "./components/tools/InflationCalculator";
import { StudentLoanCalculator } from "./components/tools/StudentLoanCalculator";
import { SelfEmploymentTaxCalculator } from "./components/tools/SelfEmploymentTaxCalculator";
import { DividendCalculator } from "./components/tools/DividendCalculator";
import { CurrencyConverter } from "./components/tools/CurrencyConverter";
import { TipCalculator } from "./components/tools/TipCalculator";
import { MortgageRefinanceCalculator } from "./components/tools/MortgageRefinanceCalculator";
import { LeaseVsBuyCalculator } from "./components/tools/LeaseVsBuyCalculator";
import { FourZeroOneKCalculator } from "./components/tools/FourZeroOneKCalculator";
import { RothVsTraditionalCalculator } from "./components/tools/RothVsTraditionalCalculator";
import { College529Calculator } from "./components/tools/College529Calculator";
import { HsaCalculator } from "./components/tools/HsaCalculator";
import { RentalPropertyRoiCalculator } from "./components/tools/RentalPropertyRoiCalculator";
import { LifeInsuranceCalculator } from "./components/tools/LifeInsuranceCalculator";
import { SocialSecurityCalculator } from "./components/tools/SocialSecurityCalculator";

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || "/";
  });
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [emailModalCalculationSummary, setEmailModalCalculationSummary] = useState<string>("");

  // Sync route on popstate (browser back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = (route: string) => {
    if (route.startsWith("/")) {
      const url = new URL(route, window.location.origin);
      window.history.pushState({}, "", route);
      setCurrentRoute(url.pathname);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleOpenEmailModal = (summary?: string) => {
    setEmailModalCalculationSummary(summary || "Your FinanceHub custom calculation breakdown.");
    setIsEmailModalOpen(true);
  };

  // Render specific tool component mapped to the current path
  const renderCalculatorComponent = (toolId: string) => {
    switch (toolId) {
      case "mortgage-calculator":
        return <MortgageCalculator />;
      case "salary-calculator":
        return <SalaryCalculator />;
      case "retirement-calculator":
        return <RetirementCalculator />;
      case "investment-calculator":
        return <InvestmentCalculator />;
      case "loan-calculator":
        return <LoanCalculator />;
      case "debt-payoff-planner":
        return <DebtPayoffPlanner />;
      case "budget-calculator":
        return <BudgetCalculator />;
      case "tax-calculator":
        return <TaxCalculator />;
      case "fire-calculator":
        return <FireCalculator />;
      case "ai-finance-assistant":
        return <AiFinanceAssistant />;
      case "hourly-to-salary-calculator":
        return <HourlyToSalaryCalculator onNavigate={handleNavigate} />;
      case "rent-vs-buy-calculator":
        return <RentVsBuyCalculator />;
      case "home-affordability-calculator":
        return <HomeAffordabilityCalculator onNavigate={handleNavigate} />;
      case "credit-card-payoff-calculator":
        return <CreditCardPayoffCalculator />;
      case "net-worth-calculator":
        return <NetWorthCalculator />;
      case "emergency-fund-calculator":
        return <EmergencyFundCalculator />;
      case "savings-goal-calculator":
        return <SavingsGoalCalculator />;
      case "inflation-calculator":
        return <InflationCalculator />;
      case "student-loan-calculator":
        return <StudentLoanCalculator />;
      case "self-employment-tax-calculator":
        return <SelfEmploymentTaxCalculator />;
      case "dividend-calculator":
        return <DividendCalculator />;
      case "currency-converter":
        return <CurrencyConverter />;
      case "tip-calculator":
        return <TipCalculator />;
      case "refinance-calculator":
        return <MortgageRefinanceCalculator />;
      case "lease-vs-buy-car-calculator":
        return <LeaseVsBuyCalculator />;
      case "401k-calculator":
        return <FourZeroOneKCalculator />;
      case "roth-vs-traditional-calculator":
        return <RothVsTraditionalCalculator />;
      case "529-college-savings-calculator":
        return <College529Calculator />;
      case "hsa-calculator":
        return <HsaCalculator />;
      case "rental-property-roi-calculator":
        return <RentalPropertyRoiCalculator />;
      case "life-insurance-calculator":
        return <LifeInsuranceCalculator />;
      case "social-security-calculator":
        return <SocialSecurityCalculator />;
      default:
        return <MortgageCalculator />;
    }
  };

  // Determine which page or layout to render
  const renderContent = () => {
    // Info and legal pages
    if (currentRoute === "/about") {
      return <AboutPage />;
    }
    if (currentRoute === "/privacy") {
      return <PrivacyPage />;
    }
    if (currentRoute === "/terms") {
      return <TermsPage />;
    }
    if (currentRoute === "/disclaimer") {
      return <DisclaimerPage />;
    }

    // Calculator tool pages
    const activeTool = getToolByRoute(currentRoute);
    if (activeTool) {
      return (
        <CalculatorLayout
          tool={activeTool}
          toolMeta={activeTool}
          onOpenEmailModal={handleOpenEmailModal}
          onNavigate={handleNavigate}
        >
          {renderCalculatorComponent(activeTool.id)}
        </CalculatorLayout>
      );
    }

    // Default: Home Page
    return <HomePage onNavigate={handleNavigate} />;
  };

  return (
    <CurrencyProvider>
      <div id="finance-hub-app" className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900 font-sans">
        {/* Navigation */}
        <Navbar currentRoute={currentRoute} onNavigate={handleNavigate} />

        {/* Main Content Area */}
        <main className="flex-1">
          {renderContent()}
        </main>

        {/* Footer */}
        <Footer onNavigate={handleNavigate} />

        {/* Privacy Cookie Banner */}
        <CookieBanner />

        {/* Save Calculation Modal */}
        <EmailCaptureModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          calculationSummary={emailModalCalculationSummary}
        />
      </div>
    </CurrencyProvider>
  );
}
