import React from "react";
import { useAppState } from "./util/app-state";
import { ApolloConsumer } from "react-apollo";

import { withRouter } from "react-router";

import Content from "./Search/Content.js";
import Unauthenticated from "./Authentication/Unauthenticated.js";

import "./App.css";
import { theme } from "./theme/theme.js";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import CssBaseline from "@material-ui/core/CssBaseline";

const title = "Alhena";
const description =
  "Alhena is a single cell DNA (scDNA) dashboard for MSK SPECTRUM. It takes the CSV output from the single cell pipeline.";

const App = () => {
  const [{ authKeyID }, dispatch] = useAppState();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {authKeyID ? (
        <Content />
      ) : (
        <ApolloConsumer>
          {client => <Unauthenticated client={client} />}
        </ApolloConsumer>
      )}
    </MuiThemeProvider>
  );
};
export default withRouter(App);
