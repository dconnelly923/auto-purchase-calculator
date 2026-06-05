import {
  Box,
  Divider,
  IconButton,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import {
  LenderResult,
  Scenario,
  ScenarioResult,
  scenarioDisplayName,
} from "../scenario";
import { LoanScenario } from "../calc/types";
import { currency, currencyCents, percent } from "../format";

type Props = {
  scenario: Scenario;
  result: ScenarioResult;
  onEditVehicle: () => void;
  onDuplicate: () => void;
};

function lowestIndex(values: number[]): number {
  let best = 0;
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] < values[best]) best = i;
  }
  return best;
}

type BestPayment = {
  lender: string;
  scenario: LoanScenario;
};

function pickBestMonthly(lenders: LenderResult[]): BestPayment | null {
  let best: BestPayment | null = null;
  for (const l of lenders) {
    for (const s of l.loanScenarios) {
      if (!best || s.monthlyPayment < best.scenario.monthlyPayment) {
        best = { lender: l.lender, scenario: s };
      }
    }
  }
  return best;
}

export default function ResultsPanel({
  scenario,
  result,
  onEditVehicle,
  onDuplicate,
}: Props) {
  const { pricing, manufacturer, bank } = result;
  const bestMonthly = pickBestMonthly([bank, manufacturer]);

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <VehicleHeader
          scenario={scenario}
          onEdit={onEditVehicle}
          onDuplicate={onDuplicate}
        />
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="overline" color="text.secondary">
              Out-the-Door Price
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              {currency(pricing.outTheDoorPrice)}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="overline" color="text.secondary">
              Amount Financed
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              {currency(pricing.amountFinanced)}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="overline" color="text.secondary">
              Lowest Monthly Payment
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              {bestMonthly
                ? currencyCents(bestMonthly.scenario.monthlyPayment)
                : "—"}
            </Typography>
            {bestMonthly && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {bestMonthly.lender} · {bestMonthly.scenario.termMonths} mo @{" "}
                {percent(bestMonthly.scenario.apr)}
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Price Breakdown
        </Typography>
        <Stack spacing={0.5}>
          <Row label="Taxable Price" value={currency(pricing.taxablePrice)} />
          <Row label="Excise Tax" value={currency(pricing.excisTax)} />
          <Row label="Total Fees" value={currencyCents(pricing.totalFees)} />
        </Stack>
      </Paper>

      <LenderTable result={bank} />
      <LenderTable result={manufacturer} />
    </Stack>
  );
}

function LenderTable({ result }: { result: LenderResult }) {
  const { lender, loanScenarios } = result;
  const highlight = { backgroundColor: "success.light" };

  if (loanScenarios.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2">{lender}</Typography>
        <Typography variant="caption" color="text.secondary">
          No APR tiers configured.
        </Typography>
      </Paper>
    );
  }

  const bestMonthly = lowestIndex(loanScenarios.map((s) => s.monthlyPayment));
  const bestCost = lowestIndex(loanScenarios.map((s) => s.totalCost));

  return (
    <Paper variant="outlined">
      <Box sx={{ p: 2, pb: 0 }}>
        <Typography variant="subtitle2">{lender}</Typography>
        <Typography variant="caption" color="text.secondary">
          Lowest monthly payment and lowest total cost are highlighted.
        </Typography>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Term</TableCell>
            <TableCell>APR</TableCell>
            <TableCell align="right">Monthly Payment</TableCell>
            <TableCell align="right">Total Interest</TableCell>
            <TableCell align="right">Total Cost</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loanScenarios.map((s, i) => (
            <TableRow key={i}>
              <TableCell>{s.termMonths} mo</TableCell>
              <TableCell>{percent(s.apr)}</TableCell>
              <TableCell
                align="right"
                sx={i === bestMonthly ? highlight : undefined}
              >
                {currencyCents(s.monthlyPayment)}
              </TableCell>
              <TableCell align="right">{currency(s.totalInterest)}</TableCell>
              <TableCell
                align="right"
                sx={i === bestCost ? highlight : undefined}
              >
                {currency(s.totalCost)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

function VehicleHeader({
  scenario,
  onEdit,
  onDuplicate,
}: {
  scenario: Scenario;
  onEdit: () => void;
  onDuplicate: () => void;
}) {
  const displayName = scenarioDisplayName(scenario);

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        onClick={onEdit}
        sx={{
          width: 96,
          height: 72,
          flex: "0 0 96px",
          borderRadius: 0.5,
          overflow: "hidden",
          bgcolor: "action.hover",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {scenario.imageUrl ? (
          <Box
            component="img"
            src={scenario.imageUrl}
            alt=""
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <DirectionsCarIcon color="disabled" fontSize="large" />
        )}
      </Box>

      <Stack sx={{ flex: 1, minWidth: 0 }} onClick={onEdit}>
        <Typography
          variant="h6"
          sx={{
            cursor: "pointer",
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {scenario.condition === "new" ? "New" : "Used"}
          {scenario.msrp > 0 ? ` · ${currency(scenario.msrp)}` : ""}
          {scenario.vin ? ` · ${scenario.vin}` : ""}
        </Typography>
        {scenario.listingUrl && (
          <Link
            href={scenario.listingUrl}
            target="_blank"
            rel="noopener"
            onClick={(e) => e.stopPropagation()}
            sx={{
              fontSize: "0.75rem",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              alignSelf: "flex-start",
              mt: 0.25,
            }}
          >
            View listing <OpenInNewIcon sx={{ fontSize: "0.875rem" }} />
          </Link>
        )}
      </Stack>

      <Tooltip title="Duplicate scenario">
        <IconButton onClick={onDuplicate} size="small">
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}
