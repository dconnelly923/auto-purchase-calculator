import { describe, it, expect } from "vitest";
import { computeTaxablePrice, sumFees, computePricing } from "./pricing";
import {
  PricingInputs,
  FinancingInputs,
  DEFAULT_MD_FEES,
  DEFAULT_TAX_CONFIG,
} from "./types";

const zeroPricing: PricingInputs = {
  msrp: 0,
  tradeIn: 0,
  pretaxDiscounts: 0,
  posttaxDiscounts: 0,
  pretaxFees: 0,
  posttaxFees: 0,
};

const zeroFinancing: FinancingInputs = {
  downPayment: 0,
};

describe("computeTaxablePrice", () => {
  it("subtracts trade-in and pre-tax discounts from MSRP", () => {
    const p: PricingInputs = {
      ...zeroPricing,
      msrp: 40000,
      tradeIn: 10000,
      pretaxDiscounts: 4000,
    };
    expect(computeTaxablePrice(p)).toBe(26000);
  });

  it("does NOT subtract post-tax discounts", () => {
    const p: PricingInputs = {
      ...zeroPricing,
      msrp: 40000,
      posttaxDiscounts: 4500,
    };
    expect(computeTaxablePrice(p)).toBe(40000);
  });

  it("adds pre-tax fees to the taxable base", () => {
    const p: PricingInputs = {
      ...zeroPricing,
      msrp: 40000,
      pretaxFees: 500,
    };
    expect(computeTaxablePrice(p)).toBe(40500);
  });

  it("clamps at zero when reductions exceed MSRP", () => {
    const p: PricingInputs = {
      ...zeroPricing,
      msrp: 10000,
      tradeIn: 20000,
    };
    expect(computeTaxablePrice(p)).toBe(0);
  });
});

describe("sumFees", () => {
  it("sums all default MD fees", () => {
    expect(sumFees(DEFAULT_MD_FEES)).toBeCloseTo(420.5, 2);
  });

  it("includes the 'other' field", () => {
    expect(sumFees({ ...DEFAULT_MD_FEES, other: 299 })).toBeCloseTo(719.5, 2);
  });
});

describe("computePricing", () => {
  it("computes a baseline scenario", () => {
    const p: PricingInputs = {
      ...zeroPricing,
      msrp: 40000,
      tradeIn: 10000,
      pretaxDiscounts: 2000,
    };
    const result = computePricing(
      p,
      DEFAULT_MD_FEES,
      DEFAULT_TAX_CONFIG,
      zeroFinancing,
    );
    expect(result.taxablePrice).toBe(28000);
    expect(result.excisTax).toBeCloseTo(1820, 2); // 28000 * 0.065
    expect(result.totalFees).toBeCloseTo(420.5, 2);
    expect(result.outTheDoorPrice).toBeCloseTo(30240.5, 2);
    expect(result.amountFinanced).toBeCloseTo(30240.5, 2);
  });

  it("reduces amount financed by down payment", () => {
    const p: PricingInputs = { ...zeroPricing, msrp: 40000 };
    const result = computePricing(p, DEFAULT_MD_FEES, DEFAULT_TAX_CONFIG, {
      downPayment: 5000,
    });
    // OTD = 40000 + 2600 (tax) + 420.5 (fees) = 43020.5
    // financed = 43020.5 - 5000 = 38020.5
    expect(result.outTheDoorPrice).toBeCloseTo(43020.5, 2);
    expect(result.amountFinanced).toBeCloseTo(38020.5, 2);
  });

  it("applies post-tax discounts to amount financed but not taxable base", () => {
    const p: PricingInputs = {
      ...zeroPricing,
      msrp: 40000,
      posttaxDiscounts: 3000,
    };
    const result = computePricing(
      p,
      DEFAULT_MD_FEES,
      DEFAULT_TAX_CONFIG,
      zeroFinancing,
    );
    expect(result.taxablePrice).toBe(40000);
    expect(result.excisTax).toBeCloseTo(2600, 2);
    expect(result.amountFinanced).toBeCloseTo(40000 + 2600 + 420.5 - 3000, 2);
  });

  it("applies pre-tax discounts to both taxable base and financed amount", () => {
    const p: PricingInputs = {
      ...zeroPricing,
      msrp: 40000,
      pretaxDiscounts: 3000,
    };
    const result = computePricing(
      p,
      DEFAULT_MD_FEES,
      DEFAULT_TAX_CONFIG,
      zeroFinancing,
    );
    expect(result.taxablePrice).toBe(37000);
    expect(result.excisTax).toBeCloseTo(2405, 2); // 37000 * 0.065
    expect(result.amountFinanced).toBeCloseTo(37000 + 2405 + 420.5, 2);
  });

  it("$3K pre-tax discount beats $3K post-tax by the tax delta", () => {
    const baseInputs: PricingInputs = { ...zeroPricing, msrp: 40000 };
    const pretax = computePricing(
      { ...baseInputs, pretaxDiscounts: 3000 },
      DEFAULT_MD_FEES,
      DEFAULT_TAX_CONFIG,
      zeroFinancing,
    );
    const posttax = computePricing(
      { ...baseInputs, posttaxDiscounts: 3000 },
      DEFAULT_MD_FEES,
      DEFAULT_TAX_CONFIG,
      zeroFinancing,
    );
    const savings = posttax.amountFinanced - pretax.amountFinanced;
    expect(savings).toBeCloseTo(3000 * 0.065, 2); // $195
  });

  it("post-tax fees increase OTD without affecting tax", () => {
    const p: PricingInputs = {
      ...zeroPricing,
      msrp: 30000,
      posttaxFees: 500,
    };
    const result = computePricing(
      p,
      DEFAULT_MD_FEES,
      DEFAULT_TAX_CONFIG,
      zeroFinancing,
    );
    expect(result.taxablePrice).toBe(30000);
    expect(result.excisTax).toBeCloseTo(1950, 2);
    expect(result.outTheDoorPrice).toBeCloseTo(30000 + 1950 + 420.5 + 500, 2);
  });

  it("uses MD 6.5% rate by default but honors override", () => {
    const p: PricingInputs = { ...zeroPricing, msrp: 30000 };
    const at65 = computePricing(
      p,
      DEFAULT_MD_FEES,
      DEFAULT_TAX_CONFIG,
      zeroFinancing,
    );
    const at60 = computePricing(
      p,
      DEFAULT_MD_FEES,
      { excisTaxRate: 0.06 },
      zeroFinancing,
    );
    expect(at65.excisTax).toBeCloseTo(1950, 2);
    expect(at60.excisTax).toBeCloseTo(1800, 2);
  });
});
