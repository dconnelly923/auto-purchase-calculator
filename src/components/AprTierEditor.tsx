import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { AprTier } from "../calc/types";

type Props = {
  tiers: AprTier[];
  onChange: (tiers: AprTier[]) => void;
  title?: string;
};

export default function AprTierEditor({ tiers, onChange, title = "APR Tier Schedule" }: Props) {
  const updateTier = (index: number, patch: Partial<AprTier>) => {
    onChange(tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  };

  const removeTier = (index: number) => {
    onChange(tiers.filter((_, i) => i !== index));
  };

  const addTier = () => {
    onChange([...tiers, { termMonths: 60, apr: 5.9 }]);
  };

  const parseNum = (raw: string) => {
    const v = parseFloat(raw);
    return Number.isFinite(v) ? v : 0;
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Stack spacing={1}>
        {tiers.map((tier, index) => (
          <Stack key={index} direction="row" spacing={1} alignItems="center">
            <TextField
              label="Term"
              type="number"
              size="small"
              value={tier.termMonths}
              onChange={(e) =>
                updateTier(index, { termMonths: parseNum(e.target.value) })
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">mo</InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="APR"
              type="number"
              size="small"
              value={tier.apr}
              onChange={(e) =>
                updateTier(index, { apr: parseNum(e.target.value) })
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                },
              }}
            />
            <IconButton
              aria-label="remove tier"
              size="small"
              onClick={() => removeTier(index)}
              disabled={tiers.length <= 1}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Button
        startIcon={<AddIcon />}
        size="small"
        onClick={addTier}
        sx={{ mt: 1 }}
      >
        Add Tier
      </Button>
    </Box>
  );
}
