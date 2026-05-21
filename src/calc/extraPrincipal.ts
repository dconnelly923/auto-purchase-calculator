import { monthlyPayment, totalInterest } from "./amortization";

export function interestSavedFromExtraPrincipal(
  principal: number,
  aprPercent: number,
  termMonths: number,
  extraMonthly: number,
): number {
  if (principal <= 0 || termMonths <= 0 || extraMonthly <= 0) return 0;

  const baselineInterest = totalInterest(principal, aprPercent, termMonths);
  const scheduledPayment = monthlyPayment(principal, aprPercent, termMonths);
  const monthlyRate = aprPercent / 100 / 12;

  let balance = principal;
  let interestPaid = 0;
  let months = 0;
  const maxMonths = termMonths * 2; // safety cap

  while (balance > 0.005 && months < maxMonths) {
    const interestThisMonth = balance * monthlyRate;
    const totalPaymentThisMonth = scheduledPayment + extraMonthly;
    const payment = Math.min(totalPaymentThisMonth, balance + interestThisMonth);
    const principalThisMonth = payment - interestThisMonth;
    balance -= principalThisMonth;
    interestPaid += interestThisMonth;
    months += 1;
  }

  return Math.max(0, baselineInterest - interestPaid);
}
