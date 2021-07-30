import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { ApolloConsumer } from "react-apollo";

import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import SnackbarContentWrapper from "../../Misc/SnackBarPopup.js";

import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";

import gql from "graphql-tag";
import styled from "styled-components";
import { withStyles } from "@material-ui/styles";

const styles = (theme) => ({
  button: {
    backgroundColor: theme.palette.primary.main,
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
    background: theme.palette.primary.main,
  },
  paperForm: {
    overflowX: "auto",
    margin: "auto",
    borderRadius: 20,
    padding: 20,
    width: "25vw",
    marginBottom: theme.spacing.unit,
    marginTop: "-70px",
    display: "inline-block",
  },
  textField: {
    margin: 10,
    width: "20vw",
  },
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
      newPassword: password,
    },
  });
  return data.changePassword.confirmed;
};

const UpdatePassword = ({ username, dispatch, classes }) => {
  let history = useHistory();
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ password: "", passwordVerify: "" });

  const updatePassword = async (event, client, dispatch) => {
    event.preventDefault();
    if (user.password === user.passwordVerify) {
      try {
        var acknowledgement = await queryNewPassword(
          client,
          username,
          user.password
        );
        if (acknowledgement) {
          history.push("/login");
        } else {
          setError(10);
        }
      } catch (error) {
        setError(error);
      }
    } else {
      setError(11);
    }
  };

  const handleChange = (event) => {
    var newUser = user;
    newUser[event.target.name] = event.target.value;
    setUser({ ...newUser });
  };

  useEffect(() => {
    ValidatorForm.addValidationRule("isPasswordMatch", (value) =>
      user["password"] === value ? true : false
    );
  }, [user]);

  return (
    <ApolloConsumer>
      {(client) => (
        <Grid container direction="row" justify="center" alignItems="center">
          <div
            style={{
              position: "absolute",
              top: "15%",
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
              <TextField
                className={classes.textField}
                margin="normal"
                id={"updatePassword:username"}
                required
                fullWidth
                value={username}
                label={"Username"}
                type={"text"}
              />
              <ValidatorForm
                instantValidate={false}
                autoComplete="off"
                onError={(errors) => console.log(errors)}
                onSubmit={(ev) => {}}
              >
                <TextValidator
                  className={classes.textField}
                  key={"updatePassword"}
                  onChange={handleChange}
                  name={"password"}
                  value={user["password"]}
                  fullWidth
                  label={"Password:"}
                  type={"password"}
                  validators={["required", "minStringLength:10"]}
                  errorMessages={[
                    "This field is required",
                    "Field must be longer than 10 characters long",
                  ]}
                />
                <TextValidator
                  className={classes.textField}
                  key={"updatePasswordVerify"}
                  name={"passwordVerify"}
                  onChange={handleChange}
                  value={user["passwordVerify"]}
                  fullWidth
                  label={"Verify Password:"}
                  type={"password"}
                  validators={["required", "isPasswordMatch"]}
                  errorMessages={[
                    "This field is required",
                    "Mismatched passwords",
                  ]}
                />
                <ComponentWrapper style={{ textAlign: "center" }}>
                  <Button
                    className={classes.button}
                    variant="contained"
                    onClick={(ev) => updatePassword(ev, client, dispatch)}
                  >
                    Update
                  </Button>
                </ComponentWrapper>
              </ValidatorForm>
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
