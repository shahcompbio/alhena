import React, { useState, useRef } from "react";
import logo from "../config/LoginTitle.png";
import { login } from "../util/utils.js";
import { useAppState } from "../util/app-state";

import Grid from "@material-ui/core/Grid";
import VisuallyHidden from "@reach/visually-hidden";
import styled from "styled-components";

import SnackbarContentWrapper from "../Misc/SnackBarPopup.js";
import LoadingCircle from "./ProgressCircle.js";

const UnauthenticatedApp = ({ client }) => {
  const [data, dispatch] = useAppState();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef();
  const passwordRef = useRef();

  const handleLogin = async (event, client, dispatch) => {
    setLoading(true);
    setError(null);
    event.preventDefault();
    try {
      await login(
        usernameRef.current.value,
        passwordRef.current.value,
        client,
        dispatch
      );
    } catch (error) {
      setLoading(false);
      error.graphQLErrors.map(message => {
        if (message.extensions.exception.meta.body.status) {
          setError(message.extensions.exception.meta.body.status);
        }
      });
    }
  };

  return (
    <Grid container direction="row" justify="center" alignItems="center">
      {" "}
      <div
        style={{
          height: 500,
          width: 500,
          top: "30%",
          margin: 10,
          position: "absolute"
        }}
      >
        <LoadingCircle isStopped={!loading} />
        {error && (
          <SnackbarContentWrapper variant="error" errorNumber={error} />
        )}
      </div>
      <img
        src={logo}
        style={{
          position: "absolute",
          top: "30%",
          margin: 10,
          marginLeft: 30
        }}
      />{" "}
      <div
        style={{
          position: "absolute",
          top: "55%",
          marginLeft: 10
        }}
      >
        <form onSubmit={ev => handleLogin(ev, client, dispatch)} id="loginForm">
          <ComponentWrapper>
            <VisuallyHidden style={{ color: "#ffffff" }}>
              <label htmlFor="login:username">Username:</label>
            </VisuallyHidden>
            <input
              ref={usernameRef}
              id="login:username"
              className="inputField"
              placeholder=""
              required
              type="text"
            />
          </ComponentWrapper>
          <ComponentWrapper>
            <VisuallyHidden style={{ color: "#ffffff" }}>
              <label htmlFor="login:password">Password:</label>
            </VisuallyHidden>
            <input
              ref={passwordRef}
              id="login:password"
              type={"password"}
              className="inputField"
              required
              placeholder="Password"
            />
          </ComponentWrapper>
          <ComponentWrapper>
            <button style={{ marginLeft: 30 }} type="submit">
              Submit
            </button>
          </ComponentWrapper>
        </form>
      </div>
    </Grid>
  );
};

const ComponentWrapper = styled.div`
  margin: 10px;
`;

export default UnauthenticatedApp;
