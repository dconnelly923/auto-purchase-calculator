import { Box, InputAdornment, Slider, TextField } from "@mui/material";

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  adornment?: "$" | "%" | "mo" | null;
  helperText?: string;
};

export default function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 100000,
  step = 100,
  adornment = "$",
  helperText,
}: Props) {
  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    onChange(Number.isFinite(parsed) ? parsed : 0);
  };

  const sliderValue = Math.min(Math.max(value, min), max);

  return (
    <Box sx={{ mb: 1.5 }}>
      <TextField
        label={label}
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={handleText}
        size="small"
        fullWidth
        helperText={helperText}
        slotProps={{
          input: {
            startAdornment:
              adornment === "$" ? (
                <InputAdornment position="start">$</InputAdornment>
              ) : undefined,
            endAdornment:
              adornment === "%" || adornment === "mo" ? (
                <InputAdornment position="end">{adornment}</InputAdornment>
              ) : undefined,
          },
        }}
      />
      <Slider
        value={sliderValue}
        onChange={(_, v) => onChange(v as number)}
        min={min}
        max={max}
        step={step}
        size="small"
        sx={{ mt: 0.5 }}
      />
    </Box>
  );
}
