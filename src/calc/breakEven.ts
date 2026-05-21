import { totalInterest } from "./amortization";

export type BreakEvenInput = {
  amountFinancedAtZeroDown: number;
  aprPercent: number;
  termMonths: number;
  cashOnHand: number;
  afterTaxApyPercent: number;
};

export type BreakEvenResult = {
  optimalDownPayment: number;
  netCostAtOptimal: number;
  netCostAtZeroDown: number;
  netCostAtFullCash: number;
  savingsVsZeroDown: number;
  savingsVsFullCash: number;
};

function foregoneInvestment(
  downPayment: number,
  apyPercent: number,
  termMonths: number,
): number {
  if (downPayment <= 0 || apyPercent <= 0) return 0;
  const monthlyRate = apyPercent / 100 / 12;
  return downPayment * (Math.pow(1 + monthlyRate, termMonths) - 1);
}

function netCost(
  downPayment: number,
  input: BreakEvenInput,
): number {
  const financed = Math.max(
    0,
    input.amountFinancedAtZeroDown - downPayment,
  );
  const loanInterest = totalInterest(
    financed,
    input.aprPercent,
    input.termMonths,
  );
  const foregone = foregoneInvestment(
    downPayment,
    input.afterTaxApyPercent,
    input.termMonths,
  );
  return loanInterest + foregone;
}

export function findOptimalDownPayment(input: BreakEvenInput): BreakEvenResult {
  const max = Math.min(input.cashOnHand, input.amountFinancedAtZeroDown);
  const steps = 200;
  const stepSize = max / steps;

  let bestD = 0;
  let bestCost = netCost(0, input);

  for (let i = 1; i <= steps; i += 1) {
    const d = i * stepSize;
    const cost = netCost(d, input);
    if (cost < bestCost) {
      bestCost = cost;
      bestD = d;
    }
  }

  const netCostAtZeroDown = netCost(0, input);
  const netCostAtFullCash = netCost(max, input);

  return {
    optimalDownPayment: bestD,
    netCostAtOptimal: bestCost,
    netCostAtZeroDown,
    netCostAtFullCash,
    savingsVsZeroDown: netCostAtZeroDown - bestCost,
    savingsVsFullCash: netCostAtFullCash - bestCost,
  };
}
