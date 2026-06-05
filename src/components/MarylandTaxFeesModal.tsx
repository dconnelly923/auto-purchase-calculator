import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Scenario } from "../scenario";
import { MdFees } from "../calc/types";
import NumberField from "./NumberField";

type Props = {
  open: boolean;
  scenario: Scenario;
  onChange: (patch: Partial<Scenario>) => void;
  onClose: () => void;
};

export default function MarylandTaxFeesModal({
  open,
  scenario,
  onChange,
  onClose,
}: Props) {
  const setFee = (key: keyof MdFees, value: number) =>
    onChange({ fees: { ...scenario.fees, [key]: value } });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Maryland Tax & Fees
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
          <NumberField
            label="Excise Tax Rate"
            value={scenario.excisTaxRate * 100}
            onChange={(v) => onChange({ excisTaxRate: v / 100 })}
            min={0}
            max={12}
            step={0.1}
            adornment="%"
            helperText="MD rate is 6.5% as of 2025-07-01"
          />
          <NumberField
            label="Title Fee"
            value={scenario.fees.title}
            onChange={(v) => setFee("title", v)}
            min={0}
            max={500}
            step={5}
          />
          <NumberField
            label="Registration (biennial)"
            value={scenario.fees.registration}
            onChange={(v) => setFee("registration", v)}
            min={0}
            max={600}
            step={5}
            helperText="~$197.50 standard, ~$277.50 for trims over 5,000 lbs"
          />
          <NumberField
            label="Lien Recording Fee"
            value={scenario.fees.lienRecording}
            onChange={(v) => setFee("lienRecording", v)}
            min={0}
            max={100}
            step={5}
          />
          <NumberField
            label="Tire Recycling Fee"
            value={scenario.fees.tireRecycling}
            onChange={(v) => setFee("tireRecycling", v)}
            min={0}
            max={50}
            step={1}
          />
          <NumberField
            label="Other MD Fees"
            value={scenario.fees.other}
            onChange={(v) => setFee("other", v)}
            min={0}
            max={2000}
            step={25}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
