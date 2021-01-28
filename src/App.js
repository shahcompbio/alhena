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
            history.replace("/login");
            return (
              <ApolloConsumer>
                {client => <Unauthenticated client={client} />}
              </ApolloConsumer>
            );
          }}
        />
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
          path="/NewAccount/:redisKey"
          component={({ match }) => (
            <NewUserUriVerification uri={match} dispatch={dispatch} />
          )}
        />
        <Route
          path="/resetPassword/:redisKey"
          component={({ match }) => (
            <UpdatePasswordVerification uri={match} dispatch={dispatch} />
          )}
        />
        <Route
          path="/forgotPassword"
          component={() => (
            <ApolloConsumer>
              {client => (
                <ForgotPasswordWrapper client={client} dispatch={dispatch} />
              )}
            </ApolloConsumer>
          )}
        />
        <Route
          key="dashboard"
          path="/dashboards"
          component={() => <DashboardWrapper ticket={null} />}
        />
        <Route
          key="dashbaordTicket"
          path="/dashboards/:ticket"
          component={({ match }) => <DashboardWrapper uri={match} />}
        />
        {authKeyID && [
          <Route
            key="ticketSandbox"
            path="/sandbox"
            component={({ match }) => {
              var uri = match;
              //  SC-3079
              uri.params.ticket = "sc-2570";
              //uri.params.ticket = "sc-2978";
              return (
                <ApolloConsumer>
                  {client => <DashboardWrapper uri={uri} client={client} />}
                </ApolloConsumer>
              );
            }}
          />
        ]}
        {authKeyID && isSuperUser && (
          <Route path="/admin" component={() => <AdminPanel />} />
        )}
      </Switch>
    </MuiThemeProvider>
  );
};

export default withRouter(App);
