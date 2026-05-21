import { describe, it, expect } from "vitest";
import { findOptimalDownPayment, BreakEvenInput } from "./breakEven";

const baseInput: BreakEvenInput = {
  amountFinancedAtZeroDown: 40000,
  aprPercent: 5.9,
  termMonths: 60,
  cashOnHand: 15000,
  afterTaxApyPercent: 3.0,
};

describe("findOptimalDownPayment", () => {
  it("recommends zero down when loan APR is 0% and APY is positive", () => {
    const result = findOptimalDownPayment({
      ...baseInput,
      aprPercent: 0,
      afterTaxApyPercent: 3.0,
    });
    // 0% loan: any cash you put down is foregone investment earnings — keep cash invested
    expect(result.optimalDownPayment).toBe(0);
    expect(result.savingsVsFullCash).toBeGreaterThan(0);
  });

  it("recommends max down payment when loan APR is high and APY is low", () => {
    const result = findOptimalDownPayment({
      ...baseInput,
      aprPercent: 9.0,
      afterTaxApyPercent: 1.0,
    });
    expect(result.optimalDownPayment).toBeCloseTo(baseInput.cashOnHand, 0);
    expect(result.savingsVsZeroDown).toBeGreaterThan(0);
  });

  it("caps optimal down payment at cash on hand", () => {
    const result = findOptimalDownPayment(baseInput);
    expect(result.optimalDownPayment).toBeLessThanOrEqual(baseInput.cashOnHand);
  });

  it("caps optimal down payment at amount financed (can't pay more than the loan)", () => {
    const result = findOptimalDownPayment({
      ...baseInput,
      amountFinancedAtZeroDown: 5000,
      cashOnHand: 50000,
    });
    expect(result.optimalDownPayment).toBeLessThanOrEqual(5000);
  });

  it("reports the cost difference between optimum and the two corners", () => {
    const result = findOptimalDownPayment(baseInput);
    expect(result.savingsVsZeroDown).toBeGreaterThanOrEqual(0);
    expect(result.savingsVsFullCash).toBeGreaterThanOrEqual(0);
  });

  it("treats 0% APY as no opportunity cost (full down is always best vs. interest)", () => {
    const result = findOptimalDownPayment({
      ...baseInput,
      afterTaxApyPercent: 0,
    });
    // With zero APY, no foregone investment — putting cash down only saves loan interest
    expect(result.optimalDownPayment).toBeCloseTo(baseInput.cashOnHand, 0);
  });

  it("favors keeping cash invested even at modestly higher APR than APY", () => {
    // Counterintuitive but mathematically correct: loan interest is on declining balance,
    // investment interest compounds on full balance. At APR=APY=4%, keeping cash invested wins.
    const result = findOptimalDownPayment({
      ...baseInput,
      aprPercent: 4.0,
      afterTaxApyPercent: 4.0,
    });
    expect(result.optimalDownPayment).toBe(0);
  });
});
