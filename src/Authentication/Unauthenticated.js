import React, { useState, useRef, useEffect } from "react";

import { useAppState } from "../util/app-state";
import { useHistory } from "react-router-dom";

import { gql, useLazyQuery } from "@apollo/client";

import title from "./titleicon.png";

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
    top: "50vh",
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

export const LOGIN = gql`
  query Login($user: User!) {
    login(user: $user) {
      statusCode
      authKeyID
      role
      isAdmin
    }
  }
`;

const UnauthenticatedApp = ({ classes }) => {
  let history = useHistory();
  const [, dispatch] = useAppState();
  const [errors, setError] = useState(null);
  const [username, setUsername] = useState("");
  const passwordRef = useRef();

  const [showPassword, setShowPassword] = useState(false);

  const [login, { data, loading, error }] = useLazyQuery(LOGIN);

  useEffect(() => {
    setError(null);
    if (error) {
      error.graphQLErrors.map(message => {
        if (message.extensions.exception.meta.body.status) {
          setError(message.extensions.exception.meta.body.status);
        }
      });
    }
    if (data) {
      dispatch({
        type: "AUTH_CHANGE",
        response: data.login.response,
        authKeyID: data.login.authKeyID,
        uid: username,
        isSuperUser: data.login.isAdmin
      });
    }
  }, [data, loading, error]);

  return (
    <Grid container direction="row" justify="center" alignItems="center">
      <div className={classes.circleImg}>
        {error && (
          <SnackbarContentWrapper
            variant="error"
            errorNumber={errors}
            setError={setError}
          />
        )}
      </div>
      <div
        alt="logo"
        style={{
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          imageRendering: "-webkit-optimize-contrast",
          height: 425,
          width: 500,
          marginTop: -55,
          marginLeft: 85
        }}
        className={classes.logo}
        height={"191px"}
        width={"528px"}
      >
        <img
          id="title"
          src={title}
          alt="website title - Alhena"
          style={{
            width: 400,
            height: 325
          }}
        />
      </div>

      <div className={classes.inputWrapper}>
        {loading ? (
          <LoadingCircle />
        ) : (
          <form
            onSubmit={event =>
              login({
                variables: {
                  user: {
                    uid: username,
                    password: passwordRef.current.value
                  }
                }
              })
            }
            id="loginForm"
          >
            <ComponentWrapper>
              <TextField
                className={classes.textField}
                margin="normal"
                id={"login:username"}
                onChange={event => setUsername(event.target.value)}
                required
                fullWidth
                InputLabelProps={{
                  className: classes.floatingLabelFocusStyle
                }}
                InputProps={{ className: classes.input }}
                value={username}
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
