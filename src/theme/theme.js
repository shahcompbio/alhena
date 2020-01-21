import { createMuiTheme } from "@material-ui/core/styles";
export const theme = createMuiTheme({
  palette: {
    primary: {
      //main: "#90D3F4",
      //main: "#5d97a0",
      main: "#95d2dc",
      dark: "#345C70"
    },
    secondary: {
      main: "#f1c023"
    },
    error: {
      main: "#BC4746"
    },
    background: {
      default: "#F5F5F5"
      //  default: "#2b2a2a"
    },
    overrides: {
      MuiFab: {
        root: {
          boxShadow: "none"
        }
      }
    }
  },

  spacing: 4
});
