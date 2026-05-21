import { useMemo, useState } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import { makeDefaultScenario, computeScenario, Scenario } from "./scenario";
import PricingSection from "./components/PricingSection";
import FeesSection from "./components/FeesSection";
import FinancingSection from "./components/FinancingSection";
import ResultsPanel from "./components/ResultsPanel";

export default function App() {
  const [scenario, setScenario] = useState<Scenario>(() =>
    makeDefaultScenario(),
  );

  const update = (patch: Partial<Scenario>) =>
    setScenario((prev) => ({ ...prev, ...patch }));

  const result = useMemo(() => computeScenario(scenario), [scenario]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Auto Purchase Calculator
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Maryland mid-size pickup truck offer comparison.
      </Typography>

      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Box sx={{ flex: "0 0 420px" }}>
          <PricingSection scenario={scenario} onChange={update} />
          <FeesSection scenario={scenario} onChange={update} />
          <FinancingSection scenario={scenario} onChange={update} />
        </Box>
        <Box sx={{ flex: 1, position: "sticky", top: 16 }}>
          <ResultsPanel
            result={result}
            showInterestSaved={scenario.extraMonthlyPrincipal > 0}
          />
        </Box>
      </Stack>
    </Container>
  );
}
