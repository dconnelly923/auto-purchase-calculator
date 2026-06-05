import { useEffect, useState } from "react";
import { Container, Typography } from "@mui/material";
import { makeDefaultScenario, Scenario } from "./scenario";
import ScenarioBar, { ViewMode } from "./components/ScenarioBar";
import ScenarioEditor from "./components/ScenarioEditor";
import ComparisonView from "./components/ComparisonView";

const STORAGE_KEY = "auto-purchase-calculator:state:v1";

type PersistedState = {
  scenarios: Scenario[];
  activeIndex: number;
};

function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!Array.isArray(parsed.scenarios) || parsed.scenarios.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export default function App() {
  const initial = loadState();
  const [scenarios, setScenarios] = useState<Scenario[]>(
    () => initial?.scenarios ?? [makeDefaultScenario("Scenario 1")],
  );
  const [activeIndex, setActiveIndex] = useState(() =>
    initial ? Math.min(initial.activeIndex, initial.scenarios.length - 1) : 0,
  );
  const [mode, setMode] = useState<ViewMode>("edit");

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ scenarios, activeIndex }),
      );
    } catch {
      // storage full or unavailable — drop the save silently
    }
  }, [scenarios, activeIndex]);

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
      const copy: Scenario = {
        ...prev[activeIndex],
        fees: { ...prev[activeIndex].fees },
        aprTiers: prev[activeIndex].aprTiers.map((t) => ({ ...t })),
        name: `${prev[activeIndex].name} (copy)`,
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
          onChange={updateActive}
          onDuplicate={duplicateActive}
          onDelete={deleteActive}
          canDelete={scenarios.length > 1}
        />
      ) : (
        <ComparisonView scenarios={scenarios} />
      )}
    </Container>
  );
}
