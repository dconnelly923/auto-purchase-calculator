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

export type VehicleCondition = "new" | "used";

export type LineItem = {
  id: string;
  label: string;
  amount: number;
  isPretax: boolean;
};

export type Scenario = {
  name: string;
  condition: VehicleCondition;
  msrp: number;
  tradeIn: number;
  downPayment: number;
  fees: MdFees;
  excisTaxRate: number;
  discounts: LineItem[];
  additionalFees: LineItem[];
};

export type LenderRates = {
  name: string;
  newTiers: AprTier[];
  usedTiers: AprTier[];
};

export type BankRates = LenderRates;

export type LenderResult = {
  lender: string;
  loanScenarios: LoanScenario[];
};

export type ScenarioResult = {
  pricing: PricingResult;
  manufacturer: LenderResult;
  bank: LenderResult;
};

export function newLineItem(label = "", amount = 0, isPretax = true): LineItem {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    label,
    amount,
    isPretax,
  };
}

export function makeDefaultScenario(name = "Scenario 1"): Scenario {
  return {
    name,
    condition: "new",
    msrp: 44000,
    tradeIn: 4000,
    downPayment: 10000,
    fees: { ...DEFAULT_MD_FEES },
    excisTaxRate: DEFAULT_TAX_CONFIG.excisTaxRate,
    discounts: [],
    additionalFees: [],
  };
}

export function makeDefaultBankRates(): LenderRates {
  return {
    name: "Navy Federal Credit Union",
    newTiers: [
      { termMonths: 36, apr: 4.54 },
      { termMonths: 48, apr: 4.54 },
      { termMonths: 60, apr: 4.54 },
      { termMonths: 72, apr: 5.34 },
    ],
    usedTiers: [
      { termMonths: 36, apr: 5.04 },
      { termMonths: 48, apr: 5.04 },
      { termMonths: 60, apr: 5.04 },
      { termMonths: 72, apr: 6.34 },
    ],
  };
}

export function makeDefaultManufacturerRates(): LenderRates {
  return {
    name: "Manufacturer",
    newTiers: [
      { termMonths: 36, apr: 0 },
      { termMonths: 48, apr: 1.9 },
      { termMonths: 60, apr: 3.9 },
      { termMonths: 72, apr: 5.9 },
    ],
    usedTiers: [
      { termMonths: 36, apr: 4.9 },
      { termMonths: 48, apr: 5.9 },
      { termMonths: 60, apr: 6.9 },
      { termMonths: 72, apr: 7.9 },
    ],
  };
}

function sumLineItems(items: LineItem[], pretax: boolean): number {
  return items
    .filter((i) => i.isPretax === pretax)
    .reduce((acc, i) => acc + (Number.isFinite(i.amount) ? i.amount : 0), 0);
}

function scenarioToPricingInputs(s: Scenario): PricingInputs {
  return {
    msrp: s.msrp,
    tradeIn: s.tradeIn,
    pretaxDiscounts: sumLineItems(s.discounts, true),
    posttaxDiscounts: sumLineItems(s.discounts, false),
    pretaxFees: sumLineItems(s.additionalFees, true),
    posttaxFees: sumLineItems(s.additionalFees, false),
  };
}

function evaluateLender(
  lender: string,
  amountFinanced: number,
  tiers: AprTier[],
): LenderResult {
  return {
    lender,
    loanScenarios: evaluateAprTiers(amountFinanced, tiers),
  };
}

function tiersForCondition(rates: LenderRates, condition: VehicleCondition) {
  return condition === "new" ? rates.newTiers : rates.usedTiers;
}

function lenderLabel(rates: LenderRates, condition: VehicleCondition) {
  return `${rates.name} (${condition})`;
}

export function computeScenario(
  s: Scenario,
  bankRates: LenderRates,
  manufacturerRates: LenderRates,
): ScenarioResult {
  const pricingInputs = scenarioToPricingInputs(s);
  const taxConfig = { excisTaxRate: s.excisTaxRate };

  const pricing = computePricing(pricingInputs, s.fees, taxConfig, {
    downPayment: s.downPayment,
  });

  const manufacturer = evaluateLender(
    lenderLabel(manufacturerRates, s.condition),
    pricing.amountFinanced,
    tiersForCondition(manufacturerRates, s.condition),
  );
  const bank = evaluateLender(
    lenderLabel(bankRates, s.condition),
    pricing.amountFinanced,
    tiersForCondition(bankRates, s.condition),
  );

  return { pricing, manufacturer, bank };
}
