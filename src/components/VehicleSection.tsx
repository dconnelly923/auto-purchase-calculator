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

export default function VehicleSection({ scenario, onChange }: Props) {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Vehicle Price</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <NumberField
          label="MSRP / Agreed Price"
          value={scenario.msrp}
          onChange={(v) => onChange({ msrp: v })}
          max={100000}
        />
      </AccordionDetails>
    </Accordion>
  );
}
