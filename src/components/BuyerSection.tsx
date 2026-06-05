import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Scenario } from "../scenario";
import NumberField from "./NumberField";

type Props = {
  scenario: Scenario;
  onChange: (patch: Partial<Scenario>) => void;
};

export default function BuyerSection({ scenario, onChange }: Props) {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">What I'm Bringing</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <NumberField
          label="Down Payment"
          value={scenario.downPayment}
          onChange={(v) => onChange({ downPayment: v })}
          max={50000}
        />
        <NumberField
          label="Trade-In Allowance (pre-tax)"
          value={scenario.tradeIn}
          onChange={(v) => onChange({ tradeIn: v })}
          max={50000}
          helperText="Deductible from MD taxable base"
        />
      </AccordionDetails>
    </Accordion>
  );
}
