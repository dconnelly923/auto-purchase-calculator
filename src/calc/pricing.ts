import {
  PricingInputs,
  MdFees,
  TaxConfig,
  PricingResult,
  FinancingInputs,
} from "./types";

export function computeTaxablePrice(p: PricingInputs): number {
  return Math.max(0, p.msrp - p.tradeIn - p.pretaxDiscounts + p.pretaxFees);
}

export function sumFees(fees: MdFees): number {
  return (
    fees.title +
    fees.registration +
    fees.lienRecording +
    fees.tireRecycling +
    fees.other
  );
}

export function computePricing(
  pricing: PricingInputs,
  fees: MdFees,
  tax: TaxConfig,
  financing: FinancingInputs,
): PricingResult {
  const taxablePrice = computeTaxablePrice(pricing);
  const excisTax = taxablePrice * tax.excisTaxRate;
  const totalFees = sumFees(fees);
  const outTheDoorPrice =
    taxablePrice + excisTax + totalFees + pricing.posttaxFees;

  const amountFinanced = Math.max(
    0,
    outTheDoorPrice - financing.downPayment - pricing.posttaxDiscounts,
  );

  return {
    taxablePrice,
    excisTax,
    totalFees,
    outTheDoorPrice,
    amountFinanced,
  };
}
