import React, { useState, useRef } from "react";
import logo from "../config/LoginTitle.png";
import { login } from "../util/utils.js";
import { useAppState } from "../util/app-state";
import { withStyles } from "@material-ui/styles";

import Grid from "@material-ui/core/Grid";
import VisuallyHidden from "@reach/visually-hidden";
import styled from "styled-components";
import { Typography } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import SnackbarContentWrapper from "../Misc/SnackBarPopup.js";
import LoadingCircle from "./ProgressCircle.js";

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300
  },
  floatingLabelFocusStyle: {
    color: "white",
    fontWeight: "500"
  },
  input: {
    color: "white",
    borderBottom: "1px solid #769bb5"
  },
  submitButton: {
    marginLeft: 40
  }
});
const UnauthenticatedApp = ({ client, classes }) => {
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
          top: "30vh",
          margin: 10,
          marginLeft: 30
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "45vh",
          marginLeft: 10
        }}
      >
        <form onSubmit={ev => handleLogin(ev, client, dispatch)} id="loginForm">
          <ComponentWrapper>
            <TextField
              className={classes.textField}
              margin="normal"
              inputRef={usernameRef}
              id={"login:username"}
              className="inputField"
              required
              fullWidth
              InputLabelProps={{
                className: classes.floatingLabelFocusStyle
              }}
              InputProps={{ className: classes.input }}
              value={usernameRef.value}
              label={"Username"}
              type={"text"}
            />
          </ComponentWrapper>
          <ComponentWrapper>
            <TextField
              className={classes.textField}
              margin="normal"
              inputRef={passwordRef}
              id={"login:password"}
              className="inputField"
              required
              fullWidth
              InputLabelProps={{
                className: classes.floatingLabelFocusStyle
              }}
              InputProps={{ className: classes.input, color: "primary" }}
              value={passwordRef.value}
              label={"Password"}
              type={"password"}
            />
          </ComponentWrapper>
          <ComponentWrapper>
            <Button
              className={classes.submitButton}
              color="primary"
              variant="outlined"
              type="submit"
            >
              Log In
            </Button>
          </ComponentWrapper>
        </form>
      </div>
    </Grid>
  );
};

const ComponentWrapper = styled.div`
  margin: 10px;
`;

export default withStyles(styles)(UnauthenticatedApp);
