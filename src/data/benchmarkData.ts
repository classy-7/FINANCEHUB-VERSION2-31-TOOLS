// Financial benchmarks for Net Worth percentiles, Student Loan Poverty Guidelines, and Self-Employment Tax Rules

export interface AgeGroupBenchmark {
  bracket: string;
  minAge: number;
  maxAge: number;
  median: number;
  average: number;
  top25Percentile: number;
  top10Percentile: number;
}

// Federal Reserve Survey of Consumer Finances (SCF) latest benchmark reference
export const NET_WORTH_BY_AGE_GROUP: AgeGroupBenchmark[] = [
  {
    bracket: "Under 35",
    minAge: 18,
    maxAge: 34,
    median: 39000,
    average: 183500,
    top25Percentile: 135000,
    top10Percentile: 450000,
  },
  {
    bracket: "35 – 44",
    minAge: 35,
    maxAge: 44,
    median: 135600,
    average: 549600,
    top25Percentile: 480000,
    top10Percentile: 1250000,
  },
  {
    bracket: "45 – 54",
    minAge: 45,
    maxAge: 54,
    median: 247200,
    average: 975800,
    top25Percentile: 850000,
    top10Percentile: 2200000,
  },
  {
    bracket: "55 – 64",
    minAge: 55,
    maxAge: 64,
    median: 364500,
    average: 1566900,
    top25Percentile: 1200000,
    top10Percentile: 3200000,
  },
  {
    bracket: "65 – 74",
    minAge: 65,
    maxAge: 74,
    median: 409900,
    average: 1794600,
    top25Percentile: 1400000,
    top10Percentile: 3800000,
  },
  {
    bracket: "75 and older",
    minAge: 75,
    maxAge: 120,
    median: 335600,
    average: 1624100,
    top25Percentile: 1100000,
    top10Percentile: 3100000,
  },
];

// US Department of Health & Human Services Poverty Guidelines (contiguous 48 states base for 2026)
export const FEDERAL_POVERTY_BASE_2026 = 15650;
export const FEDERAL_POVERTY_PER_PERSON_2026 = 5380;

export function getPovertyGuideline(familySize: number): number {
  const size = Math.max(1, familySize);
  return FEDERAL_POVERTY_BASE_2026 + (size - 1) * FEDERAL_POVERTY_PER_PERSON_2026;
}

// 2026 Self-Employment Tax & Social Security wage base
export const SE_TAX_CONFIG_2026 = {
  socialSecurityRate: 0.124, // 12.4%
  medicareRate: 0.029, // 2.9%
  additionalMedicareRate: 0.009, // 0.9% for high earners
  additionalMedicareThresholdSingle: 200000,
  additionalMedicareThresholdMarried: 250000,
  socialSecurityWageBaseCap: 176100, // 2026 limit
  seDeductionMultiplier: 0.9235, // 92.35% of net profit is subject to SE tax
  aboveLineDeductionRatio: 0.50, // 50% of SE tax is deductible against AGI
  quarterlyDueDates: [
    { quarter: "Q1", period: "Jan 1 – Mar 31", dueDate: "April 15, 2026" },
    { quarter: "Q2", period: "Apr 1 – May 31", dueDate: "June 15, 2026" },
    { quarter: "Q3", period: "Jun 1 – Aug 31", dueDate: "September 15, 2026" },
    { quarter: "Q4", period: "Sep 1 – Dec 31", dueDate: "January 15, 2027" },
  ],
};
