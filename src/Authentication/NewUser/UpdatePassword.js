import React, { useState, useRef } from "react";

import { ApolloConsumer } from "react-apollo";

import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SnackbarContentWrapper from "../../Misc/SnackBarPopup.js";
import gql from "graphql-tag";
import styled from "styled-components";
import { withStyles } from "@material-ui/styles";

const styles = theme => ({
  button: {
    backgroundColor: theme.palette.primary.main
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

const UPDATEPASSWORD = gql`
  query($username: String!, $newPassword: String!) {
    changePassword(username: $username, newPassword: $newPassword) {
      confirmed
    }
  }
`;
export const queryNewPassword = async (client, username, password) => {
  const { data } = await client.query({
    query: UPDATEPASSWORD,
    variables: {
      username: username,
      newPassword: password
    }
  });
  return data.changePassword.confirmed;
};

const UpdatePassword = ({ username, dispatch, classes }) => {
  const [error, setError] = useState(null);

  const passwordRef = useRef();
  const verifyPasswordRef = useRef();

  const fields = [
    {
      id: "updatePassword:username",
      label: "Username:",
      value: username,
      type: "text",
      placeholder: "Username"
    },
    {
      id: "updatePassword:password",
      label: "Password:",
      ref: passwordRef,
      type: "password",
      placeholder: "Password"
    },
    {
      id: "updatePassword:passwordVerify",
      label: "Verify Password:",
      ref: verifyPasswordRef,
      type: "password",
      placeholder: "Verify Password"
    }
  ];

  const updatePassword = async (event, client, dispatch) => {
    if (verifyPasswordRef.current.value === passwordRef.current.value) {
      var user = {
        username: username,
        password: passwordRef.current.value
      };
      event.preventDefault();
      try {
        var acknowledgement = await queryNewPassword(
          client,
          username,
          passwordRef.current.value
        );
        if (acknowledgement) {
          dispatch({
            type: "LOGOUT"
          });
        } else {
          setError(10);
        }
      } catch (error) {
        setError(error);
      }
    } else {
      setError(12);
    }
  };

  return (
    <ApolloConsumer>
      {client => (
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
            <Paper rounded className={classes.paperTitle}>
              <Typography variant="h4" color="white">
                Update Password
              </Typography>
            </Paper>
            <Paper rounded className={classes.paperForm}>
              <form
                onSubmit={ev => updatePassword(ev, client, dispatch)}
                id="updatePassword"
              >
                {fields.map(field => (
                  <ComponentWrapper>
                    <TextField
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
                    onClick={ev => updatePassword(ev, client, dispatch)}
                  >
                    Update
                  </Button>
                </ComponentWrapper>
              </form>
            </Paper>
          </div>
        </Grid>
      )}
    </ApolloConsumer>
  );
};

const ComponentWrapper = styled.div`
  margin: 10px;
`;

export default withStyles(styles)(UpdatePassword);
