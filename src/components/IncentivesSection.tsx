import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Scenario } from "../scenario";
import NumberField from "./NumberField";

type Props = {
  scenario: Scenario;
  onChange: (patch: Partial<Scenario>) => void;
};

export default function IncentivesSection({ scenario, onChange }: Props) {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">
          What the Dealer &amp; Manufacturer Are Bringing
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <NumberField
          label="Dealer Discount (pre-tax)"
          value={scenario.dealerDiscount}
          onChange={(v) => onChange({ dealerDiscount: v })}
          max={30000}
          helperText="Reduces taxable price"
        />
        <NumberField
          label="Customer Cash Incentive (pre-tax)"
          value={scenario.customerCash}
          onChange={(v) => onChange({ customerCash: v })}
          max={20000}
          helperText="Reduces taxable price"
        />
        <NumberField
          label="Manufacturer Rebate (post-tax)"
          value={scenario.manufacturerRebate}
          onChange={(v) => onChange({ manufacturerRebate: v })}
          max={20000}
          helperText="Does NOT reduce taxable price"
        />
        <NumberField
          label="Financing-Conditional Cash (post-tax)"
          value={scenario.financingConditionalCash}
          onChange={(v) => onChange({ financingConditionalCash: v })}
          max={10000}
          helperText="Applies only with manufacturer financing"
        />
        <FormControlLabel
          control={
            <Switch
              checked={scenario.useManufacturerFinancing}
              onChange={(e) =>
                onChange({ useManufacturerFinancing: e.target.checked })
              }
            />
          }
          label="Using manufacturer financing"
          sx={{ mb: 1 }}
        />
        <NumberField
          label="Other Incentive"
          value={scenario.otherIncentive}
          onChange={(v) => onChange({ otherIncentive: v })}
          max={10000}
          helperText="Costco/AAA-style discounts"
        />
        <FormControlLabel
          control={
            <Switch
              checked={scenario.otherIncentiveIsPretax}
              onChange={(e) =>
                onChange({ otherIncentiveIsPretax: e.target.checked })
              }
            />
          }
          label={
            scenario.otherIncentiveIsPretax
              ? "Other incentive: pre-tax"
              : "Other incentive: post-tax"
          }
        />
      </AccordionDetails>
    </Accordion>
  );
}
