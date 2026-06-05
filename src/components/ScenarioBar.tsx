import { Box, Button, IconButton, Stack, Tab, Tabs } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { Scenario, scenarioDisplayName } from "../scenario";

export type ViewMode = "edit" | "compare";

type Props = {
  scenarios: Scenario[];
  activeIndex: number;
  mode: ViewMode;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onCompare: () => void;
  onDeleteScenario: (index: number) => void;
};

export default function ScenarioBar({
  scenarios,
  activeIndex,
  mode,
  onSelect,
  onAdd,
  onCompare,
  onDeleteScenario,
}: Props) {
  const canDelete = scenarios.length > 1;
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
          <Tab
            key={i}
            value={i}
            label={scenarioDisplayName(s, i)}
            iconPosition="end"
            icon={
              canDelete ? (
                <Box
                  component="span"
                  role="button"
                  aria-label="delete scenario"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteScenario(i);
                  }}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 0.25,
                    borderRadius: "50%",
                    color: "text.secondary",
                    "&:hover": {
                      color: "error.main",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <CloseIcon sx={{ fontSize: "1rem" }} />
                </Box>
              ) : undefined
            }
            sx={{ minHeight: 48 }}
          />
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
