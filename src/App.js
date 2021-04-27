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

import ExportPopup from "./Misc/ExportPopup.js";
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
                {client => <DashboardWrapper uri={null} client={client} />}
              </ApolloConsumer>
            );
          }}
        />
        <Route
          key="ticket"
          path="/dashboards/:ticket/:copyLink"
          component={({ match }) => (
            <ApolloConsumer>
              {client => <DashboardWrapper uri={match} client={client} />}
            </ApolloConsumer>
          )}
        />
        <Route
          key="dashbaordTicket"
          path="/dashboards/:ticket"
          component={({ match }) => (
            <ApolloConsumer>
              {client => <DashboardWrapper uri={match} client={client} />}
            </ApolloConsumer>
          )}
        />
        <Route
          key="dashboard"
          path="/dashboards"
          component={() => (
            <ApolloConsumer>
              {client => <DashboardWrapper uri={null} client={client} />}
            </ApolloConsumer>
          )}
        />
        <Route
          path="/*"
          component={() => {
            history.replace("/dashboards");
            return (
              <ApolloConsumer>
                {client => <DashboardWrapper uri={null} client={client} />}
              </ApolloConsumer>
            );
          }}
        />
      </Switch>
    </MuiThemeProvider>
  );
};

export default withRouter(App);
