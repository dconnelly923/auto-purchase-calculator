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
  dealerDiscount: 0,
  customerCash: 0,
  tradeIn: 0,
  otherIncentivePretax: 0,
  manufacturerRebate: 0,
  financingConditionalCash: 0,
  otherIncentivePosttax: 0,
};

const zeroFinancing: FinancingInputs = {
  downPayment: 0,
  useManufacturerFinancing: false,
};

describe("computeTaxablePrice", () => {
  it("subtracts all pre-tax reductions from MSRP", () => {
    const p: PricingInputs = {
      ...zeroPricing,
      msrp: 40000,
      dealerDiscount: 2000,
      customerCash: 1500,
      tradeIn: 10000,
      otherIncentivePretax: 500,
    };
    expect(computeTaxablePrice(p)).toBe(26000);
  });

  it("does NOT subtract post-tax incentives", () => {
    const p: PricingInputs = {
      ...zeroPricing,
      msrp: 40000,
      manufacturerRebate: 3000,
      financingConditionalCash: 1000,
      otherIncentivePosttax: 500,
    };
    expect(computeTaxablePrice(p)).toBe(40000);
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
      dealerDiscount: 2000,
      tradeIn: 10000,
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
      useManufacturerFinancing: false,
    });
    // OTD = 40000 + 2600 (tax) + 420.5 (fees) = 43020.5
    // financed = 43020.5 - 5000 = 38020.5
    expect(result.outTheDoorPrice).toBeCloseTo(43020.5, 2);
    expect(result.amountFinanced).toBeCloseTo(38020.5, 2);
  });

  it("applies manufacturer rebate post-tax (reduces financing only)", () => {
    const p: PricingInputs = {
      ...zeroPricing,
      msrp: 40000,
      manufacturerRebate: 3000,
    };
    const result = computePricing(
      p,
      DEFAULT_MD_FEES,
      DEFAULT_TAX_CONFIG,
      zeroFinancing,
    );
    expect(result.taxablePrice).toBe(40000); // rebate does NOT reduce taxable
    expect(result.excisTax).toBeCloseTo(2600, 2);
    expect(result.amountFinanced).toBeCloseTo(40000 + 2600 + 420.5 - 3000, 2);
  });

  it("applies customer cash pre-tax (reduces both tax and financing)", () => {
    const p: PricingInputs = {
      ...zeroPricing,
      msrp: 40000,
      customerCash: 3000,
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

  it("$3K customer cash beats $3K manufacturer rebate by tax savings", () => {
    const baseInputs: PricingInputs = { ...zeroPricing, msrp: 40000 };
    const customerCashResult = computePricing(
      { ...baseInputs, customerCash: 3000 },
      DEFAULT_MD_FEES,
      DEFAULT_TAX_CONFIG,
      zeroFinancing,
    );
    const rebateResult = computePricing(
      { ...baseInputs, manufacturerRebate: 3000 },
      DEFAULT_MD_FEES,
      DEFAULT_TAX_CONFIG,
      zeroFinancing,
    );
    const savings =
      rebateResult.amountFinanced - customerCashResult.amountFinanced;
    expect(savings).toBeCloseTo(3000 * 0.065, 2); // $195
  });

  it("only applies financing-conditional cash when using manufacturer financing", () => {
    const p: PricingInputs = {
      ...zeroPricing,
      msrp: 40000,
      financingConditionalCash: 1000,
    };
    const withoutMfg = computePricing(p, DEFAULT_MD_FEES, DEFAULT_TAX_CONFIG, {
      downPayment: 0,
      useManufacturerFinancing: false,
    });
    const withMfg = computePricing(p, DEFAULT_MD_FEES, DEFAULT_TAX_CONFIG, {
      downPayment: 0,
      useManufacturerFinancing: true,
    });
    expect(withMfg.amountFinanced).toBeCloseTo(
      withoutMfg.amountFinanced - 1000,
      2,
    );
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
