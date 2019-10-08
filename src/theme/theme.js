import { createMuiTheme } from "@material-ui/core/styles";
export const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#d44d2f"
    },
    secondary: {
      main: "#e4f1fe"
    },
    background: {
      //default: "#405069fc"
      default: "#2b2a2a"
    }
  },
  overrides: {
    MuiButton: {
      root: { fontStyle: " oblique" },
      label: { color: "white" }
    }
  },
  spacing: { unit: 4 }
});
