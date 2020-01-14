import { createMuiTheme } from "@material-ui/core/styles";
export const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#69B3CE"
    },
    secondary: {
      main: "#FC544B"
    },
    background: {
      default: "#FFFFFF"
      //  default: "#2b2a2a"
    }
  },
  /*overrides: {
    MuiButton: {
      root: { fontStyle: " oblique" },
      label: { color: "white" }
    }
  },*/
  spacing: 4
});
