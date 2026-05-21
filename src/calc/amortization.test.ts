import { describe, it, expect } from "vitest";
import { monthlyPayment, totalInterest, evaluateAprTiers } from "./amortization";

describe("monthlyPayment", () => {
  it("computes payment for a standard loan", () => {
    // $30,000 at 5.9% APR for 60 months — verified against Bankrate
    expect(monthlyPayment(30000, 5.9, 60)).toBeCloseTo(578.59, 2);
  });

  it("handles 0% APR (subvented financing)", () => {
    // $30,000 at 0% for 36 months = $833.33/mo exactly
    expect(monthlyPayment(30000, 0, 36)).toBeCloseTo(833.33, 2);
  });

  it("handles longer terms with higher rates", () => {
    expect(monthlyPayment(40000, 7.5, 72)).toBeCloseTo(691.6, 1);
  });

  it("returns 0 for zero principal", () => {
    expect(monthlyPayment(0, 5.9, 60)).toBe(0);
  });

  it("returns 0 for zero term", () => {
    expect(monthlyPayment(30000, 5.9, 0)).toBe(0);
  });
});

describe("totalInterest", () => {
  it("computes interest paid over loan life", () => {
    // $30,000 at 5.9% for 60 months: monthly $578.59, total $34,715.41, interest $4,715.41
    expect(totalInterest(30000, 5.9, 60)).toBeCloseTo(4715.41, 0);
  });

  it("returns 0 for 0% APR", () => {
    expect(totalInterest(30000, 0, 60)).toBeCloseTo(0, 5);
  });

  it("returns 0 for zero principal", () => {
    expect(totalInterest(0, 5.9, 60)).toBe(0);
  });
});

describe("evaluateAprTiers", () => {
  it("returns one scenario per tier", () => {
    const tiers = [
      { termMonths: 36, apr: 0 },
      { termMonths: 60, apr: 3.9 },
      { termMonths: 72, apr: 4.9 },
    ];
    const results = evaluateAprTiers(30000, tiers);
    expect(results).toHaveLength(3);
    expect(results[0].apr).toBe(0);
    expect(results[1].termMonths).toBe(60);
    expect(results[2].apr).toBe(4.9);
  });

  it("computes correct numbers per scenario", () => {
    const [scenario] = evaluateAprTiers(30000, [{ termMonths: 60, apr: 5.9 }]);
    expect(scenario.monthlyPayment).toBeCloseTo(578.59, 2);
    expect(scenario.totalInterest).toBeCloseTo(4715.41, 0);
    expect(scenario.totalCost).toBeCloseTo(34715.41, 0);
  });

  it("identifies that 0% APR has lower interest but may have higher monthly than longer terms", () => {
    const results = evaluateAprTiers(30000, [
      { termMonths: 36, apr: 0 },
      { termMonths: 72, apr: 4.9 },
    ]);
    expect(results[0].totalInterest).toBeCloseTo(0, 5);
    expect(results[0].monthlyPayment).toBeGreaterThan(results[1].monthlyPayment);
    expect(results[0].totalCost).toBeLessThan(results[1].totalCost);
  });
});
