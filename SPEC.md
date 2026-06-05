# Auto Purchase Calculator — Specification

A browser-based tool for evaluating mid-size pickup truck purchase offers in Maryland. Compares mutually-exclusive offers (e.g., 0% APR vs. cash back) in real dollar terms to support research and dealership-day negotiation.

---

## 1. Tech Stack

- **Framework:** React
- **Build tool:** Vite
- **Language:** TypeScript
- **Component library:** MUI (Material-UI)
- **State:** React built-in (`useState` / `useReducer`); scenarios persisted to `localStorage`
- **Testing:** Vitest, scoped to math functions only (tax calc, amortization)
- **Runtime:** Local only via `npm run dev`. No backend, no database, no hosting.

---

## 2. Domain Rules — Maryland (as of 2025-07-01, per HB 352)

### 2.1 Excise tax
- Rate: **6.5%** (editable in UI for future-proofing)
- Applied to: `purchase_price − trade_in_allowance − pre_tax_discounts + pre_tax_fees`
- Trade-in IS deductible from the taxable base (MD-specific — verified)
- Pre-tax discounts (dealer discount, customer cash, etc.) reduce the taxable base
- Post-tax discounts (manufacturer rebate, etc.) do NOT reduce the taxable base — applied to amount financed only
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

Inputs are grouped in the UI by who is contributing what.

Each scenario represents one vehicle. The vehicle's identifying metadata (title, picture, listing URL, VIN, new/used) is stored directly on the scenario.

### 3.1 Main panel (always visible)
- Vehicle header card: thumbnail + display name + condition + purchase price + VIN + listing link (clickable to open Vehicle Details)
- Duplicate / delete scenario actions
- A stack of settings buttons opening each of the modals in §3.2

Display name resolves as: `name` override → composed `Year Make Model` → `Scenario N`. The same value is used for the tab label.

### 3.2 Settings modals (opened from buttons under the main panel)

#### Vehicle Details
- New/Used toggle
- Year (number, 0 = unset), Make, Model
- Optional Title override (used as display name when set, otherwise falls back to `Year Make Model`)
- Purchase Price (MSRP / agreed)
- VIN (auto-uppercased, capped at 17 chars; no checksum validation)
- Image URL (rendered as thumbnail; URL-only, no upload)
- Listing URL (open in new tab)

#### Down Payment & Trade-In
- Down payment (cash from buyer at signing)
- Trade-in allowance (pre-tax, MD-deductible from taxable base)

#### Discounts
- Empty by default. User adds custom line items with: label, amount, pre-tax/post-tax toggle.
- Pre-tax discounts reduce the taxable base and the amount financed.
- Post-tax discounts reduce the amount financed only.

#### Maryland Tax & Fees
- Excise tax rate + the itemized fees from §2.2 (per-scenario; defaults seeded from §2.2).

#### Additional Fees
- Empty by default. User adds custom line items with: label, amount, pre-tax/post-tax toggle.
- Pre-tax fees are added to the taxable base (taxed) and to OTD/financed amount.
- Post-tax fees are added to OTD/financed amount without tax.

#### Financing Rates (global)
Single modal with tabs for **Bank/Credit Union** (default: "Navy Federal Credit Union") and **Manufacturer**. Each lender stores a name plus new and used APR tier schedules. Saved globally in `localStorage` (separate keys per lender) and shared across all scenarios. The active scenario's new/used toggle selects which table is used for that lender's comparison.

---

## 4. Calculations

### 4.1 Taxable price
```
taxable_price = max(0, MSRP − trade_in − pretax_discounts + pretax_fees)
```

### 4.2 Tax & MD fees
```
excise_tax = taxable_price × excise_tax_rate
total_md_fees = title + registration + lien + tire + other_md
```

### 4.3 Out-the-door price + amount financed
```
otd_price = taxable_price + excise_tax + total_md_fees + posttax_fees
amount_financed = max(0, otd_price − down_payment − posttax_discounts)
```
A single amount-financed value is used for both lender comparisons; the two lenders differ only by APR tier schedule.

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

---

## 5. Outputs (per scenario)

Headline numbers (always visible):
- Lowest monthly payment across both lenders (with lender + term + APR label)
- Out-the-door price
- Amount financed

Two loan tables shown stacked, one per lender (bank then manufacturer):
- Monthly payment / total interest / total cost per APR tier
- Lowest monthly payment and lowest total cost highlighted within each table

---

## 6. Scenario Management

- **Named scenarios** persisted to `localStorage` and rehydrated on load
- **Bank rates** and **Manufacturer rates** persisted globally to `localStorage` (separate keys) — one editable rate sheet per lender, shared across scenarios
- **Side-by-side comparison view** showing 2+ scenarios as parallel columns, compared at a selectable loan term
- **Auto-highlighted winning cell per row** (e.g., lowest monthly payment, lowest total paid) — green highlight, no opinionated recommendation

---

## 7. UX Requirements

- **Desktop-only** layout. No mobile concessions.
- **Real-time updates** as user adjusts any input
- **Number field + slider pattern** for all financial inputs (down payment, APR, trade-in, term, etc.)
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
- Full amortization tables
- Extra-principal / accelerated-payoff modeling
- Dedicated APR break-even solver (achievable interactively via comparison view + sliders)
- Investment-vs-loan break-even / opportunity-cost modeling against a HYSA
- JSON export/import
- PDF export
- Shareable URL links
- Backend, database, hosted deployment
- Authentication or multi-user support
