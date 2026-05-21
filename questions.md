# Clarifying Questions

Answer inline under each **Answer:** prompt. Skip any that don't matter to you and we'll use sensible defaults.

---

## A. Maryland Taxes & Fees

### A1. Excise tax basis
Maryland charges 6% excise tax on the **full purchase price** (trade-in does NOT reduce the taxable amount, unlike many states). It also enforces a minimum tax based on the vehicle's book value.

- Should the calculator compute tax as `6% × purchase_price` flat?
- Or include the book-value minimum check (would require a "book value" input)?
- Should it expose the tax rate as an editable field in case rules change?

**Answer:**

---

### A2. Title, registration, and miscellaneous fees
Typical MD fees for a pickup:
- Title fee (~$100)
- Registration (~$187 for trucks ≤3,700 lbs class; higher for heavier)
- Tag transfer or new tag fee
- Tire recycling fee (~$3)
- Lien recording fee (~$20)

Do you want:
- A single editable "MD fees" lump sum field, **OR**
- Itemized line items with editable defaults, **OR**
- Auto-calculated based on vehicle weight (more work, more accurate)?

**Answer:**

---

### A3. Previous vehicle sale credit
MD offers an excise tax credit if you sell/trade a vehicle within a specific window of the purchase. Is this relevant to your situation, or should we ignore it?

**Answer:**

---

## B. Pricing & Incentives

### B1. Price input granularity
Do you want to enter a single "negotiated out-the-door price," or break it into:
- MSRP
- Dealer discount
- Manufacturer rebate (post-tax in MD)
- Customer cash incentive (pre-tax — reduces taxable amount)

The distinction matters because **rebates after tax** vs **price reductions before tax** are taxed differently.

**Answer:**

---

### B2. Incentive types to model
Check all that apply:
- [ ] Customer cash back (price reduction)
- [ ] Manufacturer rebate (applied after tax)
- [ ] Subvented low/0% APR for specific terms
- [ ] Financing-conditional cash (only if you finance through manufacturer)
- [ ] Loyalty / conquest / military / first responder cash
- [ ] Lease cash (if leases are in scope — see C3)
- [ ] Other: ___

**Answer:**

---

### B3. Tiered APR by term
Manufacturer APR offers often vary by term length (e.g., 0% for 36 mo, 1.9% for 48 mo, 3.9% for 60 mo). Do you want to:
- Enter a single APR + term, **OR**
- Enter a "rate schedule" and have the tool show all term options side-by-side?

**Answer:**

---

## C. Financing & Money

### C1. Down payment optimization
Is your down payment a fixed amount, or do you want a slider to see how varying it (e.g., $0 → $15,000) changes monthly payment and total interest?

**Answer:**

---

### C2. Cash vs. finance opportunity cost
If you have cash sitting in a HYSA at ~4.5% APY, paying it as a down payment has an opportunity cost. Should the tool optionally show the **break-even** between investing cash vs. paying down the loan?

**Answer:**

---

### C3. Lease as an alternative
Mid-size trucks (Tacoma, Ranger, Colorado, Frontier, Maverick) often have competitive lease offers. Should leasing be in scope, or is this a buy-only calculator?

**Answer:**

---

### C4. Extra principal payments — outputs
You mentioned optional extra monthly principal. Which outputs matter?
- [ ] Total interest saved
- [ ] Months shaved off loan
- [ ] New payoff date
- [ ] Amortization table showing the difference

**Answer:**

---

## D. Comparison & Decision Support

### D1. Scenario comparison UX
How do you want to compare offers?
- Side-by-side columns (e.g., "0% APR" vs "$3K cash back + bank financing")
- Save named scenarios and toggle between them
- Single live editor — you mentally track the comparison
- All of the above (scenarios list + side-by-side view)

**Answer:**

---

### D2. "Which deal wins?" summary
Should the tool produce an explicit **recommendation** (e.g., "Offer A saves you $1,847 over the loan life") or just present numbers and let you decide?

**Answer:**

---

### D3. APR break-even calculator
A common question: "How much cash back would I need to make a 6% APR offer beat a 0% APR offer?" Want a dedicated break-even view for this?

**Answer:**

---

## E. UX & Usability

### E1. Primary device at dealership
Will you mostly use this on:
- Phone (mobile-first design)
- Laptop
- Both — needs to work well on either

**Answer:**

---

### E2. Persistence
Should scenarios persist across browser sessions (saved to local storage), or is it fine if a refresh wipes them?

**Answer:**

---

### E3. Export / share
Useful to export a scenario as PDF or shareable link (e.g., to show a spouse, or save as a record of the dealership offer)?

**Answer:**

---

## F. Out-of-Scope Confirmation

Confirming the following are **NOT** in scope unless you say otherwise:
- Insurance cost modeling
- Maintenance / fuel / TCO over time
- Resale value depreciation
- EV federal/state tax credits
- Multi-state tax support (MD only)

**Answer (anything to move back in scope?):**

---

## G. Tech Preferences (optional)

Any preferences on stack? Defaults I'd lean toward unless you say otherwise:
- Single-page app, no backend
- React + Vite, or vanilla JS if you want minimal tooling
- Tailwind for styling
- Hosted on GitHub Pages / Netlify / Vercel

**Answer:**
