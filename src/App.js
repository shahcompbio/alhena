import React from "react";
import { useAppState } from "./util/app-state";
import { ApolloConsumer } from "react-apollo";
import { Route, Switch, Redirect } from "react-router-dom";

import { withRouter } from "react-router";

import AdminPanel from "./Authentication/AdminPanel.js";
import Content from "./Search/Content.js";
import Unauthenticated from "./Authentication/Unauthenticated.js";
import NewUserUriVerification from "./Authentication/NewUser/NewUserUriVerification.js";

import NewAccount from "./Authentication/NewUser/NewAccount.js";

import "./App.css";
import { theme } from "./theme/theme.js";
import { MuiThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

const title = "Alhena";
const description =
  "Alhena is a single cell DNA (scDNA) dashboard for MSK SPECTRUM. It takes the CSV output from the single cell pipeline.";

const App = () => {
  const [{ authKeyID, isSuperUser }, dispatch] = useAppState();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Switch>
        <Route
          path="/login"
          exact={true}
          component={() => (
            <ApolloConsumer>
              {client => <Unauthenticated client={client} />}
            </ApolloConsumer>
          )}
        />
        <Route
          path="/NewAccount/:key"
          component={({ match }) => (
            <NewUserUriVerification uri={match} dispatch={dispatch} />
          )}
        />
        {authKeyID && (
          <Route path="/dashboards" component={() => <Content />} />
        )}
        {authKeyID && isSuperUser && (
          <Route path="/admin" component={() => <AdminPanel />} />
        )}
      </Switch>
    </MuiThemeProvider>
  );
};
//        // <Redirect to="/login" />
export default withRouter(App);
