import React, { useState, useEffect } from "react";

import { gql, useLazyQuery } from "@apollo/client";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import SnackbarContentWrapper from "../Misc/SnackBarPopup.js";
import UpdatePassword from "./NewUser/UpdatePassword.js";

import styled from "styled-components";
import { withStyles } from "@mui/styles";

import { useHistory } from "react-router-dom";

const styles = theme => ({
  button: {
    backgroundColor: theme.palette.primary.main,
    marginRight: 10
  },
  paperTitle: {
    paddingBottom: theme.spacing.unit * 5,
    padding: theme.spacing.unit * 3,
    height: 125,
    borderRadius: 20,
    overflowX: "auto",
    width: "25vw",
    color: "white",
    textAlign: "center",
    background: theme.palette.primary.main
  },
  paperForm: {
    overflowX: "auto",
    margin: "auto",
    borderRadius: 20,
    padding: 20,
    width: "25vw",
    marginBottom: theme.spacing.unit,
    marginTop: "-70px",
    display: "inline-block"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: "20vw"
  }
});

const VERIFYUSER = gql`
  query($username: String!, $email: String!) {
    doesUserExist(username: $username, email: $email) {
      confirmReset
    }
  }
`;

const ForgotPasswordWrapper = ({ dispatch, classes }) => {
  let history = useHistory();

  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedUsername, setVerifiedUsername] = useState();

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
          top: "15%"
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
                className={classes.textField}
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
                className={classes.textField}
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
                className={classes.backButton}
                variant="outlined"
                disableElevation
                onClick={() => {
                  history.replace("/login");
                }}
              >
                Back
              </Button>
              <Button
                className={classes.button}
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

export default withStyles(styles)(ForgotPasswordWrapper);
