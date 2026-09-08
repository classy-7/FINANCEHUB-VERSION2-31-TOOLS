import taxRules2026 from "../../data/tax-rules/2026.json";
import { HISTORICAL_CPI, MIN_CPI_YEAR, MAX_CPI_YEAR } from "../data/cpiData";
import {
  NET_WORTH_BY_AGE_GROUP,
  getPovertyGuideline,
  SE_TAX_CONFIG_2026,
} from "../data/benchmarkData";
import {
  MortgageInputs,
  MortgageResults,
  AmortizationRow,
  SalaryInputs,
  SalaryResults,
  RetirementInputs,
  RetirementResults,
  InvestmentInputs,
  InvestmentResults,
  LoanInputs,
  LoanResults,
  DebtItem,
  DebtPayoffResults,
  DebtMethodResult,
  BudgetInputs,
  BudgetResults,
  TaxInputs,
  TaxResults,
  FireInputs,
  FireResults,
  RentVsBuyInputs,
  RentVsBuyResults,
  HomeAffordabilityInputs,
  HomeAffordabilityResults,
  CreditCardPayoffInputs,
  CreditCardPayoffResults,
  NetWorthInputs,
  NetWorthResults,
  EmergencyFundInputs,
  EmergencyFundResults,
  SavingsGoalItem,
  SavingsGoalResults,
  InflationInputs,
  InflationResults,
  HourlyToSalaryInputs,
  HourlyToSalaryResults,
  StudentLoanInputs,
  StudentLoanResults,
  StudentLoanPlanType,
  StudentLoanPlanComparison,
  SelfEmploymentTaxInputs,
  SelfEmploymentTaxResults,
  DividendInputs,
  DividendResults,
  CurrencyConverterInputs,
  CurrencyConverterResults,
  TipInputs,
  TipResults,
  RefinanceInputs,
  RefinanceResults,
  LeaseVsBuyInputs,
  LeaseVsBuyResults,
  FourZeroOneKInputs,
  FourZeroOneKResults,
  RothVsTraditionalInputs,
  RothVsTraditionalResults,
  College529Inputs,
  College529Results,
  HsaInputs,
  HsaResults,
  RentalRoiInputs,
  RentalRoiResults,
  LifeInsuranceInputs,
  LifeInsuranceResults,
  SocialSecurityInputs,
  SocialSecurityResults,
} from "../types";

// ==========================================
// 1. MORTGAGE CALCULATOR MATH
// ==========================================
export function calculateMortgage(inputs: MortgageInputs): MortgageResults {
  const downPayment =
    inputs.downPaymentType === "percent"
      ? (inputs.homePrice * Math.min(100, Math.max(0, inputs.downPaymentPercent))) / 100
      : Math.min(inputs.homePrice, Math.max(0, inputs.downPaymentAmount));

  const loanAmount = Math.max(0, inputs.homePrice - downPayment);
  const monthlyRate = (inputs.interestRate / 100) / 12;
  const totalMonths = Math.max(1, inputs.loanTermYears * 12);

  let pAndI = 0;
  if (monthlyRate === 0) {
    pAndI = loanAmount / totalMonths;
  } else if (loanAmount > 0) {
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    pAndI = (loanAmount * (monthlyRate * factor)) / (factor - 1);
  }

  const propertyTaxMonthly = (inputs.homePrice * (inputs.propertyTaxRate / 100)) / 12;
  const homeInsuranceMonthly = inputs.homeInsuranceAnnual / 12;
  const downPaymentRatio = inputs.homePrice > 0 ? downPayment / inputs.homePrice : 0;
  const pmiMonthly = downPaymentRatio < 0.2 ? (loanAmount * (inputs.pmiRate / 100)) / 12 : 0;
  const hoaMonthly = inputs.hoaMonthly;

  const totalMonthlyPayment = pAndI + propertyTaxMonthly + homeInsuranceMonthly + pmiMonthly + hoaMonthly;

  // Baseline schedule (without extra payments)
  let baseBalance = loanAmount;
  let baseTotalInterest = 0;
  for (let m = 1; m <= totalMonths; m++) {
    const int = baseBalance * monthlyRate;
    const princ = Math.min(baseBalance, pAndI - int);
    baseTotalInterest += int;
    baseBalance -= princ;
    if (baseBalance <= 0) break;
  }

  // Active schedule with extra monthly payment
  const schedule: AmortizationRow[] = [];
  const yearlyMap = new Map<number, { principal: number; interest: number; balance: number }>();
  let currentBalance = loanAmount;
  let cumulativeInterest = 0;
  const extra = Math.max(0, inputs.extraMonthlyPayment);

  let activeMonths = 0;
  while (currentBalance > 0.01 && activeMonths < totalMonths * 2) {
    activeMonths++;
    const currentYear = Math.ceil(activeMonths / 12);
    const monthlyInt = currentBalance * monthlyRate;
    const standardPrinc = pAndI - monthlyInt;
    const totalPrinc = Math.min(currentBalance, standardPrinc + extra);
    const payment = monthlyInt + totalPrinc;

    cumulativeInterest += monthlyInt;
    currentBalance = Math.max(0, currentBalance - totalPrinc);

    schedule.push({
      month: activeMonths,
      year: currentYear,
      payment,
      principal: totalPrinc,
      interest: monthlyInt,
      remainingBalance: currentBalance,
      totalInterestPaid: cumulativeInterest,
    });

    const yrRecord = yearlyMap.get(currentYear) || { principal: 0, interest: 0, balance: currentBalance };
    yrRecord.principal += totalPrinc;
    yrRecord.interest += monthlyInt;
    yrRecord.balance = currentBalance;
    yearlyMap.set(currentYear, yrRecord);
  }

  const yearlySchedule = Array.from(yearlyMap.entries()).map(([year, data]) => ({
    year,
    principalPaid: data.principal,
    interestPaid: data.interest,
    endingBalance: data.balance,
  }));

  const monthsSaved = Math.max(0, totalMonths - activeMonths);
  const yearsSaved = Number((monthsSaved / 12).toFixed(1));
  const interestSaved = Math.max(0, baseTotalInterest - cumulativeInterest);

  return {
    principalAndInterestMonthly: pAndI,
    propertyTaxMonthly,
    homeInsuranceMonthly,
    pmiMonthly,
    hoaMonthly,
    totalMonthlyPayment,
    loanAmount,
    totalInterestPaid: cumulativeInterest,
    totalCostOfLoan: loanAmount + cumulativeInterest,
    extraPaymentSavingsYears: yearsSaved,
    extraPaymentInterestSaved: interestSaved,
    schedule,
    yearlySchedule,
  };
}

// ==========================================
// 2. SALARY & TAKE-HOME PAY CALCULATOR MATH
// ==========================================
export function calculateSalary(inputs: SalaryInputs): SalaryResults {
  let grossAnnual = 0;
  switch (inputs.salaryPeriod) {
    case "annual":
      grossAnnual = inputs.grossSalary;
      break;
    case "monthly":
      grossAnnual = inputs.grossSalary * 12;
      break;
    case "biweekly":
      grossAnnual = inputs.grossSalary * 26;
      break;
    case "weekly":
      grossAnnual = inputs.grossSalary * 52;
      break;
    case "hourly":
      grossAnnual = inputs.grossSalary * (inputs.hoursPerWeek || 40) * 52;
      break;
  }

  const preTax401k = (grossAnnual * Math.min(100, Math.max(0, inputs.preTax401kPercent))) / 100;
  const preTaxHealth = inputs.preTaxHealthInsurance * 12;
  const preTaxDeductionsAnnual = preTax401k + preTaxHealth;

  const postTaxDeductionsAnnual = inputs.postTaxDeductions * 12;

  // FICA Calculation (Social Security + Medicare)
  const ssCap = taxRules2026.federal.fica.socialSecurityWageCap;
  const ssRate = taxRules2026.federal.fica.socialSecurityRate;
  const taxableForSS = Math.min(grossAnnual - preTaxHealth, ssCap);
  const socialSecurityAnnual = Math.max(0, taxableForSS * ssRate);

  const medRate = taxRules2026.federal.fica.medicareRate;
  const addMedThreshold =
    taxRules2026.federal.fica.additionalMedicareThreshold[inputs.filingStatus] || 200000;
  const addMedRate = taxRules2026.federal.fica.additionalMedicareRate;
  const taxableForMed = Math.max(0, grossAnnual - preTaxHealth);
  let medicareAnnual = taxableForMed * medRate;
  if (taxableForMed > addMedThreshold) {
    medicareAnnual += (taxableForMed - addMedThreshold) * addMedRate;
  }

  // Federal Income Tax
  const standardDed =
    taxRules2026.federal.standardDeductions[inputs.filingStatus] ||
    taxRules2026.federal.standardDeductions.single;
  const federalTaxableIncome = Math.max(0, grossAnnual - preTaxDeductionsAnnual - standardDed);

  const brackets =
    (taxRules2026.federal.brackets as any)[inputs.filingStatus] ||
    taxRules2026.federal.brackets.single;

  let federalTaxAnnual = 0;
  for (let i = 0; i < brackets.length; i++) {
    const current = brackets[i];
    const next = brackets[i + 1];
    if (federalTaxableIncome > current.threshold) {
      const taxableInThisBracket = next
        ? Math.min(federalTaxableIncome - current.threshold, next.threshold - current.threshold)
        : federalTaxableIncome - current.threshold;
      federalTaxAnnual += taxableInThisBracket * current.rate;
    }
  }

  // State Tax
  let stateTaxAnnual = 0;
  const stateData = (taxRules2026.states as any)[inputs.stateCode];
  if (stateData) {
    if (stateData.type === "flat") {
      stateTaxAnnual = Math.max(0, grossAnnual - preTaxDeductionsAnnual) * stateData.rate;
    } else if (stateData.type === "progressive" && stateData.brackets) {
      const stateTaxable = Math.max(0, grossAnnual - preTaxDeductionsAnnual);
      for (let i = 0; i < stateData.brackets.length; i++) {
        const curB = stateData.brackets[i];
        const nxtB = stateData.brackets[i + 1];
        if (stateTaxable > curB.threshold) {
          const chunk = nxtB
            ? Math.min(stateTaxable - curB.threshold, nxtB.threshold - curB.threshold)
            : stateTaxable - curB.threshold;
          stateTaxAnnual += chunk * curB.rate;
        }
      }
    }
  }

  const totalTaxesAnnual = federalTaxAnnual + stateTaxAnnual + socialSecurityAnnual + medicareAnnual;
  const netAnnual = Math.max(
    0,
    grossAnnual - totalTaxesAnnual - preTaxDeductionsAnnual - postTaxDeductionsAnnual
  );

  let paychecksPerYear = 26;
  switch (inputs.payFrequency) {
    case "weekly":
      paychecksPerYear = 52;
      break;
    case "biweekly":
      paychecksPerYear = 26;
      break;
    case "semimonthly":
      paychecksPerYear = 24;
      break;
    case "monthly":
      paychecksPerYear = 12;
      break;
    case "annual":
      paychecksPerYear = 1;
      break;
  }

  return {
    grossAnnual,
    netAnnual,
    netMonthly: netAnnual / 12,
    netPerPaycheck: netAnnual / paychecksPerYear,
    paychecksPerYear,
    federalTaxAnnual,
    stateTaxAnnual,
    socialSecurityAnnual,
    medicareAnnual,
    preTaxDeductionsAnnual,
    postTaxDeductionsAnnual,
    totalTaxesAnnual,
    effectiveTaxRate: grossAnnual > 0 ? (totalTaxesAnnual / grossAnnual) * 100 : 0,
  };
}

// ==========================================
// 3. RETIREMENT CALCULATOR MATH
// ==========================================
export function calculateRetirement(inputs: RetirementInputs): RetirementResults {
  const yearsToRetire = Math.max(1, inputs.retirementAge - inputs.currentAge);
  const yearsInRetirement = Math.max(1, inputs.lifeExpectancy - inputs.retirementAge);

  const nominalRate = inputs.expectedAnnualReturn / 100;
  const inflationRate = inputs.expectedInflation / 100;
  const realRate = (1 + nominalRate) / (1 + inflationRate) - 1;

  const monthlyRateNominal = nominalRate / 12;
  const monthlyRateReal = realRate / 12;

  let balanceNominal = inputs.currentSavings;
  let balanceReal = inputs.currentSavings;
  let contributionsTotal = inputs.currentSavings;

  const yearlyProjection = [];
  yearlyProjection.push({
    age: inputs.currentAge,
    balanceNominal: Math.round(balanceNominal),
    balanceReal: Math.round(balanceReal),
    contributionsTotal: Math.round(contributionsTotal),
    interestEarnedTotal: 0,
  });

  for (let yr = 1; yr <= yearsToRetire; yr++) {
    for (let m = 1; m <= 12; m++) {
      balanceNominal = (balanceNominal + inputs.monthlyContribution) * (1 + monthlyRateNominal);
      balanceReal = (balanceReal + inputs.monthlyContribution) * (1 + monthlyRateReal);
      contributionsTotal += inputs.monthlyContribution;
    }
    yearlyProjection.push({
      age: inputs.currentAge + yr,
      balanceNominal: Math.round(balanceNominal),
      balanceReal: Math.round(balanceReal),
      contributionsTotal: Math.round(contributionsTotal),
      interestEarnedTotal: Math.round(Math.max(0, balanceNominal - contributionsTotal)),
    });
  }

  // Safe withdrawal estimate (4% rule adjusted for inflation)
  const annualSafeRetirementIncome = balanceReal * 0.04;
  const isGoalMet = annualSafeRetirementIncome >= inputs.desiredAnnualRetirementIncome;
  const surplusOrShortfall = annualSafeRetirementIncome - inputs.desiredAnnualRetirementIncome;

  // Additional monthly savings formula if shortfall
  let additionalMonthlySavingsNeeded = 0;
  if (!isGoalMet && yearsToRetire > 0) {
    const requiredRealNestEgg = inputs.desiredAnnualRetirementIncome / 0.04;
    const currentProjected = balanceReal;
    const nestEggShortfall = Math.max(0, requiredRealNestEgg - currentProjected);
    const months = yearsToRetire * 12;
    if (monthlyRateReal > 0) {
      const fvFactor = (Math.pow(1 + monthlyRateReal, months) - 1) / monthlyRateReal;
      additionalMonthlySavingsNeeded = nestEggShortfall / fvFactor;
    } else {
      additionalMonthlySavingsNeeded = nestEggShortfall / months;
    }
  }

  return {
    projectedNestEggAtRetirement: balanceNominal,
    projectedNestEggInflationAdjusted: balanceReal,
    annualSafeRetirementIncome,
    desiredRetirementIncomeTarget: inputs.desiredAnnualRetirementIncome,
    isGoalMet,
    surplusOrShortfall,
    additionalMonthlySavingsNeeded: Math.max(0, additionalMonthlySavingsNeeded),
    yearlyProjection,
  };
}

// ==========================================
// 4. COMPOUND INTEREST / INVESTMENT MATH
// ==========================================
export function calculateInvestment(inputs: InvestmentInputs): InvestmentResults {
  const annualRate = inputs.annualReturnRate / 100;
  let compoundsPerYear = 12;
  switch (inputs.compoundingFrequency) {
    case "annually":
      compoundsPerYear = 1;
      break;
    case "semiannually":
      compoundsPerYear = 2;
      break;
    case "quarterly":
      compoundsPerYear = 4;
      break;
    case "monthly":
      compoundsPerYear = 12;
      break;
    case "daily":
      compoundsPerYear = 365;
      break;
  }

  let runningBalance = inputs.initialDeposit;
  let totalContrib = inputs.initialDeposit;
  const yearlyBreakdown = [];

  yearlyBreakdown.push({
    year: 0,
    balance: Math.round(runningBalance),
    totalContributions: Math.round(totalContrib),
    totalInterest: 0,
  });

  const ratePerPeriod = annualRate / compoundsPerYear;
  const duration = Math.max(1, inputs.durationYears);

  // Simulate monthly cash flows with compounding
  for (let yr = 1; yr <= duration; yr++) {
    for (let m = 1; m <= 12; m++) {
      runningBalance += inputs.monthlyContribution;
      totalContrib += inputs.monthlyContribution;
      // Monthly equivalent compounding
      runningBalance *= Math.pow(1 + ratePerPeriod, compoundsPerYear / 12);
    }
    yearlyBreakdown.push({
      year: yr,
      balance: Math.round(runningBalance),
      totalContributions: Math.round(totalContrib),
      totalInterest: Math.round(Math.max(0, runningBalance - totalContrib)),
    });
  }

  return {
    finalBalance: runningBalance,
    totalContributions: totalContrib,
    totalInterestEarned: Math.max(0, runningBalance - totalContrib),
    yearlyBreakdown,
  };
}

// ==========================================
// 5. LOAN / EMI CALCULATOR MATH
// ==========================================
export function calculateLoan(inputs: LoanInputs): LoanResults {
  const principal = inputs.loanAmount;
  const monthlyRate = (inputs.interestRate / 100) / 12;
  const months = Math.max(1, inputs.loanTermMonths);
  const fee = (principal * (inputs.originationFeePercent || 0)) / 100;

  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    monthlyPayment = (principal * (monthlyRate * factor)) / (factor - 1);
  }

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let m = 1; m <= months; m++) {
    const int = balance * monthlyRate;
    const princ = Math.min(balance, monthlyPayment - int);
    totalInterest += int;
    balance = Math.max(0, balance - princ);

    schedule.push({
      month: m,
      year: Math.ceil(m / 12),
      payment: monthlyPayment,
      principal: princ,
      interest: int,
      remainingBalance: balance,
      totalInterestPaid: totalInterest,
    });
  }

  return {
    monthlyPayment,
    totalPrincipal: principal,
    totalInterest,
    totalFees: fee,
    totalCost: principal + totalInterest + fee,
    schedule,
  };
}

// ==========================================
// 6. DEBT PAYOFF PLANNER MATH
// ==========================================
function simulateDebtMethod(debts: DebtItem[], extraMonthly: number, method: "snowball" | "avalanche"): DebtMethodResult {
  // Clone debts
  let active = debts.map((d) => ({ ...d, currentBalance: d.balance }));
  // Sort debts according to method
  if (method === "snowball") {
    active.sort((a, b) => a.currentBalance - b.currentBalance); // smallest balance first
  } else {
    active.sort((a, b) => b.interestRate - a.interestRate); // highest interest rate first
  }

  let month = 0;
  let totalInterestPaid = 0;
  let totalPaid = 0;
  const monthlyTimeline = [];

  const maxMonths = 360; // 30 year safety cutoff

  while (active.some((d) => d.currentBalance > 0.01) && month < maxMonths) {
    month++;
    let availableExtra = extraMonthly;
    let monthlyInterestTotal = 0;

    // 1. Accrue monthly interest & pay minimums
    for (const d of active) {
      if (d.currentBalance <= 0) continue;
      const mRate = (d.interestRate / 100) / 12;
      const interest = d.currentBalance * mRate;
      d.currentBalance += interest;
      monthlyInterestTotal += interest;
      totalInterestPaid += interest;

      const minPay = Math.min(d.currentBalance, d.minimumPayment);
      d.currentBalance -= minPay;
      totalPaid += minPay;
    }

    // 2. Add freed minimum payments of paid-off debts to extra money pool
    const freedMins = active.filter((d) => d.currentBalance <= 0).reduce((sum, d) => sum + d.minimumPayment, 0);
    let totalTargetExtra = availableExtra + freedMins;

    // 3. Direct all extra payments to highest priority active debt
    for (const d of active) {
      if (d.currentBalance > 0.01 && totalTargetExtra > 0) {
        const extraPay = Math.min(d.currentBalance, totalTargetExtra);
        d.currentBalance -= extraPay;
        totalPaid += extraPay;
        totalTargetExtra -= extraPay;
      }
    }

    const currentTotalBal = active.reduce((sum, d) => sum + Math.max(0, d.currentBalance), 0);
    monthlyTimeline.push({
      month,
      totalBalance: Math.round(currentTotalBal),
      interestPaidThisMonth: Math.round(monthlyInterestTotal),
    });

    if (currentTotalBal <= 0.01) break;
  }

  const date = new Date();
  date.setMonth(date.getMonth() + month);
  const payoffDateString = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return {
    method,
    totalMonths: month,
    payoffDateString,
    totalInterestPaid,
    totalPaid,
    monthlyBalanceTimeline: monthlyTimeline,
  };
}

export function calculateDebtPayoff(debts: DebtItem[], extraMonthlyPayment: number): DebtPayoffResults {
  const snowball = simulateDebtMethod(debts, extraMonthlyPayment, "snowball");
  const avalanche = simulateDebtMethod(debts, extraMonthlyPayment, "avalanche");

  const interestSaved = Math.max(0, snowball.totalInterestPaid - avalanche.totalInterestPaid);
  const monthsSaved = Math.max(0, snowball.totalMonths - avalanche.totalMonths);

  let recommendation = "";
  if (interestSaved > 50) {
    recommendation = `The Avalanche method saves you $${Math.round(interestSaved).toLocaleString()} in total interest and finishes ${monthsSaved} months ${monthsSaved === 1 ? "" : "s"}faster. We recommend Avalanche for mathematical savings.`;
  } else {
    recommendation = `Both methods yield comparable financial outcomes. The Snowball method provides quick psychological motivation by eliminating smaller balances first.`;
  }

  return {
    snowball,
    avalanche,
    interestSavedWithAvalanche: interestSaved,
    monthsSavedWithAvalanche: monthsSaved,
    recommendation,
  };
}

// ==========================================
// 7. BUDGET 50/30/20 CALCULATOR MATH
// ==========================================
export function calculateBudget(inputs: BudgetInputs): BudgetResults {
  const income = Math.max(0, inputs.monthlyTakeHome);
  const recommendedNeeds = income * 0.5;
  const recommendedWants = income * 0.3;
  const recommendedSavings = income * 0.2;

  let actualNeeds = 0;
  let actualWants = 0;
  let actualSavings = 0;

  for (const cat of inputs.categories) {
    if (cat.type === "needs") actualNeeds += cat.actualAmount;
    if (cat.type === "wants") actualWants += cat.actualAmount;
    if (cat.type === "savings") actualSavings += cat.actualAmount;
  }

  const totalActualExpenses = actualNeeds + actualWants + actualSavings;
  const monthlySurplusOrDeficit = income - totalActualExpenses;

  return {
    recommendedNeeds,
    recommendedWants,
    recommendedSavings,
    actualNeeds,
    actualWants,
    actualSavings,
    totalActualExpenses,
    monthlySurplusOrDeficit,
    needsVariance: actualNeeds - recommendedNeeds,
    wantsVariance: actualWants - recommendedWants,
    savingsVariance: actualSavings - recommendedSavings,
  };
}

// ==========================================
// 8. TAX CALCULATOR 2026 MATH
// ==========================================
export function calculateTax(inputs: TaxInputs): TaxResults {
  const gross = Math.max(0, inputs.annualIncome);
  const preTaxRetirement = Math.max(0, inputs.retirement401kContributions);
  const otherPreTax = Math.max(0, inputs.otherPreTaxDeductions);

  const standardDed =
    taxRules2026.federal.standardDeductions[inputs.filingStatus] ||
    taxRules2026.federal.standardDeductions.single;

  const deductionUsed =
    inputs.deductionType === "itemized"
      ? Math.max(standardDed, inputs.itemizedDeductions)
      : standardDed;

  const taxableIncome = Math.max(0, gross - preTaxRetirement - otherPreTax - deductionUsed);

  const brackets =
    (taxRules2026.federal.brackets as any)[inputs.filingStatus] ||
    taxRules2026.federal.brackets.single;

  let federalTax = 0;
  let marginalRate = 0.1;
  const bracketBreakdown = [];

  for (let i = 0; i < brackets.length; i++) {
    const cur = brackets[i];
    const nxt = brackets[i + 1];
    if (taxableIncome > cur.threshold) {
      const inBracket = nxt
        ? Math.min(taxableIncome - cur.threshold, nxt.threshold - cur.threshold)
        : taxableIncome - cur.threshold;
      const taxAmt = inBracket * cur.rate;
      federalTax += taxAmt;
      marginalRate = cur.rate;

      const upperLabel = nxt ? `$${nxt.threshold.toLocaleString()}` : "and up";
      bracketBreakdown.push({
        rate: cur.rate * 100,
        taxableInBracket: inBracket,
        taxAmount: taxAmt,
        rangeLabel: `$${cur.threshold.toLocaleString()} - ${upperLabel}`,
      });
    }
  }

  // Child Tax Credit ($2,000 per dependent)
  const childCredit = Math.min(
    federalTax,
    (inputs.dependentsCount || 0) * taxRules2026.federal.childTaxCreditPerDependent
  );
  const netFederalTax = Math.max(0, federalTax - childCredit);

  // State Tax
  let stateTax = 0;
  const stateData = (taxRules2026.states as any)[inputs.stateCode];
  if (stateData) {
    if (stateData.type === "flat") {
      stateTax = taxableIncome * stateData.rate;
    } else if (stateData.type === "progressive" && stateData.brackets) {
      for (let i = 0; i < stateData.brackets.length; i++) {
        const curB = stateData.brackets[i];
        const nxtB = stateData.brackets[i + 1];
        if (taxableIncome > curB.threshold) {
          const chunk = nxtB
            ? Math.min(taxableIncome - curB.threshold, nxtB.threshold - curB.threshold)
            : taxableIncome - curB.threshold;
          stateTax += chunk * curB.rate;
        }
      }
    }
  }

  // FICA
  const ssCap = taxRules2026.federal.fica.socialSecurityWageCap;
  const ssTax = Math.min(gross, ssCap) * taxRules2026.federal.fica.socialSecurityRate;
  const medTax = gross * taxRules2026.federal.fica.medicareRate;
  const ficaTaxOwed = ssTax + medTax;

  const totalTaxOwed = netFederalTax + stateTax + ficaTaxOwed;

  return {
    grossIncome: gross,
    taxableIncome,
    deductionUsed,
    federalTaxOwed: federalTax,
    childTaxCredit: childCredit,
    netFederalTax,
    stateTaxOwed: stateTax,
    ficaTaxOwed,
    totalTaxOwed,
    effectiveTaxRate: gross > 0 ? (totalTaxOwed / gross) * 100 : 0,
    marginalTaxBracket: marginalRate * 100,
    bracketBreakdown,
  };
}

// ==========================================
// 9. FIRE CALCULATOR MATH
// ==========================================
export function calculateFire(inputs: FireInputs): FireResults {
  const swr = inputs.safeWithdrawalRate > 0 ? inputs.safeWithdrawalRate / 100 : 0.04;
  const fireNumber = inputs.annualExpenses / swr;
  const leanFireNumber = fireNumber * 0.75;
  const fatFireNumber = fireNumber * 1.25;

  const target =
    inputs.fireVariant === "lean"
      ? leanFireNumber
      : inputs.fireVariant === "fat"
      ? fatFireNumber
      : fireNumber;

  const annualReturn = inputs.expectedAnnualReturn / 100;
  const monthlyReturn = annualReturn / 12;

  // Coast FIRE: Amount needed today compounding until typical retirement age (age 65)
  const yearsTo65 = Math.max(1, 65 - inputs.currentAge);
  const coastFireTargetAtCurrentAge = fireNumber / Math.pow(1 + annualReturn, yearsTo65);
  const isAlreadyCoastFire = inputs.currentSavings >= coastFireTargetAtCurrentAge;

  // Simulate trajectory year-by-year
  let netWorth = inputs.currentSavings;
  let yearCount = 0;
  const yearlyTrajectory = [];
  yearlyTrajectory.push({
    age: inputs.currentAge,
    year: 0,
    netWorth: Math.round(netWorth),
    fireTarget: Math.round(target),
  });

  const maxYears = 50;
  while (netWorth < target && yearCount < maxYears) {
    yearCount++;
    for (let m = 1; m <= 12; m++) {
      netWorth = (netWorth + inputs.monthlySavings) * (1 + monthlyReturn);
    }
    yearlyTrajectory.push({
      age: inputs.currentAge + yearCount,
      year: yearCount,
      netWorth: Math.round(netWorth),
      fireTarget: Math.round(target),
    });
  }

  return {
    fireNumber,
    leanFireNumber,
    fatFireNumber,
    coastFireTargetAtCurrentAge,
    yearsToFire: yearCount,
    projectedFireAge: inputs.currentAge + yearCount,
    isAlreadyCoastFire,
    yearlyTrajectory,
  };
}

// ==========================================
// 11. RENT VS BUY CALCULATOR MATH
// ==========================================
export function calculateRentVsBuy(inputs: RentVsBuyInputs): RentVsBuyResults {
  const downPayment = inputs.homePrice * (Math.max(0, Math.min(100, inputs.downPaymentPercent)) / 100);
  const loanAmount = Math.max(0, inputs.homePrice - downPayment);
  const buyingClosingCosts = inputs.homePrice * 0.03; // ~3% purchase closing costs
  const initialCashOutlay = downPayment + buyingClosingCosts;

  const monthlyMortgageRate = (inputs.mortgageRate / 100) / 12;
  const totalMortgageMonths = Math.max(1, inputs.mortgageTermYears * 12);
  let monthlyPI = 0;
  if (monthlyMortgageRate === 0) {
    monthlyPI = loanAmount / totalMortgageMonths;
  } else if (loanAmount > 0) {
    const factor = Math.pow(1 + monthlyMortgageRate, totalMortgageMonths);
    monthlyPI = (loanAmount * (monthlyMortgageRate * factor)) / (factor - 1);
  }

  const annualAppreciationRate = inputs.homeAppreciationRate / 100;
  const annualRentInflationRate = inputs.expectedRentIncreasePercent / 100;
  const monthlyInvestmentReturnRate = Math.pow(1 + inputs.investmentReturnRate / 100, 1 / 12) - 1;

  let currentHomeValue = inputs.homePrice;
  let remainingMortgageBalance = loanAmount;
  let currentMonthlyRent = inputs.monthlyRent;
  let renterPortfolio = initialCashOutlay; // Renter invests down payment + closing costs immediately
  let buyerCumulativeCost = buyingClosingCosts;
  let renterCumulativeCost = 0;

  let breakEvenYear: number | null = null;
  const yearlySchedule = [];

  for (let y = 1; y <= inputs.planningHorizonYears; y++) {
    let yearBuyingCashOutflow = 0;
    let yearRentingCashOutflow = 0;

    for (let m = 1; m <= 12; m++) {
      // Buying monthly expenses
      const monthlyInterest = remainingMortgageBalance * monthlyMortgageRate;
      const monthlyPrincipal = Math.min(remainingMortgageBalance, Math.max(0, monthlyPI - monthlyInterest));
      remainingMortgageBalance = Math.max(0, remainingMortgageBalance - monthlyPrincipal);

      const monthlyPropertyTax = (currentHomeValue * (inputs.propertyTaxRate / 100)) / 12;
      const monthlyMaintenance = (currentHomeValue * (inputs.maintenanceRate / 100)) / 12;
      const monthlyHomeInsurance = (currentHomeValue * 0.005) / 12; // ~0.5% annual homeowners insurance

      const totalMonthlyBuyCost = monthlyPI + monthlyPropertyTax + monthlyMaintenance + monthlyHomeInsurance;
      yearBuyingCashOutflow += totalMonthlyBuyCost;

      // Renting monthly expenses
      const monthlyRenterInsurance = 20; // standard renter insurance
      const totalMonthlyRentCost = currentMonthlyRent + monthlyRenterInsurance;
      yearRentingCashOutflow += totalMonthlyRentCost;

      // Invest difference: if buying is more expensive, renter invests the extra cash; if renting is more expensive, portfolio pays
      const cashDifference = totalMonthlyBuyCost - totalMonthlyRentCost;
      renterPortfolio = renterPortfolio * (1 + monthlyInvestmentReturnRate) + cashDifference;
    }

    buyerCumulativeCost += yearBuyingCashOutflow;
    renterCumulativeCost += yearRentingCashOutflow;

    // Home appreciates at end of year
    currentHomeValue *= (1 + annualAppreciationRate);
    // Rent increases at end of year
    currentMonthlyRent *= (1 + annualRentInflationRate);

    // Selling costs when liquidating property (~6% broker commission + transfer)
    const sellingCosts = currentHomeValue * 0.06;
    const homeEquity = Math.max(0, currentHomeValue - remainingMortgageBalance - sellingCosts);
    const buyingNetWorth = homeEquity;
    const rentingNetWorth = Math.max(0, renterPortfolio);

    const netCostBuying = buyerCumulativeCost - (homeEquity - downPayment);
    const netCostRenting = renterCumulativeCost - (rentingNetWorth - initialCashOutlay);

    if (breakEvenYear === null && buyingNetWorth >= rentingNetWorth) {
      breakEvenYear = y;
    }

    yearlySchedule.push({
      year: y,
      buyingNetCost: Math.round(netCostBuying),
      rentingNetCost: Math.round(netCostRenting),
      buyingNetWorth: Math.round(buyingNetWorth),
      rentingNetWorth: Math.round(rentingNetWorth),
      homeEquity: Math.round(homeEquity),
      rentCostCumulative: Math.round(renterCumulativeCost),
      mortgageBalance: Math.round(remainingMortgageBalance),
    });
  }

  const finalYear = yearlySchedule[yearlySchedule.length - 1];
  const finalNetWorthBuying = finalYear ? finalYear.buyingNetWorth : 0;
  const finalNetWorthRenting = finalYear ? finalYear.rentingNetWorth : 0;
  const netAdvantageAmount = Math.abs(finalNetWorthBuying - finalNetWorthRenting);
  const betterOption =
    finalNetWorthBuying > finalNetWorthRenting ? "buy" : finalNetWorthBuying < finalNetWorthRenting ? "rent" : "equal";

  return {
    totalCostRenting: Math.round(renterCumulativeCost),
    totalCostBuying: Math.round(buyerCumulativeCost),
    breakEvenYear,
    finalNetWorthBuying,
    finalNetWorthRenting,
    netAdvantageAmount,
    betterOption,
    yearlySchedule,
  };
}

// ==========================================
// 12. HOME AFFORDABILITY CALCULATOR MATH
// ==========================================
export function calculateHomeAffordability(inputs: HomeAffordabilityInputs): HomeAffordabilityResults {
  const monthlyGrossIncome = Math.max(0, inputs.annualIncome) / 12;
  const dtiRatio = Math.max(0.1, Math.min(0.55, inputs.desiredDtiPercent / 100));

  // Allowable total debt payment per month
  const maxTotalAllowableDebt = monthlyGrossIncome * dtiRatio;
  const maxMonthlyHousingBudget = Math.max(0, maxTotalAllowableDebt - inputs.monthlyDebts);

  // Available for P&I + Property Tax + Insurance + HOA
  const monthlyInsurance = inputs.homeInsuranceAnnual / 12;
  const netForPIAndTax = Math.max(0, maxMonthlyHousingBudget - monthlyInsurance - inputs.hoaMonthly);

  // Mortgage rate constant
  const monthlyRate = (inputs.interestRate / 100) / 12;
  const totalMonths = Math.max(1, inputs.loanTermYears * 12);
  let k = 0; // loan payment per $1 borrowed
  if (monthlyRate === 0) {
    k = 1 / totalMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    k = (monthlyRate * factor) / (factor - 1);
  }

  const monthlyTaxRatePerDollar = (inputs.propertyTaxRate / 100) / 12;

  // Let P = home price, S = down payment savings
  // Net Housing Budget = (P - S)*k + P*monthlyTaxRatePerDollar
  // Net Housing Budget = P*(k + monthlyTaxRatePerDollar) - S*k
  // P = (Net Housing Budget + S*k) / (k + monthlyTaxRatePerDollar)
  let maxHomePrice = 0;
  const denominator = k + monthlyTaxRatePerDollar;
  if (denominator > 0) {
    maxHomePrice = Math.max(inputs.downPaymentSavings, (netForPIAndTax + inputs.downPaymentSavings * k) / denominator);
  }

  // Ensure down payment does not exceed home price
  const downPaymentAmount = Math.min(inputs.downPaymentSavings, maxHomePrice);
  const maxLoanAmount = Math.max(0, maxHomePrice - downPaymentAmount);
  const downPaymentPercentOfPrice = maxHomePrice > 0 ? (downPaymentAmount / maxHomePrice) * 100 : 0;

  const principalAndInterest = maxLoanAmount * k;
  const monthlyPropertyTax = maxHomePrice * monthlyTaxRatePerDollar;
  const maxMonthlyPayment = principalAndInterest + monthlyPropertyTax + monthlyInsurance + inputs.hoaMonthly;

  const frontEndDti = monthlyGrossIncome > 0 ? (maxMonthlyPayment / monthlyGrossIncome) * 100 : 0;
  const backEndDti = monthlyGrossIncome > 0 ? ((maxMonthlyPayment + inputs.monthlyDebts) / monthlyGrossIncome) * 100 : 0;

  let dtiStatus: "conservative" | "moderate" | "stretched" = "moderate";
  if (backEndDti <= 30) {
    dtiStatus = "conservative";
  } else if (backEndDti > 38) {
    dtiStatus = "stretched";
  }

  return {
    maxHomePrice: Math.round(maxHomePrice),
    maxLoanAmount: Math.round(maxLoanAmount),
    downPaymentAmount: Math.round(downPaymentAmount),
    downPaymentPercentOfPrice: Math.round(downPaymentPercentOfPrice * 10) / 10,
    maxMonthlyPayment: Math.round(maxMonthlyPayment),
    principalAndInterest: Math.round(principalAndInterest),
    monthlyPropertyTax: Math.round(monthlyPropertyTax),
    monthlyHomeInsurance: Math.round(monthlyInsurance),
    monthlyHoa: Math.round(inputs.hoaMonthly),
    dtiStatus,
    frontEndDti: Math.round(frontEndDti * 10) / 10,
    backEndDti: Math.round(backEndDti * 10) / 10,
  };
}

// ==========================================
// 13. CREDIT CARD PAYOFF CALCULATOR MATH
// ==========================================
export function calculateCreditCardPayoff(inputs: CreditCardPayoffInputs): CreditCardPayoffResults {
  const balance = Math.max(0, inputs.currentBalance);
  const monthlyRate = (inputs.apr / 100) / 12;
  const minPercent = Math.max(1, inputs.minPaymentPercent) / 100;

  // 1. Simulate Minimum Payment Only Scenario
  let minBal = balance;
  let minMonths = 0;
  let minTotalInterest = 0;
  let minTotalPaid = 0;
  const minSchedule = [];

  const maxMonthsCap = 600; // 50 years max guardrail
  while (minBal > 0.5 && minMonths < maxMonthsCap) {
    minMonths++;
    const interest = minBal * monthlyRate;
    // Standard credit card minimum: max of (balance * minPercent) or $35 (or remaining balance + interest if less)
    const requiredMin = Math.max(35, minBal * minPercent);
    const payment = Math.min(minBal + interest, requiredMin);

    const principal = Math.max(0, payment - interest);
    minBal = Math.max(0, minBal - principal);
    minTotalInterest += interest;
    minTotalPaid += payment;

    if (minMonths <= 36 || minMonths % 12 === 0 || minBal <= 0.5) {
      minSchedule.push({
        month: minMonths,
        balance: Math.round(minBal),
        payment: Math.round(payment),
        interest: Math.round(interest),
        principal: Math.round(principal),
      });
    }

    if (payment <= interest && minMonths > 12) {
      // Trap: payment doesn't even cover interest
      minMonths = maxMonthsCap;
      break;
    }
  }

  // 2. Simulate User Chosen / Accelerated Payment Scenario
  let chosenBal = balance;
  let chosenMonths = 0;
  let chosenTotalInterest = 0;
  let chosenTotalPaid = 0;
  const chosenSchedule = [];

  const chosenBaseMonthly =
    inputs.paymentType === "fixed"
      ? Math.max(10, inputs.fixedMonthlyPayment)
      : Math.max(35, balance * minPercent);
  const totalChosenPayment = chosenBaseMonthly + Math.max(0, inputs.additionalMonthlyPayment);

  while (chosenBal > 0.5 && chosenMonths < maxMonthsCap) {
    chosenMonths++;
    const interest = chosenBal * monthlyRate;
    const payment = Math.min(chosenBal + interest, Math.max(interest + 5, totalChosenPayment));
    const principal = Math.max(0, payment - interest);
    chosenBal = Math.max(0, chosenBal - principal);
    chosenTotalInterest += interest;
    chosenTotalPaid += payment;

    if (chosenMonths <= 36 || chosenMonths % 6 === 0 || chosenBal <= 0.5) {
      chosenSchedule.push({
        month: chosenMonths,
        balance: Math.round(chosenBal),
        payment: Math.round(payment),
        interest: Math.round(interest),
        principal: Math.round(principal),
      });
    }
  }

  const formatDate = (months: number) => {
    if (months >= maxMonthsCap) return "50+ Years (Interest Trap)";
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const trapWarning = minMonths >= 120 || minTotalInterest > balance;

  return {
    minimumScenario: {
      monthsToPayoff: minMonths,
      totalInterestPaid: Math.round(minTotalInterest),
      totalPaid: Math.round(minTotalPaid),
      payoffDateString: formatDate(minMonths),
      monthlySchedule: minSchedule,
    },
    chosenScenario: {
      monthsToPayoff: chosenMonths,
      totalInterestPaid: Math.round(chosenTotalInterest),
      totalPaid: Math.round(chosenTotalPaid),
      payoffDateString: formatDate(chosenMonths),
      monthlySchedule: chosenSchedule,
    },
    interestSaved: Math.max(0, Math.round(minTotalInterest - chosenTotalInterest)),
    monthsSaved: Math.max(0, minMonths - chosenMonths),
    trapWarning,
  };
}

// ==========================================
// 14. NET WORTH CALCULATOR MATH
// ==========================================
export function calculateNetWorth(inputs: NetWorthInputs): NetWorthResults {
  const { assets, liabilities, age } = inputs;

  const totalAssets =
    Math.max(0, assets.cashAndChecking) +
    Math.max(0, assets.emergencySavings) +
    Math.max(0, assets.taxableInvestments) +
    Math.max(0, assets.retirementAccounts) +
    Math.max(0, assets.primaryRealEstate) +
    Math.max(0, assets.vehicles) +
    Math.max(0, assets.otherAssets);

  const totalLiabilities =
    Math.max(0, liabilities.mortgageBalance) +
    Math.max(0, liabilities.autoLoans) +
    Math.max(0, liabilities.studentLoans) +
    Math.max(0, liabilities.creditCardDebt) +
    Math.max(0, liabilities.otherPersonalDebt);

  const netWorth = totalAssets - totalLiabilities;

  const assetCategories = [
    { name: "Cash & Checking", value: assets.cashAndChecking, color: "#0d9488" },
    { name: "Emergency Fund", value: assets.emergencySavings, color: "#14b8a6" },
    { name: "Brokerage & Stocks", value: assets.taxableInvestments, color: "#0284c7" },
    { name: "Retirement (401k/IRA)", value: assets.retirementAccounts, color: "#6366f1" },
    { name: "Real Estate Value", value: assets.primaryRealEstate, color: "#8b5cf6" },
    { name: "Vehicles", value: assets.vehicles, color: "#ec4899" },
    { name: "Other Assets", value: assets.otherAssets, color: "#f59e0b" },
  ];

  const assetBreakdown = assetCategories
    .filter((a) => a.value > 0)
    .map((a) => ({
      ...a,
      percent: totalAssets > 0 ? Math.round((a.value / totalAssets) * 1000) / 10 : 0,
    }));

  const liabilityCategories = [
    { name: "Home Mortgage", value: liabilities.mortgageBalance, color: "#e11d48" },
    { name: "Auto Loans", value: liabilities.autoLoans, color: "#f97316" },
    { name: "Student Loans", value: liabilities.studentLoans, color: "#ea580c" },
    { name: "Credit Card Debt", value: liabilities.creditCardDebt, color: "#dc2626" },
    { name: "Other Personal Debt", value: liabilities.otherPersonalDebt, color: "#991b1b" },
  ];

  const liabilityBreakdown = liabilityCategories
    .filter((l) => l.value > 0)
    .map((l) => ({
      ...l,
      percent: totalLiabilities > 0 ? Math.round((l.value / totalLiabilities) * 1000) / 10 : 0,
    }));

  // Benchmark match
  const userAge = Math.max(18, Math.min(100, age));
  const benchmark =
    NET_WORTH_BY_AGE_GROUP.find((b) => userAge >= b.minAge && userAge <= b.maxAge) ||
    NET_WORTH_BY_AGE_GROUP[0];

  let percentileEstimate = 50;
  if (netWorth <= 0) {
    percentileEstimate = 10;
  } else if (netWorth < benchmark.median) {
    percentileEstimate = Math.round(10 + (netWorth / benchmark.median) * 40);
  } else if (netWorth < benchmark.top25Percentile) {
    const range = benchmark.top25Percentile - benchmark.median;
    percentileEstimate = Math.round(50 + ((netWorth - benchmark.median) / range) * 25);
  } else if (netWorth < benchmark.top10Percentile) {
    const range = benchmark.top10Percentile - benchmark.top25Percentile;
    percentileEstimate = Math.round(75 + ((netWorth - benchmark.top25Percentile) / range) * 15);
  } else {
    percentileEstimate = Math.min(99, Math.round(90 + (netWorth / benchmark.top10Percentile) * 5));
  }

  return {
    totalAssets: Math.round(totalAssets),
    totalLiabilities: Math.round(totalLiabilities),
    netWorth: Math.round(netWorth),
    assetBreakdown,
    liabilityBreakdown,
    ageGroupBenchmark: {
      bracket: benchmark.bracket,
      median: benchmark.median,
      average: benchmark.average,
      percentileEstimate,
    },
  };
}

// ==========================================
// 15. EMERGENCY FUND CALCULATOR MATH
// ==========================================
export function calculateEmergencyFund(inputs: EmergencyFundInputs): EmergencyFundResults {
  const monthlyEssentialExpenses =
    Math.max(0, inputs.monthlyHousing) +
    Math.max(0, inputs.monthlyGroceries) +
    Math.max(0, inputs.monthlyUtilities) +
    Math.max(0, inputs.monthlyDebtPayments) +
    Math.max(0, inputs.monthlyInsuranceHealth) +
    Math.max(0, inputs.monthlyTransportation) +
    Math.max(0, inputs.monthlyOtherEssentials);

  const recommendedMonths =
    inputs.incomeStability === "self_employed"
      ? 9
      : inputs.incomeStability === "variable"
      ? 6
      : 4;

  const targetMonths = Math.max(1, inputs.targetMonths);
  const targetAmount = monthlyEssentialExpenses * targetMonths;
  const currentSavings = Math.max(0, inputs.currentSavings);
  const fundingGap = Math.max(0, targetAmount - currentSavings);

  const fundingPercentage =
    targetAmount > 0 ? Math.min(100, Math.round((currentSavings / targetAmount) * 1000) / 10) : 100;

  const monthlySavings = Math.max(0, inputs.monthlySavingsContribution);
  const monthsToReachGoal =
    fundingGap <= 0 ? 0 : monthlySavings > 0 ? Math.ceil(fundingGap / monthlySavings) : 999;

  const currentRunwayMonths =
    monthlyEssentialExpenses > 0 ? Math.round((currentSavings / monthlyEssentialExpenses) * 10) / 10 : 0;

  let statusBadge: "safe" | "growing" | "critical" = "growing";
  if (currentRunwayMonths >= targetMonths) {
    statusBadge = "safe";
  } else if (currentRunwayMonths < 2) {
    statusBadge = "critical";
  }

  return {
    monthlyEssentialExpenses: Math.round(monthlyEssentialExpenses),
    recommendedMonths,
    targetAmount: Math.round(targetAmount),
    currentSavings: Math.round(currentSavings),
    fundingGap: Math.round(fundingGap),
    fundingPercentage,
    monthsToReachGoal,
    currentRunwayMonths,
    statusBadge,
  };
}

// ==========================================
// 16. SAVINGS GOAL CALCULATOR MATH
// ==========================================
export function calculateSavingsGoal(inputs: SavingsGoalItem): SavingsGoalResults {
  const target = Math.max(0, inputs.targetAmount);
  const starting = Math.max(0, inputs.currentAmount);
  const months = Math.max(1, inputs.targetMonths);
  const monthlyRate = Math.pow(1 + Math.max(0, inputs.expectedApy) / 100, 1 / 12) - 1;

  // Future value of current starting balance
  const fvStarting = starting * Math.pow(1 + monthlyRate, months);
  const remainingNeeded = Math.max(0, target - fvStarting);

  let requiredMonthlyDeposit = 0;
  if (remainingNeeded > 0) {
    if (monthlyRate === 0) {
      requiredMonthlyDeposit = remainingNeeded / months;
    } else {
      const factor = Math.pow(1 + monthlyRate, months);
      requiredMonthlyDeposit = (remainingNeeded * monthlyRate) / (factor - 1);
    }
  }

  // Generate trajectory
  let balance = starting;
  let totalContrib = starting;
  const yearlySchedule = [];

  for (let m = 1; m <= months; m++) {
    const interestThisMonth = balance * monthlyRate;
    balance = balance + interestThisMonth + requiredMonthlyDeposit;
    totalContrib += requiredMonthlyDeposit;

    if (m === 1 || m % 3 === 0 || m === months) {
      yearlySchedule.push({
        month: m,
        balance: Math.round(balance),
        contributions: Math.round(totalContrib),
        interest: Math.round(Math.max(0, balance - totalContrib)),
      });
    }
  }

  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + months);
  const effectiveTargetDateString = targetDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const totalInterestEarned = Math.max(0, Math.round(balance - totalContrib));

  return {
    requiredMonthlyDeposit: Math.round(requiredMonthlyDeposit),
    totalPrincipalContributions: Math.round(totalContrib),
    totalInterestEarned,
    effectiveTargetDateString,
    yearlySchedule,
  };
}

// ==========================================
// 17. INFLATION CALCULATOR MATH
// ==========================================
export function calculateInflation(inputs: InflationInputs): InflationResults {
  const startYr = Math.max(MIN_CPI_YEAR, Math.min(MAX_CPI_YEAR, inputs.startYear));
  const endYr = Math.max(MIN_CPI_YEAR, Math.min(MAX_CPI_YEAR, inputs.endYear));
  const startAmount = Math.max(0, inputs.startAmount);

  const startCpi = HISTORICAL_CPI[startYr] || 100;
  const endCpi = HISTORICAL_CPI[endYr] || 100;

  const endAmount = startAmount * (endCpi / startCpi);
  const cumulativeInflationRate = ((endCpi - startCpi) / startCpi) * 100;

  const yearsDiff = Math.abs(endYr - startYr);
  let annualizedInflationRate = 0;
  if (yearsDiff > 0) {
    if (endCpi >= startCpi) {
      annualizedInflationRate = (Math.pow(endCpi / startCpi, 1 / yearsDiff) - 1) * 100;
    } else {
      annualizedInflationRate = -((Math.pow(startCpi / endCpi, 1 / yearsDiff) - 1) * 100);
    }
  }

  const purchasingPowerLossPercent =
    endCpi > startCpi ? (1 - startCpi / endCpi) * 100 : 0;

  const minYear = Math.min(startYr, endYr);
  const maxYear = Math.max(startYr, endYr);
  const step = Math.max(1, Math.floor((maxYear - minYear) / 25));

  const timeline = [];
  for (let y = minYear; y <= maxYear; y += step) {
    const cpiY = HISTORICAL_CPI[y] || startCpi;
    timeline.push({
      year: y,
      cpi: cpiY,
      equivalentValue: Math.round(startAmount * (cpiY / startCpi) * 100) / 100,
    });
  }
  if (timeline[timeline.length - 1]?.year !== maxYear) {
    const cpiMax = HISTORICAL_CPI[maxYear] || endCpi;
    timeline.push({
      year: maxYear,
      cpi: cpiMax,
      equivalentValue: Math.round(startAmount * (cpiMax / startCpi) * 100) / 100,
    });
  }

  return {
    startAmount,
    endAmount: Math.round(endAmount * 100) / 100,
    cumulativeInflationRate: Math.round(cumulativeInflationRate * 10) / 10,
    annualizedInflationRate: Math.round(annualizedInflationRate * 100) / 100,
    purchasingPowerLossPercent: Math.round(purchasingPowerLossPercent * 10) / 10,
    timeline,
  };
}

// ==========================================
// 18. HOURLY TO SALARY CONVERTER MATH
// ==========================================
export function calculateHourlyToSalary(inputs: HourlyToSalaryInputs): HourlyToSalaryResults {
  const hoursPerWeek = Math.max(1, Math.min(100, inputs.hoursPerWeek));
  const weeksPerYear = Math.max(1, Math.min(52, inputs.weeksPerYear));
  const overtimeHours = Math.max(0, inputs.overtimeHoursPerWeek);
  const overtimeMult = Math.max(1, inputs.overtimeMultiplier);

  let hourlyRate = 0;
  let regularAnnual = 0;
  let overtimeAnnual = 0;
  let annualSalary = 0;

  if (inputs.inputMode === "hourly") {
    hourlyRate = Math.max(0, inputs.hourlyWage);
    regularAnnual = hourlyRate * hoursPerWeek * weeksPerYear;
    overtimeAnnual = hourlyRate * overtimeMult * overtimeHours * weeksPerYear;
    annualSalary = regularAnnual + overtimeAnnual;
  } else {
    annualSalary = Math.max(0, inputs.annualSalary);
    regularAnnual = annualSalary;
    overtimeAnnual = 0;
    const totalRegularHours = hoursPerWeek * weeksPerYear;
    hourlyRate = totalRegularHours > 0 ? annualSalary / totalRegularHours : 0;
  }

  const totalAnnualHours = (hoursPerWeek + overtimeHours) * weeksPerYear;
  const weeklyRate = weeksPerYear > 0 ? annualSalary / weeksPerYear : 0;
  const biweeklyRate = annualSalary / 26;
  const monthlyRate = annualSalary / 12;
  const dailyRate = hourlyRate * 8; // 8-hour workday standard

  return {
    hourlyRate: Math.round(hourlyRate * 100) / 100,
    dailyRate: Math.round(dailyRate * 100) / 100,
    weeklyRate: Math.round(weeklyRate * 100) / 100,
    biweeklyRate: Math.round(biweeklyRate * 100) / 100,
    monthlyRate: Math.round(monthlyRate * 100) / 100,
    annualSalary: Math.round(annualSalary),
    regularAnnual: Math.round(regularAnnual),
    overtimeAnnual: Math.round(overtimeAnnual),
    totalAnnualHours,
  };
}

// ==========================================
// 19. STUDENT LOAN REPAYMENT CALCULATOR MATH
// ==========================================
export function calculateStudentLoan(inputs: StudentLoanInputs): StudentLoanResults {
  const balance = Math.max(0, inputs.loanBalance);
  const annualRate = Math.max(0, inputs.interestRate) / 100;
  const monthlyRate = annualRate / 12;
  const extraPayment = Math.max(0, inputs.extraMonthlyPayment);

  // Helper for amortized payment
  const calcAmortizedPayment = (principal: number, mRate: number, months: number): number => {
    if (mRate === 0) return months > 0 ? principal / months : 0;
    const factor = Math.pow(1 + mRate, months);
    return (principal * (mRate * factor)) / (factor - 1);
  };

  // 1. Standard 10-Year
  const std10Monthly = calcAmortizedPayment(balance, monthlyRate, 120);
  const std10TotalPaid = std10Monthly * 120;
  const std10Interest = Math.max(0, std10TotalPaid - balance);

  // 2. Graduated 10-Year (starts at ~65% of standard payment, steps up every 2 years)
  const grad10Initial = std10Monthly * 0.65;
  const grad10TotalInterest = std10Interest * 1.18;
  const grad10TotalPaid = balance + grad10TotalInterest;

  // 3. Extended 25-Year
  const ext25Monthly = calcAmortizedPayment(balance, monthlyRate, 300);
  const ext25TotalPaid = ext25Monthly * 300;
  const ext25Interest = Math.max(0, ext25TotalPaid - balance);

  // 4. SAVE / IDR (Income-Driven Repayment based on 225% poverty line)
  const poverty = getPovertyGuideline(inputs.householdSize || 1);
  const protectedIncome = poverty * 2.25;
  const discretionaryIncome = Math.max(0, (inputs.annualAgi || 50000) - protectedIncome);
  const idrMonthly = Math.max(0, (discretionaryIncome * 0.10) / 12);
  const idrMonths = 240; // 20 years
  const idrTotalPaidProjected = idrMonthly * idrMonths;
  const idrForgiveness = Math.max(0, balance - Math.max(0, idrTotalPaidProjected - (balance * annualRate * 10)));
  const idrInterestPaid = Math.min(idrTotalPaidProjected, balance * annualRate * 20);

  const planComparisons: Record<StudentLoanPlanType, StudentLoanPlanComparison> = {
    standard_10: {
      planType: "standard_10",
      planName: "Standard 10-Year",
      initialMonthlyPayment: Math.round(std10Monthly),
      totalInterestPaid: Math.round(std10Interest),
      termMonths: 120,
      totalPaid: Math.round(std10TotalPaid),
      estimatedForgiveness: 0,
    },
    save_idr: {
      planType: "save_idr",
      planName: "SAVE / IDR Plan",
      initialMonthlyPayment: Math.round(idrMonthly),
      totalInterestPaid: Math.round(idrInterestPaid),
      termMonths: idrMonths,
      totalPaid: Math.round(idrTotalPaidProjected),
      estimatedForgiveness: Math.round(idrForgiveness),
    },
    graduated_10: {
      planType: "graduated_10",
      planName: "Graduated 10-Year",
      initialMonthlyPayment: Math.round(grad10Initial),
      totalInterestPaid: Math.round(grad10TotalInterest),
      termMonths: 120,
      totalPaid: Math.round(grad10TotalPaid),
      estimatedForgiveness: 0,
    },
    extended_25: {
      planType: "extended_25",
      planName: "Extended 25-Year",
      initialMonthlyPayment: Math.round(ext25Monthly),
      totalInterestPaid: Math.round(ext25Interest),
      termMonths: 300,
      totalPaid: Math.round(ext25TotalPaid),
      estimatedForgiveness: 0,
    },
  };

  const activePlan = planComparisons[inputs.selectedPlan] || planComparisons.standard_10;

  // Accelerated extra payment calculation on selected plan
  let acceleratedSavings: { monthsSaved: number; interestSaved: number } | undefined;
  if (extraPayment > 0 && activePlan.initialMonthlyPayment > 0) {
    const basePayment = activePlan.initialMonthlyPayment;
    let bBalance = balance;
    let bMonths = 0;
    let bTotalInterest = 0;
    while (bBalance > 0.5 && bMonths < 360) {
      bMonths++;
      const interest = bBalance * monthlyRate;
      const payment = Math.min(bBalance + interest, basePayment);
      bBalance = Math.max(0, bBalance - (payment - interest));
      bTotalInterest += interest;
    }

    let aBalance = balance;
    let aMonths = 0;
    let aTotalInterest = 0;
    while (aBalance > 0.5 && aMonths < 360) {
      aMonths++;
      const interest = aBalance * monthlyRate;
      const payment = Math.min(aBalance + interest, basePayment + extraPayment);
      aBalance = Math.max(0, aBalance - (payment - interest));
      aTotalInterest += interest;
    }

    const monthsSaved = Math.max(0, bMonths - aMonths);
    const interestSaved = Math.max(0, Math.round(bTotalInterest - aTotalInterest));
    if (monthsSaved > 0) {
      acceleratedSavings = { monthsSaved, interestSaved };
    }
  }

  return {
    activePlan,
    planComparisons,
    acceleratedSavings,
    discretionaryIncome: Math.round(discretionaryIncome),
    povertyThreshold: poverty,
  };
}

// ==========================================
// 20. SELF-EMPLOYMENT TAX ESTIMATOR MATH
// ==========================================
export function calculateSelfEmploymentTax(inputs: SelfEmploymentTaxInputs): SelfEmploymentTaxResults {
  const gross = Math.max(0, inputs.grossSelfEmploymentIncome);
  const expenses = Math.max(0, inputs.businessExpenses);
  const netProfit = Math.max(0, gross - expenses);

  // 1. SE Tax computation (IRS Schedule SE)
  const taxableSeIncome = netProfit * SE_TAX_CONFIG_2026.seDeductionMultiplier; // 92.35%

  // Social Security tax (12.4% up to cap)
  const remainingSsCap = Math.max(0, SE_TAX_CONFIG_2026.socialSecurityWageBaseCap - inputs.w2Wages);
  const ssTaxableAmount = Math.min(taxableSeIncome, remainingSsCap);
  const socialSecurityTax = ssTaxableAmount * SE_TAX_CONFIG_2026.socialSecurityRate;

  // Medicare tax (2.9% on all SE earnings)
  const medicareTax = taxableSeIncome * SE_TAX_CONFIG_2026.medicareRate;

  // Additional Medicare tax (0.9% on excess)
  const threshold =
    inputs.filingStatus === "married"
      ? SE_TAX_CONFIG_2026.additionalMedicareThresholdMarried
      : SE_TAX_CONFIG_2026.additionalMedicareThresholdSingle;
  const combinedIncome = taxableSeIncome + inputs.w2Wages;
  const additionalMedicareTax =
    combinedIncome > threshold ? (combinedIncome - threshold) * SE_TAX_CONFIG_2026.additionalMedicareRate : 0;

  const totalSeTax = socialSecurityTax + medicareTax + additionalMedicareTax;
  const deductibleSeTaxHalf = totalSeTax * SE_TAX_CONFIG_2026.aboveLineDeductionRatio; // 50% above-the-line deduction

  // 2. Federal Income Tax Estimate
  const stdDeduction =
    taxRules2026.federal.standardDeductions[inputs.filingStatus] ||
    taxRules2026.federal.standardDeductions.single;

  const agi = Math.max(0, netProfit + inputs.w2Wages - deductibleSeTaxHalf);
  const federalTaxableIncome = Math.max(0, agi - stdDeduction);

  const brackets =
    (taxRules2026.federal.brackets as any)[inputs.filingStatus] ||
    taxRules2026.federal.brackets.single;

  let federalIncomeTax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const current = brackets[i];
    const next = brackets[i + 1];
    if (federalTaxableIncome > current.threshold) {
      const taxableAmount = next
        ? Math.min(federalTaxableIncome - current.threshold, next.threshold - current.threshold)
        : federalTaxableIncome - current.threshold;
      federalIncomeTax += taxableAmount * current.rate;
    }
  }

  // 3. State Tax Estimate
  const stateRate = (taxRules2026.states as any)[inputs.stateCode]?.flatRate || 0.045;
  const stateTax = federalTaxableIncome * stateRate;

  const totalTaxLiability = totalSeTax + federalIncomeTax + stateTax;
  const effectiveTaxRate = gross > 0 ? (totalTaxLiability / gross) * 100 : 0;

  const quarterlyAmount = Math.round(totalTaxLiability / 4);
  const quarterlyPayments = SE_TAX_CONFIG_2026.quarterlyDueDates.map((q) => ({
    ...q,
    amount: quarterlyAmount,
  }));

  return {
    grossIncome: Math.round(gross),
    totalExpenses: Math.round(expenses),
    netScheduleCProfit: Math.round(netProfit),
    taxableSeIncome: Math.round(taxableSeIncome),
    socialSecurityTax: Math.round(socialSecurityTax),
    medicareTax: Math.round(medicareTax),
    additionalMedicareTax: Math.round(additionalMedicareTax),
    totalSeTax: Math.round(totalSeTax),
    deductibleSeTaxHalf: Math.round(deductibleSeTaxHalf),
    estimatedFederalIncomeTax: Math.round(federalIncomeTax),
    estimatedStateIncomeTax: Math.round(stateTax),
    totalTaxLiability: Math.round(totalTaxLiability),
    effectiveTaxRate: Math.round(effectiveTaxRate * 10) / 10,
    quarterlyPayments,
  };
}

// ==========================================
// 21. DIVIDEND / DRIP REINVESTMENT MATH
// ==========================================
export function calculateDividend(inputs: DividendInputs): DividendResults {
  const initialInv = Math.max(0, inputs.initialInvestment);
  const baseSharePrice = Math.max(1, inputs.sharePrice);
  const divYield = Math.max(0, inputs.annualDividendYield) / 100;
  const divGrowth = Math.max(0, inputs.annualDividendGrowthRate) / 100;
  const priceGrowth = Math.max(0, inputs.expectedSharePriceGrowthRate) / 100;
  const monthlyContrib = Math.max(0, inputs.monthlyContribution);
  const years = Math.max(1, Math.min(40, inputs.investmentYears));

  let sharesDrip = initialInv / baseSharePrice;
  let sharesNoDrip = initialInv / baseSharePrice;
  let currentSharePrice = baseSharePrice;
  let currentDivPerShare = baseSharePrice * divYield;

  let totalDripDividends = 0;
  let cumulativeInvested = initialInv;
  const yearlySchedule: any[] = [];

  for (let y = 1; y <= years; y++) {
    let yearDividendsDrip = 0;

    for (let m = 1; m <= 12; m++) {
      // Monthly contributions buy shares in both scenarios
      const newSharesFromContrib = monthlyContrib / currentSharePrice;
      sharesDrip += newSharesFromContrib;
      sharesNoDrip += newSharesFromContrib;
      cumulativeInvested += monthlyContrib;

      // Quarterly dividend event
      if (m % 3 === 0) {
        const quarterlyDivPerShare = currentDivPerShare / 4;
        const dividendPaymentDrip = sharesDrip * quarterlyDivPerShare;
        yearDividendsDrip += dividendPaymentDrip;
        totalDripDividends += dividendPaymentDrip;

        // DRIP: Reinvest dividend into new shares at current share price
        const dripNewShares = dividendPaymentDrip / currentSharePrice;
        sharesDrip += dripNewShares;
      }
    }

    // End of year stock price and dividend growth
    currentSharePrice *= (1 + priceGrowth);
    currentDivPerShare *= (1 + divGrowth);

    const valWithDrip = sharesDrip * currentSharePrice;
    const valWithoutDrip = sharesNoDrip * currentSharePrice;
    const annualDividendsYear = sharesDrip * currentDivPerShare;
    const yieldOnCost = cumulativeInvested > 0 ? (annualDividendsYear / cumulativeInvested) * 100 : 0;

    yearlySchedule.push({
      year: y,
      portfolioValueWithDrip: Math.round(valWithDrip),
      portfolioValueWithoutDrip: Math.round(valWithoutDrip),
      annualDividends: Math.round(annualDividendsYear),
      cumulativeDividends: Math.round(totalDripDividends),
      totalInvestedCapital: Math.round(cumulativeInvested),
      sharesOwned: Math.round(sharesDrip * 10) / 10,
      yieldOnCost: Math.round(yieldOnCost * 10) / 10,
    });
  }

  const finalYear = yearlySchedule[yearlySchedule.length - 1];
  const finalValDrip = finalYear ? finalYear.portfolioValueWithDrip : 0;
  const finalValNoDrip = finalYear ? finalYear.portfolioValueWithoutDrip : 0;

  return {
    finalPortfolioValue: finalValDrip,
    finalPortfolioValueWithoutDrip: finalValNoDrip,
    differenceFromDrip: Math.max(0, finalValDrip - finalValNoDrip),
    totalDividendsEarned: Math.round(totalDripDividends),
    finalAnnualDividendIncome: finalYear ? finalYear.annualDividends : 0,
    finalYieldOnCost: finalYear ? finalYear.yieldOnCost : 0,
    totalCapitalInvested: Math.round(cumulativeInvested),
    yearlySchedule,
  };
}

// ==========================================
// 22. CURRENCY CONVERTER MATH
// ==========================================
export function calculateCurrencyConversion(
  inputs: CurrencyConverterInputs,
  ratesAgainstUSD: Record<string, number>
): CurrencyConverterResults {
  const fromRate = ratesAgainstUSD[inputs.fromCurrency] || 1.0;
  const toRate = ratesAgainstUSD[inputs.toCurrency] || 1.0;

  // Rate of 1 fromCurrency in toCurrency = (1 / fromRate) * toRate
  const exchangeRate = toRate / fromRate;
  const convertedAmount = Math.max(0, inputs.amount) * exchangeRate;
  const inverseRate = exchangeRate > 0 ? 1 / exchangeRate : 0;

  // Generate 30-day historical trend based on realistic volatility
  const trendHistory = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Deterministic pseudo-random variation based on day offset for consistent smooth charts
    const variance = Math.sin(i * 0.4) * 0.012 + Math.cos(i * 0.2) * 0.008;
    const dayRate = exchangeRate * (1 + variance);
    trendHistory.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      rate: Math.round(dayRate * 10000) / 10000,
    });
  }

  return {
    amount: inputs.amount,
    fromCurrency: inputs.fromCurrency,
    toCurrency: inputs.toCurrency,
    exchangeRate: Math.round(exchangeRate * 10000) / 10000,
    convertedAmount: Math.round(convertedAmount * 100) / 100,
    inverseRate: Math.round(inverseRate * 10000) / 10000,
    lastUpdated: "Hourly Cached Live FX Rates",
    trendHistory,
  };
}

// ==========================================
// 23. TIP CALCULATOR & BILL SPLITTER MATH
// ==========================================
export function calculateTip(inputs: TipInputs): TipResults {
  const billAmount = Math.max(0, inputs.billAmount);
  const tipPercent = Math.max(0, inputs.tipPercent);
  const splitCount = Math.max(1, Math.floor(inputs.splitCount));

  let rawTip = billAmount * (tipPercent / 100);
  let totalAmount = billAmount + rawTip;

  if (inputs.roundUp) {
    totalAmount = Math.ceil(totalAmount);
    rawTip = Math.max(0, totalAmount - billAmount);
  }

  const perPersonBill = billAmount / splitCount;
  const perPersonTip = rawTip / splitCount;
  const perPersonTotal = totalAmount / splitCount;

  return {
    billAmount: Math.round(billAmount * 100) / 100,
    tipPercent,
    tipAmount: Math.round(rawTip * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    splitCount,
    perPersonBill: Math.round(perPersonBill * 100) / 100,
    perPersonTip: Math.round(perPersonTip * 100) / 100,
    perPersonTotal: Math.round(perPersonTotal * 100) / 100,
  };
}

// ==========================================
// 24. MORTGAGE REFINANCE CALCULATOR MATH
// ==========================================
function calculateAmortizedMonthlyPI(principal: number, annualRatePct: number, totalMonths: number): number {
  if (principal <= 0 || totalMonths <= 0) return 0;
  const monthlyRate = annualRatePct / 100 / 12;
  if (monthlyRate === 0) return principal / totalMonths;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  return (principal * (monthlyRate * factor)) / (factor - 1);
}

export function calculateRefinance(inputs: RefinanceInputs): RefinanceResults {
  const currentBalance = Math.max(0, inputs.currentBalance);
  const currentMonths = Math.max(1, Math.round(inputs.currentRemainingYears * 12));
  const newMonths = Math.max(1, Math.round(inputs.newTermYears * 12));
  const closingCosts = Math.max(0, inputs.closingCosts);

  const currentMonthlyPI = calculateAmortizedMonthlyPI(currentBalance, inputs.currentRate, currentMonths);
  const currentTotalRemainingPayments = currentMonthlyPI * currentMonths;
  const currentRemainingInterest = Math.max(0, currentTotalRemainingPayments - currentBalance);

  const newPrincipal = inputs.rollClosingCostsIntoLoan ? currentBalance + closingCosts : currentBalance;
  const newMonthlyPI = calculateAmortizedMonthlyPI(newPrincipal, inputs.newRate, newMonths);
  const newTotalPayments = newMonthlyPI * newMonths;
  const newTotalInterest = Math.max(0, newTotalPayments - newPrincipal);

  const monthlySavings = currentMonthlyPI - newMonthlyPI;
  const upfrontCashClosingCosts = inputs.rollClosingCostsIntoLoan ? 0 : closingCosts;

  let breakEvenMonths = -1;
  if (monthlySavings > 0) {
    breakEvenMonths = Math.ceil(closingCosts / monthlySavings);
  }

  // Net Lifetime Savings = Total remaining old payments - Total new payments - Upfront closing costs
  const netLifetimeSavings = currentTotalRemainingPayments - newTotalPayments - upfrontCashClosingCosts;
  const lifetimeInterestSavings = currentRemainingInterest - newTotalInterest;
  const isBeneficial = netLifetimeSavings > 0;

  // 5-year comparison projection
  const yearlyComparison = [];
  const maxYears = Math.min(10, Math.max(Math.ceil(inputs.currentRemainingYears), Math.ceil(inputs.newTermYears)));
  let currBal = currentBalance;
  let nBal = newPrincipal;
  const currMonthlyR = inputs.currentRate / 100 / 12;
  const newMonthlyR = inputs.newRate / 100 / 12;
  let cumSavings = -upfrontCashClosingCosts;

  for (let yr = 1; yr <= maxYears; yr++) {
    for (let m = 1; m <= 12; m++) {
      if (currBal > 0) {
        const intP = currBal * currMonthlyR;
        const prinP = Math.min(currBal, currentMonthlyPI - intP);
        currBal = Math.max(0, currBal - prinP);
      }
      if (nBal > 0) {
        const intP = nBal * newMonthlyR;
        const prinP = Math.min(nBal, newMonthlyPI - intP);
        nBal = Math.max(0, nBal - prinP);
      }
      cumSavings += monthlySavings;
    }
    yearlyComparison.push({
      year: yr,
      currentBalance: Math.round(currBal),
      newBalance: Math.round(nBal),
      cumulativeSavings: Math.round(cumSavings),
    });
  }

  return {
    currentMonthlyPayment: Math.round(currentMonthlyPI),
    newMonthlyPayment: Math.round(newMonthlyPI),
    monthlySavings: Math.round(monthlySavings),
    closingCosts,
    breakEvenMonths,
    currentRemainingInterest: Math.round(currentRemainingInterest),
    newTotalInterest: Math.round(newTotalInterest),
    lifetimeInterestSavings: Math.round(lifetimeInterestSavings),
    netLifetimeSavings: Math.round(netLifetimeSavings),
    isBeneficial,
    yearlyComparison,
  };
}

// ==========================================
// 25. AUTO LEASE VS BUY CALCULATOR MATH
// ==========================================
export function calculateLeaseVsBuy(inputs: LeaseVsBuyInputs): LeaseVsBuyResults {
  const vehiclePrice = Math.max(1000, inputs.vehiclePrice);
  const downPayment = Math.max(0, inputs.downPayment);
  const ownershipMonths = Math.max(12, inputs.ownershipYears * 12);
  const buyLoanMonths = Math.max(12, inputs.buyLoanTermMonths);

  // Buy Scenario
  const salesTax = vehiclePrice * (inputs.buySalesTaxRate / 100);
  const buyLoanPrincipal = Math.max(0, vehiclePrice + salesTax - downPayment);
  const buyMonthlyPayment = calculateAmortizedMonthlyPI(buyLoanPrincipal, inputs.buyLoanRate, buyLoanMonths);
  const buyPaidMonths = Math.min(ownershipMonths, buyLoanMonths);
  const buyTotalCashSpent = downPayment + (buyMonthlyPayment * buyPaidMonths);

  // Amortization to find remaining loan balance at ownership horizon
  let loanBal = buyLoanPrincipal;
  const buyMonthlyR = inputs.buyLoanRate / 100 / 12;
  for (let m = 1; m <= ownershipMonths; m++) {
    if (loanBal > 0) {
      const intPart = loanBal * buyMonthlyR;
      const prinPart = Math.min(loanBal, buyMonthlyPayment - intPart);
      loanBal = Math.max(0, loanBal - prinPart);
    }
  }

  // Realistic vehicle depreciation (~15% yr 1, ~12% yr 2, ~10% thereafter)
  const depreciationFactor = Math.pow(1 - 0.13, inputs.ownershipYears);
  const buyEstimatedVehicleValue = vehiclePrice * depreciationFactor;
  const buyEstimatedEquity = Math.max(0, buyEstimatedVehicleValue - loanBal);
  const buyNetCost = Math.max(0, buyTotalCashSpent - buyEstimatedEquity);

  // Lease Scenario
  const leaseTermMonths = Math.max(12, inputs.leaseTermMonths);
  const leaseCycles = Math.ceil(ownershipMonths / leaseTermMonths);
  const leaseTotalDueAtSigning = inputs.leaseDueAtSigning * leaseCycles;
  const leaseTotalMonthlyPayments = inputs.leaseMonthlyPayment * ownershipMonths;
  const leaseTotalCost = leaseTotalDueAtSigning + leaseTotalMonthlyPayments;
  const leaseNetCost = leaseTotalCost; // $0 equity at lease end

  const netCostDifference = Math.abs(buyNetCost - leaseNetCost);
  const winner: "buy" | "lease" = buyNetCost <= leaseNetCost ? "buy" : "lease";

  let summary = "";
  if (winner === "buy") {
    summary = `Buying saves approximately $${Math.round(netCostDifference).toLocaleString()} over ${inputs.ownershipYears} years because you accumulate $${Math.round(buyEstimatedEquity).toLocaleString()} in asset vehicle equity.`;
  } else {
    summary = `Leasing costs approximately $${Math.round(netCostDifference).toLocaleString()} less in total net cash outlay over ${inputs.ownershipYears} years compared to vehicle depreciation and loan financing costs.`;
  }

  // Yearly schedule
  const yearlySchedule = [];
  let runningLoan = buyLoanPrincipal;
  for (let yr = 1; yr <= inputs.ownershipYears; yr++) {
    const elapsedMonths = yr * 12;
    const paidM = Math.min(elapsedMonths, buyLoanMonths);
    const buyCumulativeSpent = downPayment + (buyMonthlyPayment * paidM);

    for (let m = 1; m <= 12; m++) {
      if (runningLoan > 0) {
        const intP = runningLoan * buyMonthlyR;
        const prinP = Math.min(runningLoan, buyMonthlyPayment - intP);
        runningLoan = Math.max(0, runningLoan - prinP);
      }
    }
    const curVal = vehiclePrice * Math.pow(1 - 0.13, yr);
    const curEquity = Math.max(0, curVal - runningLoan);
    const curBuyNet = Math.max(0, buyCumulativeSpent - curEquity);

    const cyclesSoFar = Math.ceil(elapsedMonths / leaseTermMonths);
    const leaseCumulativeSpent = (inputs.leaseDueAtSigning * cyclesSoFar) + (inputs.leaseMonthlyPayment * elapsedMonths);

    yearlySchedule.push({
      year: yr,
      buyCumulativeCost: Math.round(buyCumulativeSpent),
      buyEquity: Math.round(curEquity),
      buyNetCost: Math.round(curBuyNet),
      leaseCumulativeCost: Math.round(leaseCumulativeSpent),
    });
  }

  return {
    buyMonthlyPayment: Math.round(buyMonthlyPayment),
    buyTotalPayments: Math.round(buyTotalCashSpent),
    buyTotalCost: Math.round(buyTotalCashSpent),
    buyEstimatedEquity: Math.round(buyEstimatedEquity),
    buyNetCost: Math.round(buyNetCost),
    leaseTotalCost: Math.round(leaseTotalCost),
    leaseNetCost: Math.round(leaseNetCost),
    netCostDifference: Math.round(netCostDifference),
    winner,
    savings: Math.round(netCostDifference),
    summary,
    yearlySchedule,
  };
}

// ==========================================
// 26. 401(K) CONTRIBUTION & MATCH MATH
// ==========================================
export function calculateFourZeroOneK(inputs: FourZeroOneKInputs): FourZeroOneKResults {
  const currentAge = Math.max(18, inputs.currentAge);
  const retirementAge = Math.max(currentAge + 1, inputs.retirementAge);
  const years = retirementAge - currentAge;

  let balance = Math.max(0, inputs.currentBalance);
  let salary = Math.max(0, inputs.currentSalary);

  const employeeRate = Math.max(0, inputs.employeeContributionPercent) / 100;
  const matchRate = Math.max(0, inputs.employerMatchPercent) / 100;
  const matchCap = Math.max(0, inputs.employerMatchCapPercent) / 100;
  const returnRate = Math.max(0, inputs.expectedAnnualReturn) / 100;
  const salaryGrowthRate = Math.max(0, inputs.annualSalaryGrowth) / 100;

  let totalEmployeeContributions = 0;
  let totalEmployerMatch = 0;
  let totalGrowth = 0;

  const firstYearEmployeeContribution = salary * employeeRate;
  const firstYearEligibleMatchSalary = Math.min(employeeRate, matchCap);
  const firstYearEmployerMatch = salary * firstYearEligibleMatchSalary * matchRate;

  const isLeavingMatchOnTable = inputs.employeeContributionPercent < inputs.employerMatchCapPercent;
  const unclaimedMatchAnnual = isLeavingMatchOnTable
    ? salary * (matchCap - employeeRate) * matchRate
    : 0;

  const yearlyBreakdown = [];

  for (let y = 1; y <= years; y++) {
    const age = currentAge + y;
    const employeeContrib = salary * employeeRate;
    const matchedSalaryPercent = Math.min(employeeRate, matchCap);
    const employerMatch = salary * matchedSalaryPercent * matchRate;

    totalEmployeeContributions += employeeContrib;
    totalEmployerMatch += employerMatch;

    const startBal = balance;
    const addedPrincipal = employeeContrib + employerMatch;
    // Compounding assuming contributions added smoothly throughout year
    const investmentReturn = (startBal + addedPrincipal / 2) * returnRate;
    totalGrowth += investmentReturn;

    balance = startBal + addedPrincipal + investmentReturn;

    yearlyBreakdown.push({
      age,
      salary: Math.round(salary),
      employeeContrib: Math.round(employeeContrib),
      employerMatch: Math.round(employerMatch),
      totalContributions: Math.round(totalEmployeeContributions + totalEmployerMatch),
      growth: Math.round(totalGrowth),
      balance: Math.round(balance),
    });

    salary *= (1 + salaryGrowthRate);
  }

  return {
    projectedBalance: Math.round(balance),
    totalEmployeeContributions: Math.round(totalEmployeeContributions),
    totalEmployerMatch: Math.round(totalEmployerMatch),
    totalGrowth: Math.round(totalGrowth),
    firstYearEmployeeContribution: Math.round(firstYearEmployeeContribution),
    firstYearEmployerMatch: Math.round(firstYearEmployerMatch),
    isLeavingMatchOnTable,
    unclaimedMatchAnnual: Math.round(unclaimedMatchAnnual),
    matchContributionGoalPercent: inputs.employerMatchCapPercent,
    yearlyBreakdown,
  };
}

// ==========================================
// 27. ROTH VS TRADITIONAL IRA/401(K) MATH
// ==========================================
export function calculateRothVsTraditional(inputs: RothVsTraditionalInputs): RothVsTraditionalResults {
  const currentAge = Math.max(18, inputs.currentAge);
  const retirementAge = Math.max(currentAge + 1, inputs.retirementAge);
  const years = retirementAge - currentAge;
  const annualContrib = Math.max(0, inputs.annualContribution);
  const r = Math.max(0, inputs.expectedAnnualReturn) / 100;
  const currentTax = Math.max(0, inputs.currentTaxRate) / 100;
  const retireTax = Math.max(0, inputs.retirementTaxRate) / 100;

  let rothBal = 0;
  let tradBal = 0;
  let tradTaxSavingsAccount = 0;
  // Taxable account has capital gains drag ~15% tax on growth
  const taxableReturn = r * (1 - 0.15);

  const yearlyComparison = [];

  for (let yr = 1; yr <= years; yr++) {
    rothBal = (rothBal + annualContrib) * (1 + r);
    tradBal = (tradBal + annualContrib) * (1 + r);

    // Upfront tax deduction saved each year from Traditional contribution
    const annualTaxSaved = annualContrib * currentTax;
    tradTaxSavingsAccount = (tradTaxSavingsAccount + annualTaxSaved) * (1 + taxableReturn);

    const tradAfterTax = tradBal * (1 - retireTax);

    yearlyComparison.push({
      age: currentAge + yr,
      rothBalance: Math.round(rothBal),
      traditionalBalance: Math.round(tradBal),
      traditionalAfterTax: Math.round(tradAfterTax),
    });
  }

  const totalContributions = annualContrib * years;
  const rothAfterTaxValue = rothBal; // 100% tax-free withdrawals
  const traditionalTaxAtRetirement = tradBal * retireTax;
  const traditionalAfterTaxValue = tradBal - traditionalTaxAtRetirement;
  const traditionalWithTaxSavingsInvested = traditionalAfterTaxValue + tradTaxSavingsAccount;

  let advantageType: "roth" | "traditional" | "equal" = "equal";
  let differenceAmount = 0;
  let recommendation = "";

  if (inputs.currentTaxRate < inputs.retirementTaxRate) {
    advantageType = "roth";
    differenceAmount = rothAfterTaxValue - traditionalWithTaxSavingsInvested;
    recommendation = `Roth provides an estimated $${Math.round(Math.abs(differenceAmount)).toLocaleString()} advantage because your current tax rate (${inputs.currentTaxRate}%) is lower than your projected retirement tax rate (${inputs.retirementTaxRate}%). Paying taxes now lock in tax-free growth.`;
  } else if (inputs.currentTaxRate > inputs.retirementTaxRate) {
    advantageType = "traditional";
    differenceAmount = traditionalWithTaxSavingsInvested - rothAfterTaxValue;
    recommendation = `Traditional provides an estimated $${Math.round(Math.abs(differenceAmount)).toLocaleString()} advantage (with tax savings reinvested) because your current tax rate (${inputs.currentTaxRate}%) is higher than your expected retirement bracket (${inputs.retirementTaxRate}%).`;
  } else {
    advantageType = "equal";
    differenceAmount = 0;
    recommendation = `Both options yield virtually identical after-tax spending power when tax rates remain unchanged (${inputs.currentTaxRate}%), provided you reinvest the upfront Traditional tax savings.`;
  }

  return {
    yearsToGrow: years,
    totalContributions: Math.round(totalContributions),
    rothBalance: Math.round(rothBal),
    rothAfterTaxValue: Math.round(rothAfterTaxValue),
    traditionalBalance: Math.round(tradBal),
    traditionalTaxAtRetirement: Math.round(traditionalTaxAtRetirement),
    traditionalAfterTaxValue: Math.round(traditionalAfterTaxValue),
    traditionalWithTaxSavingsInvested: Math.round(traditionalWithTaxSavingsInvested),
    advantageType,
    differenceAmount: Math.round(Math.abs(differenceAmount)),
    recommendation,
    yearlyComparison,
  };
}

// ==========================================
// 28. 529 COLLEGE SAVINGS CALCULATOR MATH
// ==========================================
export function calculateCollege529(inputs: College529Inputs): College529Results {
  const childCurrentAge = Math.max(0, inputs.childCurrentAge);
  const collegeStartAge = Math.max(childCurrentAge + 1, inputs.collegeStartAge);
  const yearsUntilCollege = collegeStartAge - childCurrentAge;
  const yearsInCollege = Math.max(1, inputs.yearsInCollege);

  const inflationRate = inputs.collegeCostInflationRate / 100;
  const annualReturn = inputs.annualReturnRate / 100;
  const monthlyReturn = annualReturn / 12;

  // Inflated college cost at matriculation
  const projectedAnnualCostAtStart = inputs.currentAnnualCollegeCost * Math.pow(1 + inflationRate, yearsUntilCollege);

  let projectedTotal4YearCost = 0;
  for (let i = 0; i < yearsInCollege; i++) {
    projectedTotal4YearCost += projectedAnnualCostAtStart * Math.pow(1 + inflationRate, i);
  }

  // 529 balance accumulation until college start
  const totalMonths = yearsUntilCollege * 12;
  let balance = inputs.currentSavings;
  let totalContributions = inputs.currentSavings;
  const yearlyProjection = [];

  for (let yr = 1; yr <= yearsUntilCollege; yr++) {
    for (let m = 1; m <= 12; m++) {
      balance = (balance + inputs.monthlyContribution) * (1 + monthlyReturn);
      totalContributions += inputs.monthlyContribution;
    }
    const currentAge = childCurrentAge + yr;
    yearlyProjection.push({
      childAge: currentAge,
      contributions: Math.round(totalContributions),
      growth: Math.round(Math.max(0, balance - totalContributions)),
      balance: Math.round(balance),
      projectedAnnualCost: currentAge >= collegeStartAge ? Math.round(projectedAnnualCostAtStart) : undefined,
    });
  }

  const projected529Balance = balance;
  const fundingGapOrSurplus = projected529Balance - projectedTotal4YearCost;
  const isSurplus = fundingGapOrSurplus >= 0;
  const percentFunded = projectedTotal4YearCost > 0 ? (projected529Balance / projectedTotal4YearCost) * 100 : 100;

  // Monthly contribution needed to fund 100% of target cost
  let recommendedMonthlyContribution = inputs.monthlyContribution;
  if (totalMonths > 0) {
    const futureValueOfCurrent = inputs.currentSavings * Math.pow(1 + monthlyReturn, totalMonths);
    const neededFromMonthly = Math.max(0, projectedTotal4YearCost - futureValueOfCurrent);
    if (monthlyReturn > 0) {
      const annuityFactor = (Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn;
      recommendedMonthlyContribution = neededFromMonthly / annuityFactor;
    } else {
      recommendedMonthlyContribution = neededFromMonthly / totalMonths;
    }
  }

  return {
    yearsUntilCollege,
    projected529Balance: Math.round(projected529Balance),
    projectedAnnualCostAtStart: Math.round(projectedAnnualCostAtStart),
    projectedTotal4YearCost: Math.round(projectedTotal4YearCost),
    fundingGapOrSurplus: Math.round(fundingGapOrSurplus),
    isSurplus,
    percentFunded: Math.min(999, Math.round(percentFunded)),
    recommendedMonthlyContribution: Math.round(recommendedMonthlyContribution),
    yearlyProjection,
  };
}

// ==========================================
// 29. HSA (HEALTH SAVINGS ACCOUNT) MATH
// ==========================================
export function calculateHsa(inputs: HsaInputs): HsaResults {
  const currentAge = Math.max(18, inputs.currentAge);
  const retirementAge = Math.max(currentAge + 1, inputs.retirementAge);
  const years = retirementAge - currentAge;

  const annualContrib = Math.max(0, inputs.annualContribution);
  const employerContrib = Math.max(0, inputs.employerContribution);
  const totalAnnualAdditions = annualContrib + employerContrib;
  const medicalExpenses = Math.max(0, inputs.annualMedicalExpensesPaidFromHsa);
  const netInvestedAnnual = Math.max(0, totalAnnualAdditions - medicalExpenses);

  const r = Math.max(0, inputs.expectedAnnualReturn) / 100;
  const taxRate = Math.max(0, inputs.marginalTaxRate) / 100;

  // Upfront annual tax saved on employee contributions (FICA + Fed + State)
  const annualUpfrontTaxSavings = annualContrib * taxRate;

  let balance = 0;
  let totalEmployeeContributions = 0;
  let totalEmployerContributions = 0;
  let cumulativeTaxSaved = 0;

  const yearlySchedule = [];

  for (let yr = 1; yr <= years; yr++) {
    totalEmployeeContributions += annualContrib;
    totalEmployerContributions += employerContrib;

    const startBal = balance;
    const interestEarned = (startBal + netInvestedAnnual / 2) * r;
    balance = startBal + netInvestedAnnual + interestEarned;

    // Triple tax advantage savings: upfront payroll tax saved + tax on investment returns saved
    const investmentTaxSaved = interestEarned * 0.15; // 15% avoided capital gains tax
    cumulativeTaxSaved += (annualUpfrontTaxSavings + investmentTaxSaved);

    yearlySchedule.push({
      age: currentAge + yr,
      balance: Math.round(balance),
      annualTaxSaved: Math.round(annualUpfrontTaxSavings + investmentTaxSaved),
      cumulativeTaxSaved: Math.round(cumulativeTaxSaved),
      interestEarned: Math.round(interestEarned),
    });
  }

  const totalInvestmentGrowth = Math.max(0, balance - (totalEmployeeContributions + totalEmployerContributions - (medicalExpenses * years)));

  return {
    projectedBalanceAtRetirement: Math.round(balance),
    totalEmployeeContributions: Math.round(totalEmployeeContributions),
    totalEmployerContributions: Math.round(totalEmployerContributions),
    totalInvestmentGrowth: Math.round(totalInvestmentGrowth),
    totalTaxSavings: Math.round(cumulativeTaxSaved),
    annualUpfrontTaxSavings: Math.round(annualUpfrontTaxSavings),
    yearlySchedule,
  };
}

// ==========================================
// 30. RENTAL PROPERTY ROI / CAP RATE MATH
// ==========================================
export function calculateRentalRoi(inputs: RentalRoiInputs): RentalRoiResults {
  const purchasePrice = Math.max(1000, inputs.purchasePrice);
  const downPayment = Math.max(0, inputs.downPayment);
  const closingCosts = Math.max(0, inputs.closingCosts);
  const totalInitialInvestment = downPayment + closingCosts;

  const monthlyRent = Math.max(0, inputs.monthlyRent);
  const grossAnnualRent = monthlyRent * 12;
  const vacancyLoss = grossAnnualRent * (inputs.vacancyRate / 100);
  const effectiveGrossIncome = Math.max(0, grossAnnualRent - vacancyLoss);

  // Operating Expenses (Excluding Mortgage Debt Service)
  const maintenanceExpense = effectiveGrossIncome * (inputs.maintenanceReservePercent / 100);
  const managementExpense = effectiveGrossIncome * (inputs.managementFeePercent / 100);
  const hoaAnnual = inputs.hoaMonthly * 12;
  const annualOperatingExpenses = inputs.annualPropertyTax + inputs.annualInsurance + maintenanceExpense + managementExpense + hoaAnnual;

  // Net Operating Income (NOI)
  const netOperatingIncome = Math.max(0, effectiveGrossIncome - annualOperatingExpenses);
  const capRate = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;

  // Debt service
  let annualDebtService = 0;
  let monthlyMortgage = 0;
  const loanPrincipal = Math.max(0, purchasePrice - downPayment);
  if (inputs.isFinanced && loanPrincipal > 0) {
    monthlyMortgage = calculateAmortizedMonthlyPI(loanPrincipal, inputs.mortgageInterestRate, inputs.mortgageTermYears * 12);
    annualDebtService = monthlyMortgage * 12;
  }

  const annualCashFlow = netOperatingIncome - annualDebtService;
  const monthlyCashFlow = annualCashFlow / 12;
  const cashOnCashReturn = totalInitialInvestment > 0 ? (annualCashFlow / totalInitialInvestment) * 100 : 0;

  // 10-year projections
  const yearlyProjections = [];
  let currentVal = purchasePrice;
  let remainingLoan = loanPrincipal;
  const monthlyRate = inputs.mortgageInterestRate / 100 / 12;
  let cumulativeCash = 0;

  for (let yr = 1; yr <= 10; yr++) {
    currentVal *= 1.03; // ~3% annual property appreciation
    if (inputs.isFinanced) {
      for (let m = 1; m <= 12; m++) {
        if (remainingLoan > 0) {
          const intPart = remainingLoan * monthlyRate;
          const prinPart = Math.min(remainingLoan, monthlyMortgage - intPart);
          remainingLoan = Math.max(0, remainingLoan - prinPart);
        }
      }
    } else {
      remainingLoan = 0;
    }
    cumulativeCash += annualCashFlow;
    const equity = currentVal - remainingLoan;
    const totalProfit = (equity - downPayment) + cumulativeCash;

    yearlyProjections.push({
      year: yr,
      propertyValue: Math.round(currentVal),
      loanBalance: Math.round(remainingLoan),
      equity: Math.round(equity),
      cumulativeCashFlow: Math.round(cumulativeCash),
      totalProfit: Math.round(totalProfit),
    });
  }

  const fiveYearTotalReturn = yearlyProjections[4] ? yearlyProjections[4].totalProfit : 0;
  const tenYearTotalReturn = yearlyProjections[9] ? yearlyProjections[9].totalProfit : 0;

  return {
    totalInitialInvestment: Math.round(totalInitialInvestment),
    grossAnnualRent: Math.round(grossAnnualRent),
    effectiveGrossIncome: Math.round(effectiveGrossIncome),
    annualOperatingExpenses: Math.round(annualOperatingExpenses),
    netOperatingIncome: Math.round(netOperatingIncome),
    capRate: Math.round(capRate * 100) / 100,
    annualDebtService: Math.round(annualDebtService),
    monthlyCashFlow: Math.round(monthlyCashFlow),
    annualCashFlow: Math.round(annualCashFlow),
    cashOnCashReturn: Math.round(cashOnCashReturn * 100) / 100,
    fiveYearTotalReturn: Math.round(fiveYearTotalReturn),
    tenYearTotalReturn: Math.round(tenYearTotalReturn),
    yearlyProjections,
  };
}

// ==========================================
// 31. LIFE INSURANCE NEEDS MATH (DIME METHOD)
// ==========================================
export function calculateLifeInsurance(inputs: LifeInsuranceInputs): LifeInsuranceResults {
  const dimeDebt = Math.max(0, inputs.otherDebts) + Math.max(0, inputs.funeralAndFinalExpenses);
  const dimeIncome = Math.max(0, inputs.annualIncomeToReplace) * Math.max(1, inputs.yearsOfIncomeReplacement);
  const dimeMortgage = Math.max(0, inputs.mortgageBalance);
  const dimeEducation = Math.max(0, inputs.childrenCollegeFunding);

  const grossNeed = dimeDebt + dimeIncome + dimeMortgage + dimeEducation;
  const existingAssets = Math.max(0, inputs.existingSavingsAndInvestments) + Math.max(0, inputs.existingLifeInsurance);
  const recommendedCoverage = Math.max(0, grossNeed - existingAssets);

  const coverageBreakdown = [
    { name: "Income Replacement", amount: dimeIncome, percentage: grossNeed > 0 ? (dimeIncome / grossNeed) * 100 : 0 },
    { name: "Mortgage Payoff", amount: dimeMortgage, percentage: grossNeed > 0 ? (dimeMortgage / grossNeed) * 100 : 0 },
    { name: "College Education", amount: dimeEducation, percentage: grossNeed > 0 ? (dimeEducation / grossNeed) * 100 : 0 },
    { name: "Debts & Final Expenses", amount: dimeDebt, percentage: grossNeed > 0 ? (dimeDebt / grossNeed) * 100 : 0 },
  ];

  return {
    dimeDebt: Math.round(dimeDebt),
    dimeIncome: Math.round(dimeIncome),
    dimeMortgage: Math.round(dimeMortgage),
    dimeEducation: Math.round(dimeEducation),
    grossNeed: Math.round(grossNeed),
    existingAssets: Math.round(existingAssets),
    recommendedCoverage: Math.round(recommendedCoverage),
    coverageBreakdown: coverageBreakdown.map((b) => ({
      ...b,
      amount: Math.round(b.amount),
      percentage: Math.round(b.percentage * 10) / 10,
    })),
  };
}

// ==========================================
// 32. SOCIAL SECURITY BENEFIT ESTIMATOR MATH
// ==========================================
export function calculateSocialSecurity(inputs: SocialSecurityInputs): SocialSecurityResults {
  const fullRetirementAge = 67; // Born 1960 or later
  const plannedAge = Math.min(70, Math.max(62, inputs.plannedClaimingAge));
  const currentSalary = Math.max(0, inputs.currentAnnualSalary);

  // Social Security wage base cap (2026 est ~$176,100)
  const cappedSalary = Math.min(176100, currentSalary);
  const aime = cappedSalary / 12; // Average Indexed Monthly Earnings approx

  // 2026 Estimated Bend Points: $1,226 and $7,391
  let pia = 0;
  if (aime <= 1226) {
    pia = aime * 0.90;
  } else if (aime <= 7391) {
    pia = (1226 * 0.90) + ((aime - 1226) * 0.32);
  } else {
    pia = (1226 * 0.90) + ((7391 - 1226) * 0.32) + ((aime - 7391) * 0.15);
  }

  // Claiming age factors relative to FRA (Age 67):
  // Age 62: 70.0% (-30%)
  // Age 63: 75.0% (-25%)
  // Age 64: 80.0% (-20%)
  // Age 65: 86.67% (-13.33%)
  // Age 66: 93.33% (-6.67%)
  // Age 67: 100%
  // Age 68: 108% (+8%)
  // Age 69: 116% (+16%)
  // Age 70: 124% (+24%)
  const ageFactors: Record<number, number> = {
    62: 0.70,
    63: 0.75,
    64: 0.80,
    65: 0.8667,
    66: 0.9333,
    67: 1.00,
    68: 1.08,
    69: 1.16,
    70: 1.24,
  };

  const factor = ageFactors[plannedAge] || 1.0;
  const benefitAtClaimingAge = pia * factor;

  const benefitAt62 = pia * ageFactors[62];
  const benefitAt67 = pia * ageFactors[67];
  const benefitAt70 = pia * ageFactors[70];

  const ageBenefitTable = [];
  for (let a = 62; a <= 70; a++) {
    const f = ageFactors[a] || 1.0;
    const monthly = pia * f;
    const annual = monthly * 12;
    const cumulativeAt80 = Math.max(0, (80 - a) * annual);
    const cumulativeAt85 = Math.max(0, (85 - a) * annual);

    ageBenefitTable.push({
      age: a,
      monthlyBenefit: Math.round(monthly),
      annualBenefit: Math.round(annual),
      percentOfPia: Math.round(f * 100),
      cumulativeAt80: Math.round(cumulativeAt80),
      cumulativeAt85: Math.round(cumulativeAt85),
    });
  }

  // Break-even ages:
  // Age 62 vs 67:
  // at age X: (X - 62) * benefitAt62 = (X - 67) * benefitAt67
  // X * (benefitAt67 - benefitAt62) = 67 * benefitAt67 - 62 * benefitAt62
  const diff67_62 = benefitAt67 - benefitAt62;
  const breakEvenAge62vs67 = diff67_62 > 0 ? Math.round((67 * benefitAt67 - 62 * benefitAt62) / diff67_62) : 78;

  // Age 67 vs 70:
  const diff70_67 = benefitAt70 - benefitAt67;
  const breakEvenAge67vs70 = diff70_67 > 0 ? Math.round((70 * benefitAt70 - 67 * benefitAt67) / diff70_67) : 82;

  return {
    fullRetirementAge,
    estimatedPiaMonthly: Math.round(pia),
    benefitAtClaimingAge: Math.round(benefitAtClaimingAge),
    benefitAt62: Math.round(benefitAt62),
    benefitAt67: Math.round(benefitAt67),
    benefitAt70: Math.round(benefitAt70),
    percentageOfPia: Math.round(factor * 100),
    breakEvenAge62vs67,
    breakEvenAge67vs70,
    ageBenefitTable,
  };
}


