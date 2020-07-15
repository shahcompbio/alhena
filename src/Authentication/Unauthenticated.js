import React, { useState, useRef } from "react";
import logo from "../config/LoginTitle.png";
import { login } from "../util/utils.js";
import { useAppState } from "../util/app-state";
import { useHistory } from "react-router-dom";

import {
  Button,
  Grid,
  InputAdornment,
  IconButton,
  TextField
} from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";

import LoadingCircle from "../Dashboard/CommonModules/LoadingCircle.js";

import SnackbarContentWrapper from "../Misc/SnackBarPopup.js";

import { withStyles } from "@material-ui/styles";
import styled from "styled-components";
const styles = theme => ({
  circleImg: {
    height: 500,
    width: 500,
    top: "20%",
    margin: 10,
    position: "absolute"
  },

  floatingLabelFocusStyle: {
    color: "black",
    fontWeight: "500"
  },
  input: {
    color: "black",
    borderBottom: "1px solid #769bb5"
  },
  inputWrapper: {
    position: "absolute",
    top: "40vh",
    marginLeft: 10
  },
  logo: {
    position: "absolute",
    top: "20vh",
    margin: 10,
    marginLeft: 30
  },
  forgotPasswordButton: { marginLeft: 20, marginTop: 40 },
  submitButton: {
    marginLeft: 10,
    marginTop: 40,
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.background.default,
    "&:hover": {
      backgroundColor: theme.palette.primary.main
    }
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300
  }
});
const UnauthenticatedApp = ({ client, classes }) => {
  let history = useHistory();
  const [_, dispatch] = useAppState();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef();
  const passwordRef = useRef();

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event, client, dispatch) => {
    setError(null);
    event.preventDefault();
    try {
      setLoading(true);
      await login(
        usernameRef.current.value,
        passwordRef.current.value,
        client,
        dispatch
      );
    } catch (error) {
      error.graphQLErrors.map(message => {
        if (message.extensions.exception.meta.body.status) {
          setError(message.extensions.exception.meta.body.status);
        }
      });
      setLoading(false);
    }
  };

  return (
    <Grid container direction="row" justify="center" alignItems="center">
      <div className={classes.circleImg}>
        {error && (
          <SnackbarContentWrapper variant="error" errorNumber={error} />
        )}
      </div>
      <img alt="logo" src={logo} className={classes.logo} />

      <div className={classes.inputWrapper}>
        {loading ? (
          <LoadingCircle />
        ) : (
          <form
            onSubmit={ev => handleLogin(ev, client, dispatch)}
            id="loginForm"
          >
            <ComponentWrapper>
              <TextField
                className={classes.textField}
                margin="normal"
                inputRef={usernameRef}
                id={"login:username"}
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
                type={showPassword ? "text" : "password"}
                required
                fullWidth
                InputLabelProps={{
                  className: classes.floatingLabelFocusStyle
                }}
                InputProps={{
                  className: classes.input,
                  color: "primary",
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                value={passwordRef.value}
                label={"Password"}
              />
            </ComponentWrapper>
            <ComponentWrapper>
              <Button
                className={classes.submitButton}
                variant="contained"
                type="submit"
              >
                Log In
              </Button>
              <Button
                className={classes.forgotPasswordButton}
                variant="contained"
                onClick={() => history.push("/forgotPassword")}
              >
                Forgot Password
              </Button>
            </ComponentWrapper>
          </form>
        )}
      </div>
    </Grid>
  );
};

const ComponentWrapper = styled.div`
  margin: 10px;
`;

export default withStyles(styles)(UnauthenticatedApp);
