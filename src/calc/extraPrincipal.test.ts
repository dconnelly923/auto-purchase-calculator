import { describe, it, expect } from "vitest";
import { interestSavedFromExtraPrincipal } from "./extraPrincipal";
import { totalInterest } from "./amortization";

describe("interestSavedFromExtraPrincipal", () => {
  it("returns 0 when no extra principal is paid", () => {
    expect(interestSavedFromExtraPrincipal(30000, 5.9, 60, 0)).toBe(0);
  });

  it("returns 0 for 0% APR loans (no interest to save)", () => {
    expect(interestSavedFromExtraPrincipal(30000, 0, 60, 100)).toBe(0);
  });

  it("saves more interest when more extra principal is paid", () => {
    const small = interestSavedFromExtraPrincipal(30000, 5.9, 60, 50);
    const big = interestSavedFromExtraPrincipal(30000, 5.9, 60, 200);
    expect(big).toBeGreaterThan(small);
  });

  it("saves more interest at higher APR", () => {
    const lowRate = interestSavedFromExtraPrincipal(30000, 3.0, 60, 100);
    const highRate = interestSavedFromExtraPrincipal(30000, 7.0, 60, 100);
    expect(highRate).toBeGreaterThan(lowRate);
  });

  it("never reports savings exceeding total baseline interest", () => {
    const baseline = totalInterest(30000, 5.9, 60);
    const savings = interestSavedFromExtraPrincipal(30000, 5.9, 60, 10000);
    expect(savings).toBeLessThanOrEqual(baseline);
  });

  it("produces reasonable savings for a typical scenario", () => {
    // $30k at 5.9% for 60mo, $100/mo extra principal
    // Reasonable savings: roughly $500-700 in interest
    const savings = interestSavedFromExtraPrincipal(30000, 5.9, 60, 100);
    expect(savings).toBeGreaterThan(400);
    expect(savings).toBeLessThan(900);
  });

  it("returns 0 for zero principal", () => {
    expect(interestSavedFromExtraPrincipal(0, 5.9, 60, 100)).toBe(0);
  });
});
