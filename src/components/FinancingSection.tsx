import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Scenario } from "../scenario";
import NumberField from "./NumberField";
import AprTierEditor from "./AprTierEditor";

type Props = {
  scenario: Scenario;
  onChange: (patch: Partial<Scenario>) => void;
};

export default function FinancingSection({ scenario, onChange }: Props) {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Financing</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <AprTierEditor
          tiers={scenario.aprTiers}
          onChange={(aprTiers) => {
            const maxIndex = Math.max(0, aprTiers.length - 1);
            onChange({
              aprTiers,
              breakEvenTierIndex: Math.min(
                scenario.breakEvenTierIndex,
                maxIndex,
              ),
            });
          }}
        />

        <Divider sx={{ my: 2 }} />
        <NumberField
          label="Total Monthly Payment"
          value={scenario.totalMonthlyPayment}
          onChange={(v) => onChange({ totalMonthlyPayment: v })}
          max={3000}
          step={25}
          helperText="Anything above a tier's scheduled payment goes to principal. Leave at 0 to just pay the scheduled amount."
        />

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Investment-vs-Loan Break-Even
        </Typography>
        <NumberField
          label="Available Cash on Hand"
          value={scenario.cashOnHand}
          onChange={(v) => onChange({ cashOnHand: v })}
          max={100000}
        />
        <NumberField
          label="After-Tax HYSA APY"
          value={scenario.afterTaxApyPercent}
          onChange={(v) => onChange({ afterTaxApyPercent: v })}
          min={0}
          max={10}
          step={0.1}
          adornment="%"
          helperText="For a HYSA at X%, enter X × (1 − marginal tax rate)"
        />
        <FormControl size="small" fullWidth sx={{ mt: 1 }}>
          <InputLabel id="break-even-tier-label">
            Break-even based on
          </InputLabel>
          <Select
            labelId="break-even-tier-label"
            label="Break-even based on"
            value={
              scenario.aprTiers.length
                ? Math.min(
                    scenario.breakEvenTierIndex,
                    scenario.aprTiers.length - 1,
                  )
                : 0
            }
            onChange={(e) =>
              onChange({ breakEvenTierIndex: Number(e.target.value) })
            }
          >
            {scenario.aprTiers.map((tier, index) => (
              <MenuItem key={index} value={index}>
                {tier.termMonths} mo @ {tier.apr}%
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </AccordionDetails>
    </Accordion>
  );
}
