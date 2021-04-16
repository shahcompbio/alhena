import React, { useState, useRef } from "react";

import { ApolloConsumer } from "react-apollo";

import { Button, Grid, Paper, TextField, Typography } from "@material-ui/core";

import SnackbarContentWrapper from "../Misc/SnackBarPopup.js";
import UpdatePassword from "./NewUser/UpdatePassword.js";

import gql from "graphql-tag";
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
const checkUser = async (client, username, email) => {
  console.log(username);
  const { data } = await client.query({
    query: VERIFYUSER,
    variables: {
      username: username,
      email: email
    }
  });

  return data.doesUserExist.confirmReset;
};
const ForgotPasswordWrapper = ({ dispatch, classes, client }) => {
  let history = useHistory();

  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedUsername, setVerifiedUsername] = useState();

  const usernameRef = useRef();
  const emailRef = useRef();

  const fields = [
    {
      id: "resetPassword:username",
      label: "Username:",
      ref: usernameRef,
      type: "text",
      placeholder: "Username"
    },
    {
      id: "resetPassword:email",
      label: "Email:",
      ref: emailRef,
      type: "text",
      placeholder: "Email"
    }
  ];

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
          <UpdatePassword
            username={usernameRef.current.value}
            dispatch={dispatch}
          />
        ) : (
          <div>
            <Paper rounded="true" className={classes.paperTitle}>
              <Typography variant="h6">
                Verify User to Reset Password
              </Typography>
            </Paper>
            <Paper rounded="true" className={classes.paperForm}>
              <form id="resetPassword">
                {fields.map(field => (
                  <ComponentWrapper key={"componentWrapper" + field.id}>
                    <TextField
                      key={"textField" + field.id}
                      className={classes.textField}
                      margin="normal"
                      inputRef={field.ref}
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
                    className={classes.button}
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
                      const queryResults = await checkUser(
                        client,
                        usernameRef.current.value,
                        emailRef.current.value
                      );
                      queryResults ? setIsVerified(queryResults) : setError(13);
                    }}
                  >
                    Verify
                  </Button>
                </ComponentWrapper>
              </form>
            </Paper>
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
