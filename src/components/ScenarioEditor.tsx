import { useMemo } from "react";
import { Box, IconButton, Stack, TextField, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import { Scenario, computeScenario } from "../scenario";
import VehicleSection from "./VehicleSection";
import BuyerSection from "./BuyerSection";
import IncentivesSection from "./IncentivesSection";
import FeesSection from "./FeesSection";
import FinancingSection from "./FinancingSection";
import ResultsPanel from "./ResultsPanel";

type Props = {
  scenario: Scenario;
  onChange: (patch: Partial<Scenario>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
};

export default function ScenarioEditor({
  scenario,
  onChange,
  onDuplicate,
  onDelete,
  canDelete,
}: Props) {
  const result = useMemo(() => computeScenario(scenario), [scenario]);

  return (
    <Stack direction="row" spacing={3} alignItems="flex-start">
      <Box sx={{ flex: "0 0 420px" }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            label="Scenario Name"
            value={scenario.name}
            onChange={(e) => onChange({ name: e.target.value })}
            size="small"
            fullWidth
          />
          <Tooltip title="Duplicate scenario">
            <IconButton onClick={onDuplicate} size="small">
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={canDelete ? "Delete scenario" : "Cannot delete the only scenario"}>
            <span>
              <IconButton
                onClick={onDelete}
                disabled={!canDelete}
                color="error"
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
        <VehicleSection scenario={scenario} onChange={onChange} />
        <BuyerSection scenario={scenario} onChange={onChange} />
        <IncentivesSection scenario={scenario} onChange={onChange} />
        <FeesSection scenario={scenario} onChange={onChange} />
        <FinancingSection scenario={scenario} onChange={onChange} />
      </Box>
      <Box sx={{ flex: 1, position: "sticky", top: 16 }}>
        <ResultsPanel result={result} />
      </Box>
    </Stack>
  );
}
