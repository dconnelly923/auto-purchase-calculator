import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#F44336", light: "#E57373", dark: "#D32F2F" }, // Material red
    success: { main: "#66bb6a", light: "#5C1F1F" }, // light = dark red, used to highlight best-deal cells
    background: {
      default: "#170E0E", // near-black with a subtle deep-red undertone
      paper: "#231414", // one step lighter, same red hint
    },
  },
  typography: {
    fontFamily: '"Ubuntu", "Helvetica Neue", Arial, sans-serif',
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
