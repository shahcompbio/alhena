import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import * as yup from "yup";

import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { withStyles } from "@material-ui/styles";

import { gql, useLazyQuery } from "@apollo/client";

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
  helperText: { color: "red" },
  textField: {
    marginLeft: 10,
    width: "100%",
    margin: 10,
    paddingRight: 15
  }
});
const UNIQUE_USER = gql`
  query doesUserExist($email: String!, $username: String!) {
    doesUserExist(email: $email, username: $username) {
      userAlreadyExists
    }
  }
`;
export const NEWUSER = gql`
  query createNewUser($user: NewUser!) {
    createNewUser(user: $user) {
      created
    }
  }
`;

const NewAccount = ({ email, dispatch, classes }) => {
  const [error, setError] = useState(null);

  const [createNewUser, { data, loading, error: gqlError }] = useLazyQuery(
    NEWUSER
  );
  const [
    isUserUnique,
    {
      data: isUserUniqueData,
      loading: isUserUniqueLoading,
      error: isUserUniqueError
    }
  ] = useLazyQuery(UNIQUE_USER);

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
  const uniqueUserError =
    isUserUniqueData && isUserUniqueData.doesUserExist.userAlreadyExists;
  /*        {error && (
          <SnackbarContentWrapper
            variant="error"
            errorNumber={error}
            setError={setError}
          />
        )}*/
  return (
    <Grid container direction="row" justify="center" alignItems="center">
      <div
        style={{
          position: "absolute",
          top: "15%"
        }}
      >
        <Paper rounded className={classes.paperTitle}>
          <Typography variant="h4" color="white">
            Create Account
          </Typography>
        </Paper>
        <Paper rounded className={classes.paperForm}>
          <Formik
            validationSchema={yup.object({
              name: yup
                .string()
                .min(2, "Must be at least 2 characters")
                .required("Name is required")
                .matches(
                  /^[a-zA-Z0-9]+$/,
                  "Cannot contain special characters or spaces"
                ),
              username: yup
                .string()
                .min(2, "Must be at least 2 characters")
                .required("Name is required")
                .matches(
                  /^[a-zA-Z0-9]+$/,
                  "Cannot contain special characters or spaces"
                )
                .test(
                  "checkUserUnique",
                  "This email/username already exists.",
                  (name, value) => {
                    isUserUnique({
                      variables: {
                        username: value.parent.username,
                        email: email
                      }
                    });
                    return true;
                  }
                ),
              password: yup
                .string("Enter your password")
                .min(8, "Password should be of minimum 8 characters length")
                .required("Password is required"),
              passwordVerify: yup
                .string()
                .oneOf([yup.ref("password"), null], "Passwords must match")
            })}
            initialValues={{
              name: "",
              username: "",
              email: "",
              password: "",
              passwordVerify: ""
            }}
            onSubmit={values =>
              createNewUser({
                variables: {
                  user: {
                    name: values.name,
                    username: values.username,
                    email: email,
                    password: values.password
                  }
                }
              })
            }
            style={{ maxWidth: 450 }}
            className={classes.root}
            autoComplete="off"
            instantValidate={false}
            autoComplete="off"
          >
            {({
              values,
              errors,
              touched,
              handleSubmit,
              handleChange,
              setFieldValue,
              isValid
            }) => {
              return (
                <div>
                  <TextField
                    className={classes.textField}
                    key={"newUserName"}
                    onChange={event =>
                      setFieldValue("name", event.target.value)
                    }
                    value={values.name}
                    name={"name"}
                    fullWidth
                    label={"Name:"}
                    type={"text"}
                    validators={["required"]}
                    FormHelperTextProps={{
                      className: classes.helperText
                    }}
                    helperText={errors.name}
                  />
                  <TextField
                    className={classes.textField}
                    key={"newUserUsername"}
                    onChange={event =>
                      setFieldValue("username", event.target.value)
                    }
                    value={values.username}
                    name={"username"}
                    fullWidth
                    label={"Username:"}
                    type={"text"}
                    FormHelperTextProps={{
                      className: classes.helperText
                    }}
                    helperText={errors.username}
                  />
                  <TextField
                    className={classes.textField}
                    key={"newUserEmail"}
                    onChange={event =>
                      setFieldValue("email", event.target.value)
                    }
                    value={email}
                    validateOnChange={false}
                    fullWidth
                    label={"Email:"}
                    type={"text"}
                  />
                  <TextField
                    className={classes.textField}
                    key={"newUserPassword"}
                    onChange={event =>
                      setFieldValue("password", event.target.value)
                    }
                    FormHelperTextProps={{
                      className: classes.helperText
                    }}
                    name={"password"}
                    value={values.password}
                    fullWidth
                    label={"Password:"}
                    type={"password"}
                    helperText={errors.password}
                  />
                  <TextField
                    className={classes.textField}
                    key={"newUserPasswordVerify"}
                    name={"passwordVerify"}
                    onChange={event =>
                      setFieldValue("passwordVerify", event.target.value)
                    }
                    FormHelperTextProps={{
                      className: classes.helperText
                    }}
                    value={values.passwordVerify}
                    fullWidth
                    label={"Verify Password:"}
                    type={"password"}
                    helperText={errors.passwordVerify}
                  />
                  <div style={{ textAlign: "center" }}>
                    <Button
                      type="submit"
                      disabled={!isValid}
                      className={classes.button}
                      variant="contianed"
                      onClick={handleSubmit}
                    >
                      Create
                    </Button>
                  </div>
                </div>
              );
            }}
          </Formik>
        </Paper>
      </div>
    </Grid>
  );
};

export default withStyles(styles)(NewAccount);
