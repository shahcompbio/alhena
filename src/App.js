import React, {
  useWindowSize,
  useEffect,
  useState,
  useLayoutEffect
} from "react";
import { useAppState } from "./util/app-state";
import { ApolloConsumer } from "react-apollo";
import { Route, Switch } from "react-router-dom";

import { withRouter } from "react-router";
import { useHistory } from "react-router-dom";

import AdminPanel from "./Authentication/AdminPanel.js";

import DashboardWrapper from "./Search/DashboardWrapper";
import DashboardContent from "./Dashboard/DashboardContent.js";
import ProjectViewContent from "./Search/ProjectView/ProjectViewContent";

import Unauthenticated from "./Authentication/Unauthenticated.js";
import ForgotPasswordWrapper from "./Authentication/ForgotPasswordWrapper.js";
import NewUserUriVerification from "./Authentication/NewUser/NewUserUriVerification.js";
import UpdatePasswordVerification from "./Authentication/NewUser/UpdatePasswordVerification.js";

import "./App.css";
import { theme } from "./theme/theme.js";
import { MuiThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

const App = () => {
  const [{ authKeyID, isSuperUser }, dispatch] = useAppState();
  let history = useHistory();
  /*{!authKeyID && (
    <Route
      key="dashboardUnauth"
      path="/dashboards"
      component={() => {
        history.replace("/login");
        return (
          <ApolloConsumer>
            {client => <Unauthenticated client={client} />}
          </ApolloConsumer>
        );
      }}
    />
  )}*/
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Switch>
        <Route
          path="/"
          exact={true}
          component={() => {
            history.replace("/dashboards");
            return (
              <ApolloConsumer>
                {client => <Unauthenticated client={client} />}
              </ApolloConsumer>
            );
          }}
        />
        <Route
          key="dashbaordTicket"
          path="/dashboards/:ticket"
          component={({ match }) => <DashboardWrapper uri={match} />}
        />
        <Route
          key="dashboard"
          path="/dashboards"
          component={() => <DashboardWrapper ticket={null} />}
        />

        {authKeyID && isSuperUser && (
          <Route path="/admin" component={() => <AdminPanel />} />
        )}
      </Switch>
    </MuiThemeProvider>
  );
};

export default withRouter(App);
