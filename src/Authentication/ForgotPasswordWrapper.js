import React, { useState, useEffect } from "react";

import { gql, useLazyQuery } from "@apollo/client";

import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import SnackbarContentWrapper from "../Misc/SnackBarPopup.js";
import UpdatePassword from "./NewUser/UpdatePassword.js";

import styled from "styled-components";
import { withStyles } from "@material-ui/styles";

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

  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);

  const [verifyUser, { loading, data }] = useLazyQuery(VERIFYUSER);

  const fields = [
    {
      id: "resetPassword:username",
      label: "Username:",
      value: username,
      type: "text",
      placeholder: "Username"
    },
    {
      id: "resetPassword:email",
      label: "Email:",
      value: email,
      type: "text",
      placeholder: "Email"
    }
  ];

  useEffect(() => {
    if (data) {
      if (data.doesUserExist.confirmReset) {
        setIsVerified(true);
      } else {
        setError(13);
      }
    }
  }, [data, loading, error]);

  return (
    <Grid container direction="row" justify="center" alignItems="center">
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
            <Typography variant="h6">Reset Password</Typography>

            <form id="resetPassword">
              {fields.map(field => (
                <ComponentWrapper key={"componentWrapper" + field.id}>
                  <TextField
                    key={"textField" + field.id}
                    className={classes.textField}
                    margin="normal"
                    id={field.id}
                    required
                    fullWidth
                    value={field.value}
                    label={field.placeholder}
                    type={field.type}
                  />
                </ComponentWrapper>
              ))}
              <ComponentWrapper style={{ textAlign: "center" }}>
                <Button
                  className={classes.backButton}
                  variant="contained"
                  onClick={() => {
                    history.replace("/login");
                  }}
                >
                  Back
                </Button>
                <Button
                  className={classes.button}
                  variant="contained"
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
            </form>
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
