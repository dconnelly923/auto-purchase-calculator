import { useMemo, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Scenario, computeScenario } from "../scenario";
import { currency, currencyCents, percent } from "../format";

type Props = {
  scenarios: Scenario[];
};

type MetricRow = {
  label: string;
  values: (number | undefined)[];
  format: (v: number) => string;
  highlightMin: boolean;
};

function minIndices(values: (number | undefined)[]): Set<number> {
  const defined = values.filter((v): v is number => v !== undefined);
  if (defined.length === 0) return new Set();
  const min = Math.min(...defined);
  const result = new Set<number>();
  values.forEach((v, i) => {
    if (v !== undefined && Math.abs(v - min) < 0.005) result.add(i);
  });
  return result;
}

export default function ComparisonView({ scenarios }: Props) {
  const results = useMemo(
    () => scenarios.map((s) => computeScenario(s)),
    [scenarios],
  );

  const terms = useMemo(() => {
    const set = new Set<number>();
    scenarios.forEach((s) =>
      s.aprTiers.forEach((t) => set.add(t.termMonths)),
    );
    return [...set].sort((a, b) => a - b);
  }, [scenarios]);

  const [term, setTerm] = useState<number>(() => terms[0] ?? 60);
  const activeTerm = terms.includes(term) ? term : (terms[0] ?? 60);

  const loanAtTerm = results.map((r) =>
    r.loanScenarios.find((ls) => ls.termMonths === activeTerm),
  );

  const rows: MetricRow[] = [
    {
      label: "Out-the-Door Price",
      values: results.map((r) => r.pricing.outTheDoorPrice),
      format: currency,
      highlightMin: true,
    },
    {
      label: "Down Payment",
      values: scenarios.map((s) => s.downPayment),
      format: currency,
      highlightMin: false,
    },
    {
      label: "Amount Financed",
      values: results.map((r) => r.pricing.amountFinanced),
      format: currency,
      highlightMin: true,
    },
    {
      label: `APR @ ${activeTerm} mo`,
      values: loanAtTerm.map((l) => l?.apr),
      format: percent,
      highlightMin: true,
    },
    {
      label: `Monthly Payment @ ${activeTerm} mo`,
      values: loanAtTerm.map((l) => l?.monthlyPayment),
      format: currencyCents,
      highlightMin: true,
    },
    {
      label: `Total Interest @ ${activeTerm} mo`,
      values: loanAtTerm.map((l) => l?.totalInterest),
      format: currency,
      highlightMin: true,
    },
    {
      label: `Total Paid @ ${activeTerm} mo`,
      values: loanAtTerm.map((l, i) =>
        l ? l.totalCost + scenarios[i].downPayment : undefined,
      ),
      format: currency,
      highlightMin: true,
    },
    {
      label: "Optimal Down Payment",
      values: results.map((r) => r.breakEven.optimalDownPayment),
      format: currency,
      highlightMin: false,
    },
  ];

  return (
    <Box>
      <FormControl size="small" sx={{ mb: 2, minWidth: 220 }}>
        <InputLabel id="compare-term-label">Compare at loan term</InputLabel>
        <Select
          labelId="compare-term-label"
          label="Compare at loan term"
          value={activeTerm}
          onChange={(e) => setTerm(Number(e.target.value))}
        >
          {terms.map((t) => (
            <MenuItem key={t} value={t}>
              {t} months
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper variant="outlined">
        <Box sx={{ p: 2, pb: 0 }}>
          <Typography variant="caption" color="text.secondary">
            Best value in each row is highlighted. "—" means a scenario has no
            APR tier at the selected term.
          </Typography>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Metric</TableCell>
              {scenarios.map((s, i) => (
                <TableCell key={i} align="right">
                  {s.name || `Scenario ${i + 1}`}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const winners = row.highlightMin
                ? minIndices(row.values)
                : new Set<number>();
              return (
                <TableRow key={row.label}>
                  <TableCell>{row.label}</TableCell>
                  {row.values.map((v, i) => (
                    <TableCell
                      key={i}
                      align="right"
                      sx={
                        winners.has(i)
                          ? { backgroundColor: "success.light" }
                          : undefined
                      }
                    >
                      {v === undefined ? "—" : row.format(v)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
