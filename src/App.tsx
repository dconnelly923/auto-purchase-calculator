import { useEffect, useState } from "react";
import { Container, Typography } from "@mui/material";
import {
  LenderRates,
  LineItem,
  Scenario,
  makeDefaultBankRates,
  makeDefaultManufacturerRates,
  makeDefaultScenario,
  newLineItem,
} from "./scenario";
import ScenarioBar, { ViewMode } from "./components/ScenarioBar";
import ScenarioEditor from "./components/ScenarioEditor";
import ComparisonView from "./components/ComparisonView";

const SCENARIO_STORAGE_KEY = "auto-purchase-calculator:state:v1";
const BANK_RATES_STORAGE_KEY = "auto-purchase-calculator:bank-rates:v1";
const MFR_RATES_STORAGE_KEY = "auto-purchase-calculator:manufacturer-rates:v1";

type PersistedState = {
  scenarios: unknown[];
  activeIndex: number;
};

function migrateScenario(raw: unknown): Scenario {
  const base = makeDefaultScenario();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown> & {
    condition?: Scenario["condition"];
    discounts?: LineItem[];
    additionalFees?: LineItem[];
  };

  const legacyDiscounts: LineItem[] = [];
  const num = (v: unknown) => (typeof v === "number" && v > 0 ? v : 0);
  if (num(r.dealerDiscount))
    legacyDiscounts.push(
      newLineItem("Dealer Discount", num(r.dealerDiscount), true),
    );
  if (num(r.customerCash))
    legacyDiscounts.push(
      newLineItem("Customer Cash", num(r.customerCash), true),
    );
  if (num(r.manufacturerRebate))
    legacyDiscounts.push(
      newLineItem("Manufacturer Rebate", num(r.manufacturerRebate), false),
    );
  if (num(r.financingConditionalCash))
    legacyDiscounts.push(
      newLineItem(
        "Financing-Conditional Cash",
        num(r.financingConditionalCash),
        false,
      ),
    );
  if (num(r.otherIncentive))
    legacyDiscounts.push(
      newLineItem(
        "Other Incentive",
        num(r.otherIncentive),
        r.otherIncentiveIsPretax !== false,
      ),
    );

  return {
    ...base,
    ...r,
    condition: r.condition === "used" ? "used" : "new",
    discounts: Array.isArray(r.discounts)
      ? r.discounts
      : legacyDiscounts.length
        ? legacyDiscounts
        : base.discounts,
    additionalFees: Array.isArray(r.additionalFees)
      ? r.additionalFees
      : base.additionalFees,
  } as Scenario;
}

function loadScenarios(): { scenarios: Scenario[]; activeIndex: number } | null {
  try {
    const raw = localStorage.getItem(SCENARIO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!Array.isArray(parsed.scenarios) || parsed.scenarios.length === 0) {
      return null;
    }
    return {
      scenarios: parsed.scenarios.map(migrateScenario),
      activeIndex: parsed.activeIndex ?? 0,
    };
  } catch {
    return null;
  }
}

function loadLenderRates(
  key: string,
  fallback: () => LenderRates,
): LenderRates {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback();
    const parsed = JSON.parse(raw) as Partial<LenderRates> & {
      bankName?: string;
    };
    if (!Array.isArray(parsed.newTiers) || !Array.isArray(parsed.usedTiers)) {
      return fallback();
    }
    return {
      name: parsed.name ?? parsed.bankName ?? fallback().name,
      newTiers: parsed.newTiers,
      usedTiers: parsed.usedTiers,
    };
  } catch {
    return fallback();
  }
}

export default function App() {
  const initial = loadScenarios();
  const [scenarios, setScenarios] = useState<Scenario[]>(
    () => initial?.scenarios ?? [makeDefaultScenario("Scenario 1")],
  );
  const [activeIndex, setActiveIndex] = useState(() =>
    initial ? Math.min(initial.activeIndex, initial.scenarios.length - 1) : 0,
  );
  const [bankRates, setBankRates] = useState<LenderRates>(() =>
    loadLenderRates(BANK_RATES_STORAGE_KEY, makeDefaultBankRates),
  );
  const [manufacturerRates, setManufacturerRates] = useState<LenderRates>(() =>
    loadLenderRates(MFR_RATES_STORAGE_KEY, makeDefaultManufacturerRates),
  );
  const [mode, setMode] = useState<ViewMode>("edit");

  useEffect(() => {
    try {
      localStorage.setItem(
        SCENARIO_STORAGE_KEY,
        JSON.stringify({ scenarios, activeIndex }),
      );
    } catch {
      // storage full or unavailable — drop the save silently
    }
  }, [scenarios, activeIndex]);

  useEffect(() => {
    try {
      localStorage.setItem(BANK_RATES_STORAGE_KEY, JSON.stringify(bankRates));
    } catch {
      // ignore
    }
  }, [bankRates]);

  useEffect(() => {
    try {
      localStorage.setItem(
        MFR_RATES_STORAGE_KEY,
        JSON.stringify(manufacturerRates),
      );
    } catch {
      // ignore
    }
  }, [manufacturerRates]);

  const updateActive = (patch: Partial<Scenario>) =>
    setScenarios((prev) =>
      prev.map((s, i) => (i === activeIndex ? { ...s, ...patch } : s)),
    );

  const addScenario = () => {
    setScenarios((prev) => [
      ...prev,
      makeDefaultScenario(`Scenario ${prev.length + 1}`),
    ]);
    setActiveIndex(scenarios.length);
    setMode("edit");
  };

  const duplicateActive = () => {
    setScenarios((prev) => {
      const src = prev[activeIndex];
      const copy: Scenario = {
        ...src,
        fees: { ...src.fees },
        name: `${src.name} (copy)`,
      };
      const next = [...prev];
      next.splice(activeIndex + 1, 0, copy);
      return next;
    });
    setActiveIndex(activeIndex + 1);
    setMode("edit");
  };

  const deleteActive = () => {
    if (scenarios.length <= 1) return;
    setScenarios((prev) => prev.filter((_, i) => i !== activeIndex));
    setActiveIndex((prev) => Math.max(0, prev - (activeIndex > 0 ? 1 : 0)));
    setMode("edit");
  };

  const selectScenario = (index: number) => {
    setActiveIndex(index);
    setMode("edit");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Auto Purchase Calculator
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Maryland mid-size pickup truck offer comparison.
      </Typography>

      <ScenarioBar
        scenarios={scenarios}
        activeIndex={activeIndex}
        mode={mode}
        onSelect={selectScenario}
        onAdd={addScenario}
        onCompare={() => setMode("compare")}
      />

      {mode === "edit" ? (
        <ScenarioEditor
          scenario={scenarios[activeIndex]}
          bankRates={bankRates}
          manufacturerRates={manufacturerRates}
          onChange={updateActive}
          onBankRatesChange={setBankRates}
          onManufacturerRatesChange={setManufacturerRates}
          onDuplicate={duplicateActive}
          onDelete={deleteActive}
          canDelete={scenarios.length > 1}
        />
      ) : (
        <ComparisonView
          scenarios={scenarios}
          bankRates={bankRates}
          manufacturerRates={manufacturerRates}
        />
      )}
    </Container>
  );
}
