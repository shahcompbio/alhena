import React, { useEffect, useState } from "react";
import {
  useAppState,
  PrivateRoute,
  AdminRoute,
  UnauthenticatedRoute
} from "./util/app-state";

import { Route, Switch } from "react-router-dom";

import { withRouter } from "react-router";
import { useHistory } from "react-router-dom";

import AdminPanel from "./Authentication/AdminPanel.js";

import DashboardWrapper from "./Search/DashboardWrapper";

import ExportPopup from "./Misc/ExportPopup.js";
import Unauthenticated from "./Authentication/Unauthenticated.js";
import ForgotPasswordWrapper from "./Authentication/ForgotPasswordWrapper.js";
import NewUserUriVerification from "./Authentication/NewUser/NewUserUriVerification.js";
import UpdatePasswordVerification from "./Authentication/NewUser/UpdatePasswordVerification.js";

import "./App.css";
import { theme } from "./theme/theme.js";
import { ThemeProvider } from "@mui/material/styles";
import { StyledEngineProvider } from "@mui/styled-engine";
import CssBaseline from "@mui/material/CssBaseline";

const App = () => {
  const [{ authKeyID }, dispatch] = useAppState();
  let history = useHistory();

  const [locationKeys, setLocationKeys] = useState([]);

  useEffect(() => {
    return history.listen(location => {
      if (history.action === "PUSH") {
        setLocationKeys([location.key]);
      }

      if (history.action === "POP") {
        if (locationKeys[1] === location.key) {
          setLocationKeys(([_, ...keys]) => keys);

          // Handle forward event
        } else {
          setLocationKeys(keys => [location.key, ...keys]);
          history.replace(history.location.pathname, "/dashboards");
          // Handle back event
        }
      }
    });
  }, [locationKeys]);
  // /
  //  <ThemeProvider theme={theme}>
  //    <StyledEngineProvider injectFirst>
  //</StyledEngineProvider>
  //</ThemeProvider>
  return (
    <span>
      <Switch>
        <Route
          path="/"
          exact={true}
          component={() => {
            history.replace("/login");
            return <Unauthenticated />;
          }}
        />
        {!authKeyID && (
          <Route
            key="dashboardUnauth"
            path="/dashboards"
            component={({ location, match }) => {
              if (location.pathname !== match.path) {
                localStorage.setItem("linkAttempt", location.pathname);
              }
              history.replace("/login");
              return <Unauthenticated />;
            }}
          />
        )}
        <Route
          path="/login"
          exact={true}
          component={() => <Unauthenticated />}
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
          path="/exportTest"
          component={() => <ExportPopup dispatch={dispatch} />}
        />
        <UnauthenticatedRoute path="/forgotPassword">
          <ForgotPasswordWrapper />
        </UnauthenticatedRoute>
        <PrivateRoute key="copylink" path="/dashboards/:ticket/:copyLink">
          <DashboardWrapper />
        </PrivateRoute>
        <PrivateRoute key="analysis" path="/dashboards:analysis">
          <DashboardWrapper />
        </PrivateRoute>
        <PrivateRoute key="ticket" path="/dashboards/:ticket">
          <DashboardWrapper />
        </PrivateRoute>
        <PrivateRoute key="dashboard" path="/dashboards">
          <DashboardWrapper ticket={null} />
        </PrivateRoute>
        <AdminRoute path="/admin">
          <AdminPanel />
        </AdminRoute>
      </Switch>
      <div style={{ position: "absolute", bottom: 10, right: 10 }}>
        Version 1.06
      </div>
    </span>
  );
};

export default withRouter(App);
