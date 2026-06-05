import { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LenderRates } from "../scenario";
import AprTierEditor from "./AprTierEditor";

type Props = {
  open: boolean;
  bankRates: LenderRates;
  manufacturerRates: LenderRates;
  onBankChange: (r: LenderRates) => void;
  onManufacturerChange: (r: LenderRates) => void;
  onClose: () => void;
};

export default function FinancingRatesModal({
  open,
  bankRates,
  manufacturerRates,
  onBankChange,
  onManufacturerChange,
  onClose,
}: Props) {
  const [tab, setTab] = useState<"bank" | "manufacturer">("bank");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Financing Rates
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab value="bank" label="Bank / Credit Union" />
          <Tab value="manufacturer" label="Manufacturer" />
        </Tabs>

        {tab === "bank" ? (
          <RatesEditor
            nameLabel="Bank / Credit Union"
            rates={bankRates}
            onChange={onBankChange}
          />
        ) : (
          <RatesEditor
            nameLabel="Manufacturer"
            rates={manufacturerRates}
            onChange={onManufacturerChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function RatesEditor({
  nameLabel,
  rates,
  onChange,
}: {
  nameLabel: string;
  rates: LenderRates;
  onChange: (r: LenderRates) => void;
}) {
  return (
    <Stack spacing={2}>
      <TextField
        label={nameLabel}
        value={rates.name}
        onChange={(e) => onChange({ ...rates, name: e.target.value })}
        size="small"
        fullWidth
      />
      <Typography variant="caption" color="text.secondary">
        Saved globally. The active scenario's new/used toggle selects which
        table is used.
      </Typography>
      <Divider />
      <Box>
        <AprTierEditor
          title="New Vehicle Rates"
          tiers={rates.newTiers}
          onChange={(newTiers) => onChange({ ...rates, newTiers })}
        />
      </Box>
      <Divider />
      <Box>
        <AprTierEditor
          title="Used Vehicle Rates"
          tiers={rates.usedTiers}
          onChange={(usedTiers) => onChange({ ...rates, usedTiers })}
        />
      </Box>
    </Stack>
  );
}
