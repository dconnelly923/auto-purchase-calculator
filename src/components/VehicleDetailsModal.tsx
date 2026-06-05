import {
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Scenario } from "../scenario";
import NumberField from "./NumberField";

type Props = {
  open: boolean;
  scenario: Scenario;
  onChange: (patch: Partial<Scenario>) => void;
  onClose: () => void;
};

export default function VehicleDetailsModal({
  open,
  scenario,
  onChange,
  onClose,
}: Props) {
  const setYear = (raw: string) => {
    const v = parseInt(raw, 10);
    onChange({ year: Number.isFinite(v) && v > 0 ? v : 0 });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Vehicle Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={scenario.condition === "used"}
                onChange={(e) =>
                  onChange({ condition: e.target.checked ? "used" : "new" })
                }
              />
            }
            label={`Condition: ${scenario.condition === "used" ? "Used" : "New"}`}
          />

          <Stack direction="row" spacing={1}>
            <TextField
              label="Year"
              type="number"
              value={scenario.year > 0 ? scenario.year : ""}
              onChange={(e) => setYear(e.target.value)}
              size="small"
              sx={{ width: 110 }}
            />
            <TextField
              label="Make"
              placeholder="Toyota"
              value={scenario.make}
              onChange={(e) => onChange({ make: e.target.value })}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Model"
              placeholder="Tacoma"
              value={scenario.model}
              onChange={(e) => onChange({ model: e.target.value })}
              size="small"
              sx={{ flex: 1 }}
            />
          </Stack>

          <TextField
            label="Title (optional override)"
            placeholder="e.g. 2025 Toyota Tacoma TRD Off-Road"
            value={scenario.name}
            onChange={(e) => onChange({ name: e.target.value })}
            size="small"
            fullWidth
            helperText="Leave blank to use Year Make Model automatically."
          />

          <NumberField
            label="Purchase Price"
            value={scenario.msrp}
            onChange={(v) => onChange({ msrp: v })}
            max={100000}
            helperText="MSRP or agreed price."
          />

          <Typography variant="caption" color="text.secondary">
            Identification &amp; references
          </Typography>
          <TextField
            label="VIN"
            value={scenario.vin}
            onChange={(e) =>
              onChange({ vin: e.target.value.toUpperCase().slice(0, 17) })
            }
            size="small"
            fullWidth
          />
          <TextField
            label="Image URL"
            placeholder="https://…"
            value={scenario.imageUrl}
            onChange={(e) => onChange({ imageUrl: e.target.value })}
            size="small"
            fullWidth
          />
          <TextField
            label="Listing URL"
            placeholder="https://…"
            value={scenario.listingUrl}
            onChange={(e) => onChange({ listingUrl: e.target.value })}
            size="small"
            fullWidth
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
