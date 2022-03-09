import { createTheme } from "@mui/material/styles";
export const theme = createTheme({
  typography: { fontFamily: "MyFont" },
  palette: {
    primary: {
      //main: "#90D3F4",
      //main: "#5d97a0",

      main: "#95d2dc",
      dark: "#618ba0"
    },
    secondary: {
      main: "#f1c023"
    },
    error: {
      main: "#BC4746"
    },
    background: {
      default: "#F5F5F5"
      //default: "#2b2a2a"
    },
    overrides: {
      MuiFab: {
        root: {
          boxShadow: "none"
        }
      }
    }
  },
  overrides: {
    spacing: r => r * 1
  }
});
