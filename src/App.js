import React from "react";
import { withRouter } from "react-router";

import Content from "./Search/Content.js";

import "./App.css";
import { styled } from "@material-ui/styles";
import { theme } from "./theme/theme.js";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import CssBaseline from "@material-ui/core/CssBaseline";

const title = "Alhena";
const description =
  "Alhena is a single cell DNA (scDNA) dashboard for MSK SPECTRUM. It takes the CSV output from the single cell pipeline.";

const App = () => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <BodyWrapper>
        <ContentWrapper>
          <Content />
        </ContentWrapper>
      </BodyWrapper>
    </MuiThemeProvider>
  );
};

const BodyWrapper = styled("div")``;

const ContentWrapper = styled("div")``;
export default withRouter(App);
