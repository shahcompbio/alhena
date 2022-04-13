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
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

import LoadingCircle from "../Dashboard/CommonModules/LoadingCircle.js";
import SnackbarContentWrapper from "../Misc/SnackBarPopup.js";

import styled from "styled-components";

export const LOGIN = gql`
  query Login($user: User!) {
    login(user: $user) {
      statusCode
      authKeyID
      role
      isAdmin
      lastSettingsTab
    }
  }
`;

const UnauthenticatedApp = () => {
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
        return message;
      });
    }
    if (data) {
      dispatch({
        type: "AUTH_CHANGE",
        response: data.login.response,
        authKeyID: data.login.authKeyID,
        uid: username,
        isSuperUser: data.login.isAdmin,
        lastSettingsTab: data.login.lastSettingsTab
      });
    }
  }, [data, loading, error]);

  return (
    <Grid
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
      id="unauth-wrapper"
      style={{ position: "relative", marginTop: "33vh" }}
    >
      {error && (
        <SnackbarContentWrapper
          variant="error"
          errorNumber={errors}
          setError={setError}
        />
      )}
      <div
        alt="logo"
        style={{
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          imageRendering: "-webkit-optimize-contrast",
          height: 425,
          width: 500
        }}
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

      <div style={{ marginLeft: 10 }}>
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
                sx={{
                  width: "100%"
                }}
                margin="normal"
                id={"login:username"}
                onChange={event => setUsername(event.target.value)}
                required
                fullWidth
                InputLabelProps={{
                  sx: { color: "black", fontWeight: "500" }
                }}
                value={username}
                label={"Username"}
                type={"text"}
              />
            </ComponentWrapper>
            <ComponentWrapper>
              <TextField
                sx={{
                  width: "100%"
                }}
                margin="normal"
                inputRef={passwordRef}
                id={"login:password"}
                type={showPassword ? "text" : "password"}
                required
                fullWidth
                InputLabelProps={{
                  sx: { color: "black", fontWeight: "500" }
                }}
                InputProps={{
                  color: "primary",
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={() => setShowPassword(!showPassword)}
                        size="large"
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
                sx={{
                  backgroundColor: "#5981b7 !important",
                  color: "white !important",
                  ":hover": {
                    backgroundColor: "#2f4461 !important"
                  }
                }}
                variant="contained"
                disableElevation
                type="submit"
              >
                Log In
              </Button>
              <Button
                sx={{
                  marginLeft: "20px",
                  color: "#5981b7 !important",
                  border: "1px solid #5981b7 !important"
                }}
                variant="outlined"
                disableElevation
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

const ComponentWrapper = styled("div")(({ theme }) => {
  console.log(theme);
  return {
    margin: "10px"
  };
});

export default UnauthenticatedApp;
