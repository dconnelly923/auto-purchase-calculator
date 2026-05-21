import { AprTier, LoanScenario } from "./types";

export function monthlyPayment(
  principal: number,
  aprPercent: number,
  termMonths: number,
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const r = aprPercent / 100 / 12;
  if (r === 0) return principal / termMonths;
  const factor = Math.pow(1 + r, termMonths);
  return (principal * r * factor) / (factor - 1);
}

export function totalInterest(
  principal: number,
  aprPercent: number,
  termMonths: number,
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  return monthlyPayment(principal, aprPercent, termMonths) * termMonths - principal;
}

export function evaluateAprTiers(
  principal: number,
  tiers: AprTier[],
): LoanScenario[] {
  return tiers.map((tier) => {
    const m = monthlyPayment(principal, tier.apr, tier.termMonths);
    const interest = m * tier.termMonths - principal;
    return {
      termMonths: tier.termMonths,
      apr: tier.apr,
      monthlyPayment: m,
      totalInterest: Math.max(0, interest),
      totalCost: m * tier.termMonths,
    };
  });
}
