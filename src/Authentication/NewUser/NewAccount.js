import React, { useState, useRef, useEffect } from "react";

import { ApolloConsumer } from "react-apollo";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";

import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SnackbarContentWrapper from "../../Misc/SnackBarPopup.js";

import styled from "styled-components";
import { withStyles } from "@material-ui/styles";

import { gql, useLazyQuery, useQuery } from "@apollo/client";

const styles = theme => ({
  button: {
    backgroundColor: theme.palette.primary.main,
    textAlign: "center"
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
    marginLeft: 10,
    marginRight: theme.spacing(1),
    width: 300,
    margin: 10
  }
});
export const NEWUSER = gql`
  query createNewUser($user: NewUser!) {
    createNewUser(user: $user) {
      created
    }
  }
`;

const NewAccount = ({ email, dispatch, classes }) => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState({
    name: "",
    username: "",
    email: email,
    password: "",
    passwordVerify: ""
  });

  const [createNewUser, { data, loading, error: gqlError }] = useLazyQuery(
    NEWUSER
  );

  useEffect(() => {
    if (data && data.createNewUser.created) {
      dispatch({
        type: "LOGOUT"
      });
    } else {
      setError(10);
    }

    if (error) {
      setError(error);
    }
  }, [data, loading, error]);

  const handleChange = event => {
    var newUser = user;
    newUser[event.target.name] = event.target.value;
    setUser({ ...newUser });
  };

  useEffect(() => {
    ValidatorForm.addValidationRule("isPasswordMatch", value =>
      user["password"] === value ? true : false
    );
  }, [user]);

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
                Create Account
              </Typography>
            </Paper>
            <Paper rounded className={classes.paperForm}>
              <ValidatorForm
                instantValidate={false}
                autoComplete="off"
                onError={errors => console.log(errors)}
                onSubmit={ev => {
                  //createNewUser(ev, client, dispatch)
                }}
              >
                <TextValidator
                  className={classes.textField}
                  key={"newUserName"}
                  onChange={handleChange}
                  value={user["name"]}
                  name={"name"}
                  fullWidth
                  label={"Name:"}
                  type={"text"}
                  validators={["required"]}
                  errorMessages={["This field is required"]}
                />
                <TextValidator
                  className={classes.textField}
                  key={"newUserUsername"}
                  onChange={handleChange}
                  value={user["username"]}
                  name={"username"}
                  fullWidth
                  label={"Username:"}
                  type={"text"}
                  validators={["required", "minStringLength:3"]}
                  errorMessages={[
                    "This field is required",
                    "Field must be longer than 3 characters long"
                  ]}
                />
                <TextValidator
                  className={classes.textField}
                  key={"newUserEmail"}
                  onChange={handleChange}
                  value={user["email"]}
                  fullWidth
                  label={"Email:"}
                  type={"text"}
                  validators={["This field is required"]}
                  errorMessages={["This field is required"]}
                />
                <TextValidator
                  className={classes.textField}
                  key={"newUserPassword"}
                  onChange={handleChange}
                  name={"password"}
                  value={user["password"]}
                  fullWidth
                  label={"Password:"}
                  type={"password"}
                  validators={["required", "minStringLength:10"]}
                  errorMessages={[
                    "This field is required",
                    "Field must be longer than 10 characters long"
                  ]}
                />
                <TextValidator
                  className={classes.textField}
                  key={"newUserPasswordVerify"}
                  name={"passwordVerify"}
                  onChange={handleChange}
                  value={user["passwordVerify"]}
                  fullWidth
                  label={"Verify Password:"}
                  type={"password"}
                  validators={["required", "isPasswordMatch"]}
                  errorMessages={[
                    "This field is required",
                    "Mismatched passwords"
                  ]}
                />
                <div style={{ textAlign: "center" }}>
                  <Button
                    type="submit"
                    className={classes.button}
                    variant="contianed"
                    onClick={ev =>
                      createNewUser({
                        variables: {
                          user: {
                            name: user.name,
                            username: user.username,
                            email: user.email,
                            password: user.password
                          }
                        }
                      })
                    }
                  >
                    Create
                  </Button>
                </div>
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

export default withStyles(styles)(NewAccount);
