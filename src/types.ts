export type CurrencyCode = "USD" | "EUR" | "GBP" | "INR";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateAgainstUSD: number; // For localized approximate conversion display if user switches
  locale: string;
}

export interface ToolMeta {
  id: string;
  route: string;
  name: string;
  shortName: string;
  category:
    | "home"
    | "income"
    | "debt"
    | "investing"
    | "savings"
    | "everyday"
    | "ai"
    | "borrowing"
    | "budgeting"
    | "real_estate"
    | "wealth"
    | "taxes";
  iconName: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  primaryMetricLabel: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface EducationalContent {
  h1: string;
  intro: string;
  howItWorks: string;
  formulaDescription: string;
  workedExample: string;
  faqs: FAQItem[];
  relatedToolRoutes: string[];
}

// Mortgage Calculator
export interface MortgageInputs {
  homePrice: number;
  downPaymentType: "percent" | "amount";
  downPaymentPercent: number;
  downPaymentAmount: number;
  loanTermYears: number;
  interestRate: number;
  propertyTaxRate: number; // % per year
  homeInsuranceAnnual: number;
  pmiRate: number; // % per year if down payment < 20%
  hoaMonthly: number;
  extraMonthlyPayment: number;
}

export interface AmortizationRow {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  totalInterestPaid: number;
}

export interface MortgageResults {
  principalAndInterestMonthly: number;
  propertyTaxMonthly: number;
  homeInsuranceMonthly: number;
  pmiMonthly: number;
  hoaMonthly: number;
  totalMonthlyPayment: number;
  loanAmount: number;
  totalInterestPaid: number;
  totalCostOfLoan: number;
  extraPaymentSavingsYears: number;
  extraPaymentInterestSaved: number;
  schedule: AmortizationRow[];
  yearlySchedule: {
    year: number;
    principalPaid: number;
    interestPaid: number;
    endingBalance: number;
  }[];
}

// Salary Calculator
export interface SalaryInputs {
  grossSalary: number;
  salaryPeriod: "annual" | "monthly" | "biweekly" | "weekly" | "hourly";
  hoursPerWeek: number;
  payFrequency: "weekly" | "biweekly" | "semimonthly" | "monthly" | "annual";
  filingStatus: "single" | "married" | "headOfHousehold";
  stateCode: string;
  preTax401kPercent: number;
  preTaxHealthInsurance: number; // per month
  postTaxDeductions: number; // per month
}

export interface SalaryResults {
  grossAnnual: number;
  netAnnual: number;
  netMonthly: number;
  netPerPaycheck: number;
  paychecksPerYear: number;
  federalTaxAnnual: number;
  stateTaxAnnual: number;
  socialSecurityAnnual: number;
  medicareAnnual: number;
  preTaxDeductionsAnnual: number;
  postTaxDeductionsAnnual: number;
  totalTaxesAnnual: number;
  effectiveTaxRate: number;
}

// Retirement Calculator
export interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedAnnualReturn: number;
  expectedInflation: number;
  desiredAnnualRetirementIncome: number;
}

export interface RetirementResults {
  projectedNestEggAtRetirement: number;
  projectedNestEggInflationAdjusted: number;
  annualSafeRetirementIncome: number;
  desiredRetirementIncomeTarget: number;
  isGoalMet: boolean;
  surplusOrShortfall: number;
  additionalMonthlySavingsNeeded: number;
  yearlyProjection: {
    age: number;
    balanceNominal: number;
    balanceReal: number;
    contributionsTotal: number;
    interestEarnedTotal: number;
  }[];
}

// Investment Calculator
export interface InvestmentInputs {
  initialDeposit: number;
  monthlyContribution: number;
  annualReturnRate: number;
  compoundingFrequency: "annually" | "semiannually" | "quarterly" | "monthly" | "daily";
  durationYears: number;
}

export interface InvestmentResults {
  finalBalance: number;
  totalContributions: number;
  totalInterestEarned: number;
  yearlyBreakdown: {
    year: number;
    balance: number;
    totalContributions: number;
    totalInterest: number;
  }[];
}

// Loan Calculator
export interface LoanInputs {
  loanAmount: number;
  interestRate: number;
  loanTermMonths: number;
  loanType: "personal" | "auto" | "student" | "other";
  originationFeePercent: number;
}

export interface LoanComparisonOffer {
  id: string;
  name: string;
  loanAmount: number;
  interestRate: number;
  loanTermMonths: number;
  originationFee: number;
}

export interface LoanResults {
  monthlyPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalFees: number;
  totalCost: number;
  schedule: AmortizationRow[];
}

// Debt Payoff Planner
export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

export interface DebtMethodResult {
  method: "snowball" | "avalanche";
  totalMonths: number;
  payoffDateString: string;
  totalInterestPaid: number;
  totalPaid: number;
  monthlyBalanceTimeline: {
    month: number;
    totalBalance: number;
    interestPaidThisMonth: number;
  }[];
}

export interface DebtPayoffResults {
  snowball: DebtMethodResult;
  avalanche: DebtMethodResult;
  interestSavedWithAvalanche: number;
  monthsSavedWithAvalanche: number;
  recommendation: string;
}

// Budget Calculator (50/30/20)
export interface BudgetCategory {
  id: string;
  name: string;
  type: "needs" | "wants" | "savings";
  budgetedAmount: number;
  actualAmount: number;
}

export interface BudgetInputs {
  monthlyTakeHome: number;
  categories: BudgetCategory[];
}

export interface BudgetResults {
  recommendedNeeds: number;
  recommendedWants: number;
  recommendedSavings: number;
  actualNeeds: number;
  actualWants: number;
  actualSavings: number;
  totalActualExpenses: number;
  monthlySurplusOrDeficit: number;
  needsVariance: number; // positive = overspent
  wantsVariance: number;
  savingsVariance: number;
}

// Tax Calculator
export interface TaxInputs {
  filingStatus: "single" | "married" | "headOfHousehold";
  annualIncome: number;
  stateCode: string;
  deductionType: "standard" | "itemized";
  itemizedDeductions: number;
  dependentsCount: number;
  retirement401kContributions: number;
  otherPreTaxDeductions: number;
}

export interface TaxResults {
  grossIncome: number;
  taxableIncome: number;
  deductionUsed: number;
  federalTaxOwed: number;
  childTaxCredit: number;
  netFederalTax: number;
  stateTaxOwed: number;
  ficaTaxOwed: number;
  totalTaxOwed: number;
  effectiveTaxRate: number;
  marginalTaxBracket: number;
  bracketBreakdown: {
    rate: number;
    taxableInBracket: number;
    taxAmount: number;
    rangeLabel: string;
  }[];
}

// FIRE Calculator
export interface FireInputs {
  currentAge: number;
  currentSavings: number;
  annualExpenses: number;
  expectedAnnualReturn: number;
  safeWithdrawalRate: number; // e.g. 4%
  monthlySavings: number;
  fireVariant: "standard" | "coast" | "lean" | "fat";
}

export interface FireResults {
  fireNumber: number;
  leanFireNumber: number; // 75%
  fatFireNumber: number; // 125%
  coastFireTargetAtCurrentAge: number;
  yearsToFire: number;
  projectedFireAge: number;
  isAlreadyCoastFire: boolean;
  yearlyTrajectory: {
    age: number;
    year: number;
    netWorth: number;
    fireTarget: number;
  }[];
}

// AI Assistant
export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  calculatorContextTag?: string;
}

// 11. Rent vs. Buy Calculator
export interface RentVsBuyInputs {
  monthlyRent: number;
  expectedRentIncreasePercent: number; // e.g. 3.5%
  homePrice: number;
  downPaymentPercent: number; // e.g. 20%
  mortgageRate: number; // e.g. 6.5%
  mortgageTermYears: number; // 15 or 30
  propertyTaxRate: number; // e.g. 1.2%
  maintenanceRate: number; // e.g. 1.5%
  homeAppreciationRate: number; // e.g. 3.8%
  planningHorizonYears: number; // e.g. 10
  investmentReturnRate: number; // e.g. 7.0%
}

export interface RentVsBuyYearlyComparison {
  year: number;
  buyingNetCost: number;
  rentingNetCost: number;
  buyingNetWorth: number;
  rentingNetWorth: number;
  homeEquity: number;
  rentCostCumulative: number;
  mortgageBalance: number;
}

export interface RentVsBuyResults {
  totalCostRenting: number;
  totalCostBuying: number;
  breakEvenYear: number | null; // null if never breaks even within horizon
  finalNetWorthBuying: number;
  finalNetWorthRenting: number;
  netAdvantageAmount: number;
  betterOption: "buy" | "rent" | "equal";
  yearlySchedule: RentVsBuyYearlyComparison[];
}

// 12. Home Affordability Calculator
export interface HomeAffordabilityInputs {
  annualIncome: number;
  monthlyDebts: number;
  downPaymentSavings: number;
  interestRate: number;
  loanTermYears: number;
  desiredDtiPercent: number; // e.g. 36%
  propertyTaxRate: number; // e.g. 1.2%
  homeInsuranceAnnual: number;
  hoaMonthly: number;
}

export interface HomeAffordabilityResults {
  maxHomePrice: number;
  maxLoanAmount: number;
  downPaymentAmount: number;
  downPaymentPercentOfPrice: number;
  maxMonthlyPayment: number;
  principalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyHomeInsurance: number;
  monthlyHoa: number;
  dtiStatus: "conservative" | "moderate" | "stretched";
  frontEndDti: number;
  backEndDti: number;
}

// 13. Credit Card Payoff Calculator
export interface CreditCardPayoffInputs {
  currentBalance: number;
  apr: number;
  paymentType: "minimum" | "fixed";
  fixedMonthlyPayment: number;
  additionalMonthlyPayment: number;
  minPaymentPercent: number; // e.g. 2.5% of balance or $35
}

export interface CreditCardScenarioResult {
  monthsToPayoff: number;
  totalInterestPaid: number;
  totalPaid: number;
  payoffDateString: string;
  monthlySchedule: {
    month: number;
    balance: number;
    payment: number;
    interest: number;
    principal: number;
  }[];
}

export interface CreditCardPayoffResults {
  minimumScenario: CreditCardScenarioResult;
  chosenScenario: CreditCardScenarioResult;
  interestSaved: number;
  monthsSaved: number;
  trapWarning: boolean;
}

// 14. Net Worth Calculator
export interface NetWorthAssets {
  cashAndChecking: number;
  emergencySavings: number;
  taxableInvestments: number;
  retirementAccounts: number; // 401k, IRA
  primaryRealEstate: number;
  vehicles: number;
  otherAssets: number;
}

export interface NetWorthLiabilities {
  mortgageBalance: number;
  autoLoans: number;
  studentLoans: number;
  creditCardDebt: number;
  otherPersonalDebt: number;
}

export interface NetWorthSnapshot {
  id: string;
  date: string;
  totalNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}

export interface NetWorthInputs {
  age: number;
  assets: NetWorthAssets;
  liabilities: NetWorthLiabilities;
}

export interface NetWorthResults {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetBreakdown: { name: string; value: number; percent: number; color: string }[];
  liabilityBreakdown: { name: string; value: number; percent: number; color: string }[];
  ageGroupBenchmark: {
    bracket: string;
    median: number;
    average: number;
    percentileEstimate: number; // estimated percentile 0-100
  };
}

// 15. Emergency Fund Calculator
export interface EmergencyFundInputs {
  monthlyHousing: number;
  monthlyGroceries: number;
  monthlyUtilities: number;
  monthlyDebtPayments: number;
  monthlyInsuranceHealth: number;
  monthlyTransportation: number;
  monthlyOtherEssentials: number;
  incomeStability: "salaried" | "variable" | "self_employed";
  targetMonths: number;
  currentSavings: number;
  monthlySavingsContribution: number;
}

export interface EmergencyFundResults {
  monthlyEssentialExpenses: number;
  recommendedMonths: number;
  targetAmount: number;
  currentSavings: number;
  fundingGap: number;
  fundingPercentage: number;
  monthsToReachGoal: number;
  currentRunwayMonths: number;
  statusBadge: "safe" | "growing" | "critical";
}

// 16. Savings Goal Calculator
export interface SavingsGoalItem {
  id: string;
  name: string;
  category: "vacation" | "down_payment" | "wedding" | "car" | "education" | "emergency" | "other";
  targetAmount: number;
  currentAmount: number;
  targetMonths: number;
  expectedApy: number; // e.g. 4.5%
}

export interface SavingsGoalResults {
  requiredMonthlyDeposit: number;
  totalPrincipalContributions: number;
  totalInterestEarned: number;
  effectiveTargetDateString: string;
  yearlySchedule: {
    month: number;
    balance: number;
    contributions: number;
    interest: number;
  }[];
}

// 17. Inflation Calculator
export interface InflationInputs {
  startAmount: number;
  startYear: number;
  endYear: number;
}

export interface InflationResults {
  startAmount: number;
  endAmount: number;
  cumulativeInflationRate: number; // %
  annualizedInflationRate: number; // %
  purchasingPowerLossPercent: number;
  timeline: {
    year: number;
    cpi: number;
    equivalentValue: number;
  }[];
}

// 18. Hourly to Salary Calculator
export interface HourlyToSalaryInputs {
  inputMode: "hourly" | "salary";
  hourlyWage: number;
  annualSalary: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  overtimeHoursPerWeek: number;
  overtimeMultiplier: number; // 1.5x default
}

export interface HourlyToSalaryResults {
  hourlyRate: number;
  dailyRate: number; // 8 hours standard
  weeklyRate: number;
  biweeklyRate: number;
  monthlyRate: number;
  annualSalary: number;
  regularAnnual: number;
  overtimeAnnual: number;
  totalAnnualHours: number;
}

// 19. Student Loan Calculator
export type StudentLoanPlanType = "standard_10" | "save_idr" | "graduated_10" | "extended_25";

export interface StudentLoanPlanComparison {
  planType: StudentLoanPlanType;
  planName: string;
  initialMonthlyPayment: number;
  totalInterestPaid: number;
  termMonths: number;
  totalPaid: number;
  estimatedForgiveness: number;
}

export interface StudentLoanInputs {
  loanBalance: number;
  interestRate: number;
  selectedPlan: StudentLoanPlanType;
  annualAgi: number;
  householdSize: number;
  extraMonthlyPayment: number;
}

export interface StudentLoanResults {
  activePlan: StudentLoanPlanComparison;
  planComparisons: Record<StudentLoanPlanType, StudentLoanPlanComparison>;
  acceleratedSavings?: {
    monthsSaved: number;
    interestSaved: number;
  };
  discretionaryIncome?: number;
  povertyThreshold?: number;
}

// 20. Freelancer / Self-Employed Tax Calculator
export interface SelfEmploymentTaxInputs {
  grossSelfEmploymentIncome: number;
  businessExpenses: number;
  filingStatus: "single" | "married" | "headOfHousehold";
  stateCode: string;
  w2Wages: number; // W-2 wages from other day job if any
}

export interface SelfEmploymentTaxResults {
  grossIncome: number;
  totalExpenses: number;
  netScheduleCProfit: number;
  taxableSeIncome: number; // 92.35%
  socialSecurityTax: number;
  medicareTax: number;
  additionalMedicareTax: number;
  totalSeTax: number;
  deductibleSeTaxHalf: number;
  estimatedFederalIncomeTax: number;
  estimatedStateIncomeTax: number;
  totalTaxLiability: number;
  effectiveTaxRate: number;
  quarterlyPayments: {
    quarter: string;
    period: string;
    dueDate: string;
    amount: number;
  }[];
}

// 21. Dividend / DRIP Calculator
export interface DividendInputs {
  initialInvestment: number;
  sharePrice: number;
  annualDividendYield: number; // %
  annualDividendGrowthRate: number; // %
  expectedSharePriceGrowthRate: number; // %
  monthlyContribution: number;
  investmentYears: number;
  reinvestDividends: boolean;
}

export interface DividendYearlyData {
  year: number;
  portfolioValueWithDrip: number;
  portfolioValueWithoutDrip: number;
  annualDividends: number;
  cumulativeDividends: number;
  totalInvestedCapital: number;
  sharesOwned: number;
  yieldOnCost: number;
}

export interface DividendResults {
  finalPortfolioValue: number;
  finalPortfolioValueWithoutDrip: number;
  differenceFromDrip: number;
  totalDividendsEarned: number;
  finalAnnualDividendIncome: number;
  finalYieldOnCost: number;
  totalCapitalInvested: number;
  yearlySchedule: DividendYearlyData[];
}

// 22. Currency Converter
export interface CurrencyExchangeRate {
  code: string;
  name: string;
  symbol: string;
  rateAgainstUSD: number;
}

export interface CurrencyConverterInputs {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

export interface CurrencyConverterResults {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  convertedAmount: number;
  inverseRate: number;
  lastUpdated: string;
  trendHistory: {
    date: string;
    rate: number;
  }[];
}

// 23. Tip Calculator & Bill Splitter
export interface TipInputs {
  billAmount: number;
  tipPercent: number;
  splitCount: number;
  roundUp: boolean;
}

export interface TipResults {
  billAmount: number;
  tipPercent: number;
  tipAmount: number;
  totalAmount: number;
  splitCount: number;
  perPersonBill: number;
  perPersonTip: number;
  perPersonTotal: number;
}

// 24. Mortgage Refinance Calculator
export interface RefinanceInputs {
  currentBalance: number;
  currentRate: number;
  currentRemainingYears: number;
  newRate: number;
  newTermYears: number;
  closingCosts: number;
  rollClosingCostsIntoLoan: boolean;
}

export interface RefinanceResults {
  currentMonthlyPayment: number;
  newMonthlyPayment: number;
  monthlySavings: number;
  closingCosts: number;
  breakEvenMonths: number;
  currentRemainingInterest: number;
  newTotalInterest: number;
  lifetimeInterestSavings: number;
  netLifetimeSavings: number;
  isBeneficial: boolean;
  yearlyComparison: {
    year: number;
    currentBalance: number;
    newBalance: number;
    cumulativeSavings: number;
  }[];
}

// 25. Auto Lease vs. Buy Calculator
export interface LeaseVsBuyInputs {
  vehiclePrice: number;
  downPayment: number;
  buyLoanRate: number;
  buyLoanTermMonths: number;
  buySalesTaxRate: number;
  leaseTermMonths: number;
  leaseMonthlyPayment: number;
  leaseDueAtSigning: number;
  leaseResidualValue: number;
  ownershipYears: number;
}

export interface LeaseVsBuyResults {
  buyMonthlyPayment: number;
  buyTotalPayments: number;
  buyTotalCost: number;
  buyEstimatedEquity: number;
  buyNetCost: number;
  leaseTotalCost: number;
  leaseNetCost: number;
  netCostDifference: number;
  winner: "buy" | "lease";
  savings: number;
  summary: string;
  yearlySchedule: {
    year: number;
    buyCumulativeCost: number;
    buyEquity: number;
    buyNetCost: number;
    leaseCumulativeCost: number;
  }[];
}

// 26. 401(k) Contribution & Employer Match Calculator
export interface FourZeroOneKInputs {
  currentAge: number;
  retirementAge: number;
  currentSalary: number;
  annualSalaryGrowth: number;
  currentBalance: number;
  employeeContributionPercent: number;
  employerMatchPercent: number;
  employerMatchCapPercent: number;
  expectedAnnualReturn: number;
}

export interface FourZeroOneKResults {
  projectedBalance: number;
  totalEmployeeContributions: number;
  totalEmployerMatch: number;
  totalGrowth: number;
  firstYearEmployeeContribution: number;
  firstYearEmployerMatch: number;
  isLeavingMatchOnTable: boolean;
  unclaimedMatchAnnual: number;
  matchContributionGoalPercent: number;
  yearlyBreakdown: {
    age: number;
    salary: number;
    employeeContrib: number;
    employerMatch: number;
    totalContributions: number;
    growth: number;
    balance: number;
  }[];
}

// 27. Roth vs. Traditional IRA/401(k) Calculator
export interface RothVsTraditionalInputs {
  currentAge: number;
  retirementAge: number;
  annualContribution: number;
  currentTaxRate: number;
  retirementTaxRate: number;
  expectedAnnualReturn: number;
}

export interface RothVsTraditionalResults {
  yearsToGrow: number;
  totalContributions: number;
  rothBalance: number;
  rothAfterTaxValue: number;
  traditionalBalance: number;
  traditionalTaxAtRetirement: number;
  traditionalAfterTaxValue: number;
  traditionalWithTaxSavingsInvested: number;
  advantageType: "roth" | "traditional" | "equal";
  differenceAmount: number;
  recommendation: string;
  yearlyComparison: {
    age: number;
    rothBalance: number;
    traditionalBalance: number;
    traditionalAfterTax: number;
  }[];
}

// 28. 529 College Savings Calculator
export interface College529Inputs {
  childCurrentAge: number;
  collegeStartAge: number;
  currentSavings: number;
  monthlyContribution: number;
  annualReturnRate: number;
  currentAnnualCollegeCost: number;
  collegeCostInflationRate: number;
  yearsInCollege: number;
}

export interface College529Results {
  yearsUntilCollege: number;
  projected529Balance: number;
  projectedAnnualCostAtStart: number;
  projectedTotal4YearCost: number;
  fundingGapOrSurplus: number;
  isSurplus: boolean;
  percentFunded: number;
  recommendedMonthlyContribution: number;
  yearlyProjection: {
    childAge: number;
    contributions: number;
    growth: number;
    balance: number;
    projectedAnnualCost?: number;
  }[];
}

// 29. HSA (Health Savings Account) Calculator
export interface HsaInputs {
  currentAge: number;
  retirementAge: number;
  annualContribution: number;
  employerContribution: number;
  annualMedicalExpensesPaidFromHsa: number;
  expectedAnnualReturn: number;
  marginalTaxRate: number;
}

export interface HsaResults {
  projectedBalanceAtRetirement: number;
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  totalInvestmentGrowth: number;
  totalTaxSavings: number;
  annualUpfrontTaxSavings: number;
  yearlySchedule: {
    age: number;
    balance: number;
    annualTaxSaved: number;
    cumulativeTaxSaved: number;
    interestEarned: number;
  }[];
}

// 30. Rental Property ROI / Cap Rate Calculator
export interface RentalRoiInputs {
  purchasePrice: number;
  downPayment: number;
  closingCosts: number;
  monthlyRent: number;
  vacancyRate: number;
  annualPropertyTax: number;
  annualInsurance: number;
  maintenanceReservePercent: number;
  managementFeePercent: number;
  hoaMonthly: number;
  isFinanced: boolean;
  mortgageInterestRate: number;
  mortgageTermYears: number;
}

export interface RentalRoiResults {
  totalInitialInvestment: number;
  grossAnnualRent: number;
  effectiveGrossIncome: number;
  annualOperatingExpenses: number;
  netOperatingIncome: number;
  capRate: number;
  annualDebtService: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  cashOnCashReturn: number;
  fiveYearTotalReturn: number;
  tenYearTotalReturn: number;
  yearlyProjections: {
    year: number;
    propertyValue: number;
    loanBalance: number;
    equity: number;
    cumulativeCashFlow: number;
    totalProfit: number;
  }[];
}

// 31. Life Insurance Needs Calculator (DIME)
export interface LifeInsuranceInputs {
  annualIncomeToReplace: number;
  yearsOfIncomeReplacement: number;
  mortgageBalance: number;
  otherDebts: number;
  childrenCollegeFunding: number;
  funeralAndFinalExpenses: number;
  existingSavingsAndInvestments: number;
  existingLifeInsurance: number;
}

export interface LifeInsuranceResults {
  dimeDebt: number;
  dimeIncome: number;
  dimeMortgage: number;
  dimeEducation: number;
  grossNeed: number;
  existingAssets: number;
  recommendedCoverage: number;
  coverageBreakdown: {
    name: string;
    amount: number;
    percentage: number;
  }[];
}

// 32. Social Security Benefit Estimator
export interface SocialSecurityInputs {
  currentAge: number;
  currentAnnualSalary: number;
  plannedClaimingAge: number;
}

export interface SocialSecurityResults {
  fullRetirementAge: number;
  estimatedPiaMonthly: number;
  benefitAtClaimingAge: number;
  benefitAt62: number;
  benefitAt67: number;
  benefitAt70: number;
  percentageOfPia: number;
  breakEvenAge62vs67: number;
  breakEvenAge67vs70: number;
  ageBenefitTable: {
    age: number;
    monthlyBenefit: number;
    annualBenefit: number;
    percentOfPia: number;
    cumulativeAt80: number;
    cumulativeAt85: number;
  }[];
}


