import { useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import GavelIcon from "@mui/icons-material/Gavel";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import {
  LenderRates,
  Scenario,
  VehicleCondition,
  computeScenario,
} from "../scenario";
import NumberField from "./NumberField";
import LineItemsModal from "./LineItemsModal";
import MarylandTaxFeesModal from "./MarylandTaxFeesModal";
import FinancingRatesModal from "./FinancingRatesModal";
import ResultsPanel from "./ResultsPanel";

type Props = {
  scenario: Scenario;
  bankRates: LenderRates;
  manufacturerRates: LenderRates;
  onChange: (patch: Partial<Scenario>) => void;
  onBankRatesChange: (r: LenderRates) => void;
  onManufacturerRatesChange: (r: LenderRates) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
};

type ModalKey = "discounts" | "md" | "fees" | "financing" | null;

export default function ScenarioEditor({
  scenario,
  bankRates,
  manufacturerRates,
  onChange,
  onBankRatesChange,
  onManufacturerRatesChange,
  onDuplicate,
  onDelete,
  canDelete,
}: Props) {
  const result = useMemo(
    () => computeScenario(scenario, bankRates, manufacturerRates),
    [scenario, bankRates, manufacturerRates],
  );
  const [openModal, setOpenModal] = useState<ModalKey>(null);
  const close = () => setOpenModal(null);

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
          <Tooltip
            title={
              canDelete ? "Delete scenario" : "Cannot delete the only scenario"
            }
          >
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

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <ToggleButtonGroup
              value={scenario.condition}
              exclusive
              fullWidth
              size="small"
              onChange={(_, v: VehicleCondition | null) =>
                v && onChange({ condition: v })
              }
            >
              <ToggleButton value="new">New</ToggleButton>
              <ToggleButton value="used">Used</ToggleButton>
            </ToggleButtonGroup>
            <NumberField
              label="Purchase Price"
              value={scenario.msrp}
              onChange={(v) => onChange({ msrp: v })}
              max={100000}
            />
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

            <Stack spacing={1}>
              <SettingButton
                icon={<LocalOfferIcon />}
                label="Discounts"
                count={scenario.discounts.length}
                onClick={() => setOpenModal("discounts")}
              />
              <SettingButton
                icon={<GavelIcon />}
                label="Maryland Tax & Fees"
                onClick={() => setOpenModal("md")}
              />
              <SettingButton
                icon={<ReceiptLongIcon />}
                label="Additional Fees"
                count={scenario.additionalFees.length}
                onClick={() => setOpenModal("fees")}
              />
              <SettingButton
                icon={<AccountBalanceIcon />}
                label="Financing Rates"
                onClick={() => setOpenModal("financing")}
              />
            </Stack>
          </Stack>
        </Paper>
      </Box>
      <Box sx={{ flex: 1, position: "sticky", top: 16 }}>
        <ResultsPanel result={result} />
      </Box>

      <LineItemsModal
        open={openModal === "discounts"}
        title="Discounts"
        emptyHint="No discounts yet. Add items like dealer discounts, rebates, or manufacturer cash. Pre-tax items reduce the taxable base; post-tax items reduce the amount financed only."
        addLabel="Add discount"
        itemPlaceholder="e.g. Dealer discount"
        items={scenario.discounts}
        onChange={(discounts) => onChange({ discounts })}
        onClose={close}
      />
      <MarylandTaxFeesModal
        open={openModal === "md"}
        scenario={scenario}
        onChange={onChange}
        onClose={close}
      />
      <LineItemsModal
        open={openModal === "fees"}
        title="Additional Fees"
        emptyHint="No additional fees yet. Add things like dealer doc fees. Pre-tax fees are added to the taxable base; post-tax fees are added to OTD without tax."
        addLabel="Add fee"
        itemPlaceholder="e.g. Dealer doc fee"
        items={scenario.additionalFees}
        onChange={(additionalFees) => onChange({ additionalFees })}
        onClose={close}
      />
      <FinancingRatesModal
        open={openModal === "financing"}
        bankRates={bankRates}
        manufacturerRates={manufacturerRates}
        onBankChange={onBankRatesChange}
        onManufacturerChange={onManufacturerRatesChange}
        onClose={close}
      />
    </Stack>
  );
}

function SettingButton({
  icon,
  label,
  count,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  const showCount = typeof count === "number" && count > 0;
  return (
    <Button
      startIcon={icon}
      onClick={onClick}
      variant="outlined"
      fullWidth
      sx={{ justifyContent: "flex-start" }}
    >
      {label}
      {showCount ? ` (${count})` : ""}
    </Button>
  );
}
