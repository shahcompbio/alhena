import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import "react-app-polyfill/stable";
import * as serviceWorker from "./serviceWorker";

import { BrowserRouter } from "react-router-dom";
import { AppStateProvider } from "./util/app-state";

import appStateReducer, { initialState } from "./util/appReducer";

import { ApolloProvider as ApolloHooksProvider } from "@apollo/client";

import client from "./apollo.js";
require("dotenv").config();

ReactDOM.render(
  <ApolloHooksProvider client={client}>
    <BrowserRouter basename={process.env.REACT_APP_BASENAME || "/"}>
      <AppStateProvider initialState={initialState} reducer={appStateReducer}>
        <App />
      </AppStateProvider>
    </BrowserRouter>
  </ApolloHooksProvider>,
  document.getElementById("root")
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
