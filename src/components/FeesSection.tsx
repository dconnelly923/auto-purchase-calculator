import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Scenario } from "../scenario";
import { MdFees } from "../calc/types";
import NumberField from "./NumberField";

type Props = {
  scenario: Scenario;
  onChange: (patch: Partial<Scenario>) => void;
};

export default function FeesSection({ scenario, onChange }: Props) {
  const setFee = (key: keyof MdFees, value: number) =>
    onChange({ fees: { ...scenario.fees, [key]: value } });

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Maryland Tax &amp; Fees</Typography>
      </AccordionSummary>
      <AccordionDetails>
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
          label="Other Fees (dealer doc, etc.)"
          value={scenario.fees.other}
          onChange={(v) => setFee("other", v)}
          min={0}
          max={2000}
          step={25}
        />
      </AccordionDetails>
    </Accordion>
  );
}
