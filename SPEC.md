# Auto Purchase Calculator — Specification

A browser-based tool for evaluating mid-size pickup truck purchase offers in Maryland. Compares mutually-exclusive offers (e.g., 0% APR vs. cash back) in real dollar terms to support research and dealership-day negotiation.

---

## 1. Tech Stack

- **Framework:** React
- **Build tool:** Vite
- **Language:** TypeScript
- **Component library:** MUI (Material-UI)
- **State:** React built-in (`useState` / `useReducer`) + a custom `useLocalStorage` hook
- **Testing:** Vitest, scoped to math functions only (tax calc, amortization, extra principal, break-even)
- **Runtime:** Local only via `npm run dev`. No backend, no database, no hosting.

---

## 2. Domain Rules — Maryland (as of 2025-07-01, per HB 352)

### 2.1 Excise tax
- Rate: **6.5%** (editable in UI for future-proofing)
- Applied to: `purchase_price − dealer_discount − customer_cash − trade_in_allowance`
- Trade-in IS deductible from the taxable base (MD-specific — verified)
- Manufacturer rebates do NOT reduce taxable amount
- No book-value minimum check (out of scope)

### 2.2 Fees (itemized, all editable)
| Fee | Default | Notes |
|---|---|---|
| Title | $200 | Per HB 352 |
| Registration (biennial) | $197.50 | Class E truck, 3,501–5,000 lbs shipping weight. Override for heavier trims (~$277.50 for >5,000 lbs) |
| Lien recording | $20 | |
| Tire recycling | $3 | |
| Other fees | $0 | Free-form field for dealer doc fees and anything else |

---

## 3. Inputs

### 3.1 Pricing (itemized build-up)
- MSRP
- Dealer discount (pre-tax)
- Customer cash incentive (pre-tax)
- Trade-in allowance (pre-tax, MD-deductible)
- Manufacturer rebate (post-tax)
- Financing-conditional cash (post-tax; only applies when manufacturer financing is used)
- Other incentive (with pre/post-tax toggle — for Costco/AAA-style discounts)

### 3.2 Financing
- Down payment (number field + slider)
- APR tier schedule — a table of `{term_months, apr}` rows (e.g., 36mo/0%, 48mo/1.9%, 60mo/3.9%, 72mo/4.9%)
- Extra monthly principal payment (number field + slider)

### 3.3 Investment-vs-loan break-even
- Available cash on hand
- After-tax HYSA APY (helper text: "for a HYSA at X%, enter X × (1 − marginal tax rate)")

---

## 4. Calculations

### 4.1 Taxable price
```
taxable_price = MSRP − dealer_discount − customer_cash − trade_in − other_incentive_pretax
```

### 4.2 Tax & fees
```
excise_tax = taxable_price × 0.065
total_fees = title + registration + lien + tire + other_fees
```

### 4.3 Amount financed
```
amount_financed
  = taxable_price + excise_tax + total_fees
  − down_payment
  − manufacturer_rebate
  − financing_conditional_cash (if manufacturer financing)
  − other_incentive_posttax
```

### 4.4 Monthly payment (standard amortization)
For each row in the APR tier schedule:
```
r = (apr / 100) / 12
n = term_months
P = amount_financed
M = P × (r × (1+r)^n) / ((1+r)^n − 1)   // if r = 0, then M = P / n
total_interest = (M × n) − P
total_cost = (M × n) + down_payment + manufacturer_rebate (already paid out)
```

### 4.5 Extra principal payments — interest saved
Month-by-month simulation: apply scheduled payment + extra principal each month until balance = 0. Sum interest. Compare to baseline (no extra principal). Output: `interest_saved = baseline_interest − accelerated_interest`.

### 4.6 Investment-vs-loan break-even
Assumes monthly payments come from income (not the cash reserve) and the cash reserve sits in HYSA for the loan term.

For each candidate down payment `D` from `[0, cash_on_hand]`:
```
loan_interest(D) = total_interest computed at amount_financed minus D
foregone_investment(D) = D × ((1 + after_tax_apy/12)^n − 1)
net_cost(D) = loan_interest(D) + foregone_investment(D)
```
Find `D*` that minimizes `net_cost(D)`. Display: optimal down payment, net savings vs. putting full cash down, net savings vs. zero down.

---

## 5. Outputs (per scenario)

Headline numbers (always visible):
- Out-the-door price (taxable_price + tax + fees − all pre-tax incentives)
- Amount financed
- Monthly payment (per APR tier row)
- Total interest paid (per APR tier row)
- Total cost of ownership across loan life (per APR tier row)
- Interest saved from extra principal (single number)
- Investment-vs-loan break-even result (optimal down payment + net savings)

---

## 6. Scenario Management

- **Named saved scenarios** persisted in `localStorage`
- **Side-by-side comparison view** showing 2+ scenarios as parallel columns
- **Auto-highlighted winning cell per row** (e.g., lowest monthly payment, lowest total cost) — green highlight, no opinionated recommendation
- **JSON export/import** for portability between devices

---

## 7. UX Requirements

- **Desktop-only** layout. No mobile concessions.
- **Real-time updates** as user adjusts any input
- **Number field + slider pattern** for all financial inputs (down payment, APR, trade-in, term, extra principal, etc.)
- **APR tier schedule** displays all term options simultaneously, not one at a time

---

## 8. Out of Scope

Explicitly NOT included:
- Lease modeling (residuals, money factor, miles cap, etc.)
- Multi-state tax support — MD only
- Mobile UI
- Insurance, fuel, maintenance, total cost of ownership over time
- Resale value / depreciation
- EV tax credits
- Previous vehicle private-sale excise credit
- Book-value minimum tax check
- Full amortization tables (only interest saved for extra principal)
- Months-shaved / new payoff date for extra principal
- Dedicated APR break-even solver (achievable interactively via comparison view + sliders)
- PDF export
- Shareable URL links
- Backend, database, hosted deployment
- Authentication or multi-user support
