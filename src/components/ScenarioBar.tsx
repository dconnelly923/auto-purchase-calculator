import { Box, Button, IconButton, Stack, Tab, Tabs } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { Scenario } from "../scenario";

export type ViewMode = "edit" | "compare";

type Props = {
  scenarios: Scenario[];
  activeIndex: number;
  mode: ViewMode;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onCompare: () => void;
};

export default function ScenarioBar({
  scenarios,
  activeIndex,
  mode,
  onSelect,
  onAdd,
  onCompare,
}: Props) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
    >
      <Tabs
        value={mode === "edit" ? activeIndex : false}
        onChange={(_, v) => onSelect(v as number)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {scenarios.map((s, i) => (
          <Tab key={i} label={s.name || `Scenario ${i + 1}`} value={i} />
        ))}
      </Tabs>
      <IconButton aria-label="add scenario" onClick={onAdd} size="small">
        <AddIcon />
      </IconButton>
      <Box sx={{ flexGrow: 1 }} />
      <Button
        startIcon={<CompareArrowsIcon />}
        variant={mode === "compare" ? "contained" : "outlined"}
        onClick={onCompare}
        disabled={scenarios.length < 2}
        size="small"
      >
        Compare All
      </Button>
    </Stack>
  );
}
