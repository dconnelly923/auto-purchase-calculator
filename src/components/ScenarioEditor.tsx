import { useMemo, useState } from "react";
import { Box, Button, Paper, Stack } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import GavelIcon from "@mui/icons-material/Gavel";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { LenderRates, Scenario, computeScenario } from "../scenario";
import LineItemsModal from "./LineItemsModal";
import MarylandTaxFeesModal from "./MarylandTaxFeesModal";
import FinancingRatesModal from "./FinancingRatesModal";
import VehicleDetailsModal from "./VehicleDetailsModal";
import BuyerContributionsModal from "./BuyerContributionsModal";
import ResultsPanel from "./ResultsPanel";

type Props = {
  scenario: Scenario;
  bankRates: LenderRates;
  manufacturerRates: LenderRates;
  onChange: (patch: Partial<Scenario>) => void;
  onBankRatesChange: (r: LenderRates) => void;
  onManufacturerRatesChange: (r: LenderRates) => void;
  onDuplicate: () => void;
};

type ModalKey =
  | "vehicle"
  | "buyer"
  | "financing"
  | "discounts"
  | "md"
  | "fees"
  | null;

export default function ScenarioEditor({
  scenario,
  bankRates,
  manufacturerRates,
  onChange,
  onBankRatesChange,
  onManufacturerRatesChange,
  onDuplicate,
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
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1}>
            <SettingButton
              icon={<DirectionsCarIcon />}
              label="Vehicle Details"
              onClick={() => setOpenModal("vehicle")}
            />
            <SettingButton
              icon={<AccountBalanceWalletIcon />}
              label="Down Payment & Trade-In"
              onClick={() => setOpenModal("buyer")}
            />
            <SettingButton
              icon={<AccountBalanceIcon />}
              label="Financing"
              onClick={() => setOpenModal("financing")}
            />
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
          </Stack>
        </Paper>
      </Box>
      <Box sx={{ flex: 1, position: "sticky", top: 16 }}>
        <ResultsPanel
          scenario={scenario}
          result={result}
          onEditVehicle={() => setOpenModal("vehicle")}
          onDuplicate={onDuplicate}
        />
      </Box>

      <VehicleDetailsModal
        open={openModal === "vehicle"}
        scenario={scenario}
        onChange={onChange}
        onClose={close}
      />
      <BuyerContributionsModal
        open={openModal === "buyer"}
        scenario={scenario}
        onChange={onChange}
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
