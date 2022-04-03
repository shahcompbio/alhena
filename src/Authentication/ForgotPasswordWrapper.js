import React, { useState, useEffect } from "react";

import { gql, useLazyQuery } from "@apollo/client";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import SnackbarContentWrapper from "../Misc/SnackBarPopup.js";
import UpdatePassword from "./NewUser/UpdatePassword.js";

import styled from "styled-components";

import { useHistory } from "react-router-dom";

const VERIFYUSER = gql`
  query($username: String!, $email: String!) {
    doesUserExist(username: $username, email: $email) {
      confirmReset
    }
  }
`;

const ForgotPasswordWrapper = ({ dispatch }) => {
  let history = useHistory();

  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [verifyUser, { loading, data }] = useLazyQuery(VERIFYUSER);

  useEffect(() => {
    if (data) {
      if (data.doesUserExist.confirmReset) {
        setIsVerified(true);
      } else {
        setError(13);
      }
    }
  }, [data, loading]);
  const isButtonDisabled = (username, email) =>
    email.length < 2 || username.length < 1;

  return (
    <Grid container direction="row" justifyContent="center" alignItems="center">
      <div
        style={{
          position: "absolute",
          top: "15%",
          width: "400px !important"
        }}
      >
        {error && (
          <SnackbarContentWrapper
            variant="error"
            errorNumber={error}
            setError={setError}
          />
        )}
        {isVerified ? (
          <UpdatePassword username={username} dispatch={dispatch} />
        ) : (
          <div>
            <Typography variant="h6" style={{ marginLeft: 15 }}>
              Reset Password
            </Typography>

            <ComponentWrapper key={"componentWrapper-username"}>
              <TextField
                key={"textField-username"}
                sx={{ marginLeft: 1, marginRight: 1, width: "400px" }}
                margin="normal"
                id={"resetPassword:username"}
                required
                fullWidth
                value={username}
                label={"Username"}
                onChange={event => {
                  setUsername(event.target.value);
                }}
                type={"text"}
              />
            </ComponentWrapper>
            <ComponentWrapper key={"componentWrapper-email"}>
              <TextField
                key={"textField-email"}
                sx={{ marginLeft: 1, marginRight: 1, width: "400px" }}
                margin="normal"
                id={"resetPassword:email"}
                required
                fullWidth
                value={email}
                onChange={event => {
                  setEmail(event.target.value);
                }}
                label={"Email"}
                type={"text"}
              />
            </ComponentWrapper>
            <ComponentWrapper
              style={{ display: "flex", justifyContent: "space-around" }}
            >
              <Button
                sx={{
                  marginLeft: "20px",
                  color: "#5981b7 !important",
                  border: "1px solid #5981b7 !important",
                  marginTop: "7px",
                  right: "20px",
                  position: "absolute"
                }}
                variant="outlined"
                disableElevation
                onClick={() => {
                  history.replace("/login");
                }}
              >
                Back
              </Button>
              <Button
                sx={{
                  marginTop: "7px",
                  right: "100px",
                  marginRight: "10px",
                  position: "absolute",
                  backgroundColor: "#5981b7 !important",
                  color: "white !important",
                  ":hover": {
                    backgroundColor: "#2f4461 !important"
                  }
                }}
                variant="contained"
                disableElevation
                type="submit"
                disabled={isButtonDisabled(username, email)}
                onClick={async () => {
                  verifyUser({
                    variables: {
                      username: username,
                      email: email
                    }
                  });
                }}
              >
                Verify
              </Button>
            </ComponentWrapper>
          </div>
        )}
      </div>
    </Grid>
  );
};

const ComponentWrapper = styled.div`
  margin: 10px;
`;

export default ForgotPasswordWrapper;
