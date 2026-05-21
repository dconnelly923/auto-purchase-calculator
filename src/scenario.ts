import {
  AprTier,
  MdFees,
  PricingInputs,
  PricingResult,
  LoanScenario,
  DEFAULT_MD_FEES,
  DEFAULT_TAX_CONFIG,
} from "./calc/types";
import { computePricing } from "./calc/pricing";
import { evaluateAprTiers } from "./calc/amortization";
import { interestSavedFromExtraPrincipal } from "./calc/extraPrincipal";
import { findOptimalDownPayment, BreakEvenResult } from "./calc/breakEven";

export type Scenario = {
  name: string;
  // Pricing
  msrp: number;
  dealerDiscount: number;
  customerCash: number;
  tradeIn: number;
  manufacturerRebate: number;
  financingConditionalCash: number;
  otherIncentive: number;
  otherIncentiveIsPretax: boolean;
  // Fees & tax
  fees: MdFees;
  excisTaxRate: number;
  // Financing
  downPayment: number;
  useManufacturerFinancing: boolean;
  extraMonthlyPrincipal: number;
  aprTiers: AprTier[];
  // Break-even
  cashOnHand: number;
  afterTaxApyPercent: number;
  breakEvenTierIndex: number;
};

export type ScenarioResult = {
  pricing: PricingResult;
  loanScenarios: LoanScenario[];
  interestSavedByTier: number[];
  breakEven: BreakEvenResult;
  breakEvenTier: AprTier | undefined;
};

export function makeDefaultScenario(name = "Scenario 1"): Scenario {
  return {
    name,
    msrp: 38000,
    dealerDiscount: 1500,
    customerCash: 0,
    tradeIn: 8000,
    manufacturerRebate: 0,
    financingConditionalCash: 0,
    otherIncentive: 0,
    otherIncentiveIsPretax: true,
    fees: { ...DEFAULT_MD_FEES },
    excisTaxRate: DEFAULT_TAX_CONFIG.excisTaxRate,
    downPayment: 3000,
    useManufacturerFinancing: true,
    extraMonthlyPrincipal: 0,
    aprTiers: [
      { termMonths: 36, apr: 0 },
      { termMonths: 48, apr: 1.9 },
      { termMonths: 60, apr: 3.9 },
      { termMonths: 72, apr: 5.9 },
    ],
    cashOnHand: 15000,
    afterTaxApyPercent: 3,
    breakEvenTierIndex: 2,
  };
}

function scenarioToPricingInputs(s: Scenario): PricingInputs {
  return {
    msrp: s.msrp,
    dealerDiscount: s.dealerDiscount,
    customerCash: s.customerCash,
    tradeIn: s.tradeIn,
    otherIncentivePretax: s.otherIncentiveIsPretax ? s.otherIncentive : 0,
    manufacturerRebate: s.manufacturerRebate,
    financingConditionalCash: s.financingConditionalCash,
    otherIncentivePosttax: s.otherIncentiveIsPretax ? 0 : s.otherIncentive,
  };
}

export function computeScenario(s: Scenario): ScenarioResult {
  const pricingInputs = scenarioToPricingInputs(s);
  const taxConfig = { excisTaxRate: s.excisTaxRate };

  const pricing = computePricing(pricingInputs, s.fees, taxConfig, {
    downPayment: s.downPayment,
    useManufacturerFinancing: s.useManufacturerFinancing,
  });

  const loanScenarios = evaluateAprTiers(pricing.amountFinanced, s.aprTiers);

  const interestSavedByTier = s.aprTiers.map((t) =>
    interestSavedFromExtraPrincipal(
      pricing.amountFinanced,
      t.apr,
      t.termMonths,
      s.extraMonthlyPrincipal,
    ),
  );

  const zeroDownPricing = computePricing(pricingInputs, s.fees, taxConfig, {
    downPayment: 0,
    useManufacturerFinancing: s.useManufacturerFinancing,
  });

  const breakEvenTier =
    s.aprTiers[s.breakEvenTierIndex] ?? s.aprTiers[0];

  const breakEven = findOptimalDownPayment({
    amountFinancedAtZeroDown: zeroDownPricing.amountFinanced,
    aprPercent: breakEvenTier?.apr ?? 0,
    termMonths: breakEvenTier?.termMonths ?? 60,
    cashOnHand: s.cashOnHand,
    afterTaxApyPercent: s.afterTaxApyPercent,
  });

  return { pricing, loanScenarios, interestSavedByTier, breakEven, breakEvenTier };
}
