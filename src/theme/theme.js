import { createTheme } from "@mui/material/styles";
export default createTheme({
  typography: { fontFamily: "MyFont" },
  palette: {
    text: {
      primary: "black"
    },
    primary: {
      //main: "#90D3F4",
      //main: "#5d97a0",

      main: "#4e89bb",
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
    common: { white: "white" }
  },

  components: {
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          backgroundColor: "purple",
          color: "blue",
          "&$error": {
            color: "blue"
          }
        }
      }
    },
    //  MuiFormHelperText: {
    //    styleOverrides: {
    //      root: { color: "red" }
    //    }
    //  },
    //  "& .MuiFormHelperText-root": { color: "red" },
    MuiSlider: {
      styleOverrides: {
        color: "#f1c023"
      }
    },
    MuiFab: {
      styleOverrides: {
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
