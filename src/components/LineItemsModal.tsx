import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { LineItem, newLineItem } from "../scenario";

type Props = {
  open: boolean;
  title: string;
  emptyHint: string;
  addLabel: string;
  itemPlaceholder: string;
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  onClose: () => void;
};

export default function LineItemsModal({
  open,
  title,
  emptyHint,
  addLabel,
  itemPlaceholder,
  items,
  onChange,
  onClose,
}: Props) {
  const update = (id: string, patch: Partial<LineItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const remove = (id: string) =>
    onChange(items.filter((i) => i.id !== id));

  const add = () => onChange([...items, newLineItem("", 0, true)]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {items.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              {emptyHint}
            </Typography>
          )}
          {items.map((item) => (
            <Stack
              key={item.id}
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <TextField
                label="Label"
                placeholder={itemPlaceholder}
                value={item.label}
                onChange={(e) => update(item.id, { label: e.target.value })}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Amount"
                type="number"
                value={item.amount}
                onChange={(e) =>
                  update(item.id, { amount: parseFloat(e.target.value) || 0 })
                }
                size="small"
                sx={{ width: 130 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  },
                }}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={item.isPretax}
                    onChange={(e) =>
                      update(item.id, { isPretax: e.target.checked })
                    }
                  />
                }
                label={item.isPretax ? "Pre-tax" : "Post-tax"}
                sx={{ mr: 0, minWidth: 100 }}
              />
              <IconButton
                aria-label="remove"
                size="small"
                onClick={() => remove(item.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
          <Button startIcon={<AddIcon />} onClick={add} variant="outlined">
            {addLabel}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
