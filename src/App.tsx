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
  scenarioDisplayName,
} from "./scenario";
import ScenarioBar, { ViewMode } from "./components/ScenarioBar";
import ScenarioEditor from "./components/ScenarioEditor";
import ComparisonView from "./components/ComparisonView";

const SCENARIO_STORAGE_KEY = "auto-purchase-calculator:state:v1";
const BANK_RATES_STORAGE_KEY = "auto-purchase-calculator:bank-rates:v1";
const MFR_RATES_STORAGE_KEY = "auto-purchase-calculator:manufacturer-rates:v1";
const LEGACY_VEHICLES_STORAGE_KEY = "auto-purchase-calculator:vehicles:v1";

type PersistedState = {
  scenarios: unknown[];
  activeIndex: number;
};

type LegacyVehicle = {
  id: string;
  title?: string;
  imageUrl?: string;
  listingUrl?: string;
  vin?: string;
  condition?: "new" | "used";
};

function loadLegacyVehicles(): Record<string, LegacyVehicle> {
  try {
    const raw = localStorage.getItem(LEGACY_VEHICLES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return {};
    const byId: Record<string, LegacyVehicle> = {};
    (parsed as LegacyVehicle[]).forEach((v) => {
      if (v && typeof v.id === "string") byId[v.id] = v;
    });
    return byId;
  } catch {
    return {};
  }
}

function migrateScenario(
  raw: unknown,
  legacyVehicles: Record<string, LegacyVehicle>,
): Scenario {
  const base = makeDefaultScenario();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown> & {
    condition?: Scenario["condition"];
    discounts?: LineItem[];
    additionalFees?: LineItem[];
    vehicleId?: string;
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

  const linkedVehicle =
    typeof r.vehicleId === "string" ? legacyVehicles[r.vehicleId] : undefined;
  const str = (v: unknown) => (typeof v === "string" ? v : "");

  return {
    ...base,
    ...r,
    condition:
      r.condition === "used" || linkedVehicle?.condition === "used"
        ? "used"
        : "new",
    imageUrl: str(r.imageUrl) || str(linkedVehicle?.imageUrl) || "",
    listingUrl: str(r.listingUrl) || str(linkedVehicle?.listingUrl) || "",
    vin: str(r.vin) || str(linkedVehicle?.vin) || "",
    name:
      typeof r.name === "string" && r.name
        ? r.name
        : linkedVehicle?.title || base.name,
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
    const legacyVehicles = loadLegacyVehicles();
    return {
      scenarios: parsed.scenarios.map((s) => migrateScenario(s, legacyVehicles)),
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
    () => initial?.scenarios ?? [makeDefaultScenario()],
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
    setScenarios((prev) => [...prev, makeDefaultScenario()]);
    setActiveIndex(scenarios.length);
    setMode("edit");
  };

  const duplicateActive = () => {
    setScenarios((prev) => {
      const src = prev[activeIndex];
      const copy: Scenario = {
        ...src,
        fees: { ...src.fees },
        name: `${scenarioDisplayName(src, activeIndex)} (copy)`,
      };
      const next = [...prev];
      next.splice(activeIndex + 1, 0, copy);
      return next;
    });
    setActiveIndex(activeIndex + 1);
    setMode("edit");
  };

  const deleteAt = (index: number) => {
    if (scenarios.length <= 1) return;
    setScenarios((prev) => prev.filter((_, i) => i !== index));
    setActiveIndex((prev) => {
      if (index < prev) return prev - 1;
      if (index === prev) return Math.max(0, prev - 1);
      return prev;
    });
    setMode("edit");
  };

  const selectScenario = (index: number) => {
    setActiveIndex(index);
    setMode("edit");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" sx={{ mb: 3, fontWeight: 700 }}>
        Auto Purchase Calculator
      </Typography>

      <ScenarioBar
        scenarios={scenarios}
        activeIndex={activeIndex}
        mode={mode}
        onSelect={selectScenario}
        onAdd={addScenario}
        onCompare={() => setMode("compare")}
        onDeleteScenario={deleteAt}
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
