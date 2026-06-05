export type PricingInputs = {
  msrp: number;
  tradeIn: number;
  pretaxDiscounts: number;
  posttaxDiscounts: number;
  pretaxFees: number;
  posttaxFees: number;
};

export type MdFees = {
  title: number;
  registration: number;
  lienRecording: number;
  tireRecycling: number;
  other: number;
};

export type TaxConfig = {
  excisTaxRate: number;
};

export type PricingResult = {
  taxablePrice: number;
  excisTax: number;
  totalFees: number;
  outTheDoorPrice: number;
  amountFinanced: number;
};

export type FinancingInputs = {
  downPayment: number;
};

export type AprTier = {
  termMonths: number;
  apr: number;
};

export type LoanScenario = {
  termMonths: number;
  apr: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
};

export const DEFAULT_MD_FEES: MdFees = {
  title: 200,
  registration: 197.5,
  lienRecording: 20,
  tireRecycling: 3,
  other: 0,
};

export const DEFAULT_TAX_CONFIG: TaxConfig = {
  excisTaxRate: 0.065,
};
