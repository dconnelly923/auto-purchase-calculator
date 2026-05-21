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
import { ScenarioResult } from "../scenario";
import { currency, currencyCents, percent } from "../format";

type Props = {
  result: ScenarioResult;
  showInterestSaved: boolean;
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

export default function ResultsPanel({ result, showInterestSaved }: Props) {
  const { pricing, loanScenarios, interestSavedByTier, breakEven, breakEvenTier } =
    result;

  const bestMonthly = lowestIndex(loanScenarios.map((s) => s.monthlyPayment));
  const bestCost = lowestIndex(loanScenarios.map((s) => s.totalCost));
  const highlight = { backgroundColor: "success.light" };

  return (
    <Stack spacing={2}>
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

      <Paper variant="outlined">
        <Box sx={{ p: 2, pb: 0 }}>
          <Typography variant="subtitle2">Loan Options by APR Tier</Typography>
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
              {showInterestSaved && (
                <TableCell align="right">Interest Saved*</TableCell>
              )}
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
                <TableCell align="right">
                  {currency(s.totalInterest)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={i === bestCost ? highlight : undefined}
                >
                  {currency(s.totalCost)}
                </TableCell>
                {showInterestSaved && (
                  <TableCell align="right">
                    {currency(interestSavedByTier[i] ?? 0)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {showInterestSaved && (
          <Box sx={{ p: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              *Interest saved from extra monthly principal payments.
            </Typography>
          </Box>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Investment-vs-Loan Break-Even
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Based on {breakEvenTier?.termMonths ?? "—"} mo @{" "}
          {breakEvenTier ? percent(breakEvenTier.apr) : "—"}
        </Typography>
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          <Row
            label="Optimal Down Payment"
            value={currency(breakEven.optimalDownPayment)}
          />
          <Row
            label="Savings vs. $0 down"
            value={currency(breakEven.savingsVsZeroDown)}
          />
          <Row
            label="Savings vs. all cash down"
            value={currency(breakEven.savingsVsFullCash)}
          />
        </Stack>
        <Typography variant="body2" sx={{ mt: 1.5 }}>
          {breakEven.optimalDownPayment <= 1
            ? "Keep your cash invested — the HYSA out-earns the loan interest you would save."
            : breakEven.savingsVsZeroDown < 1
              ? "Down payment amount has little financial impact at these rates."
              : `Putting ${currency(breakEven.optimalDownPayment)} down minimizes net cost.`}
        </Typography>
      </Paper>
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
