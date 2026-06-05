import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
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

export default function BuyerContributionsModal({
  open,
  scenario,
  onChange,
  onClose,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Down Payment & Trade-In
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
            label="Down Payment"
            value={scenario.downPayment}
            onChange={(v) => onChange({ downPayment: v })}
            max={50000}
          />
          <NumberField
            label="Trade-In Allowance"
            value={scenario.tradeIn}
            onChange={(v) => onChange({ tradeIn: v })}
            max={50000}
            helperText="Pre-tax; deductible from MD taxable base"
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
