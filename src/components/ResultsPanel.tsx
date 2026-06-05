import {
  Box,
  Card,
  CardContent,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { LenderResult, ScenarioResult } from "../scenario";
import { LoanScenario } from "../calc/types";
import { currency, currencyCents, percent } from "../format";

type Props = {
  result: ScenarioResult;
};

function HeadlineCard({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="outlined" sx={{ flex: 1 }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5">{value}</Typography>
      </CardContent>
    </Card>
  );
}

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

export default function ResultsPanel({ result }: Props) {
  const { pricing, manufacturer, bank } = result;
  const bestMonthly = pickBestMonthly([bank, manufacturer]);

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="overline" color="text.secondary">
          Lowest Monthly Payment
        </Typography>
        <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
          {bestMonthly ? currencyCents(bestMonthly.scenario.monthlyPayment) : "—"}
        </Typography>
        {bestMonthly && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {bestMonthly.lender} · {bestMonthly.scenario.termMonths} mo @{" "}
            {percent(bestMonthly.scenario.apr)}
          </Typography>
        )}
      </Paper>

      <Stack direction="row" spacing={2}>
        <HeadlineCard
          label="Out-the-Door Price"
          value={currency(pricing.outTheDoorPrice)}
        />
        <HeadlineCard
          label="Amount Financed"
          value={currency(pricing.amountFinanced)}
        />
      </Stack>

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
