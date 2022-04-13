import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import * as yup from "yup";

import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import { styled } from "@mui/system";
import { withStyles } from "@mui/styles";

import { gql, useLazyQuery } from "@apollo/client";

const styles = theme => ({
  button: {
    backgroundColor: "#4882bb !important",
    color: "white !important",
    //fontWeight: "bold !important",
    textAlign: "center"
  },
  paperTitle: {
    paddingBottom: theme.spacing.unit * 5,
    //padding: theme.spacing.unit * 3,
    height: 125,
    borderRadius: "20px !important",
    overflowX: "auto",
    width: "25vw",
    color: "#505050 !important",
    padding: "10px !important",
    textAlign: "center"
  },
  paperForm: {
    overflowX: "auto",
    margin: "auto",
    borderRadius: "20px !important",
    padding: "20px !important",
    width: "25vw",
    marginBottom: theme.spacing.unit,
    marginTop: "-70px",
    display: "inline-block"
  },
  helperText: { color: "red !important" },
  textField: {
    //    marginLeft: 10,
    width: "100%",
    margin: "10px !important",
    marginLeft: "0px !important"
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
const StyledTextField = styled(TextField)(({ theme }) => {
  console.log(theme);
  return {
    width: "100%",
    margin: "10px !important",
    marginLeft: "0px !important"
  };
});

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

  return (
    <Grid container direction="row" justifyContent="center" alignItems="center">
      <div
        style={{
          position: "absolute",
          top: "15%"
        }}
      >
        <Paper
          rounded
          sx={{
            paddingBottom: 5,
            //padding: theme.spacing.unit * 3,
            height: 125,
            borderRadius: "20px !important",
            overflowX: "auto",
            width: "25vw",
            color: "#505050 !important",
            padding: "10px !important",
            textAlign: "center"
          }}
        >
          <Typography variant="h4">Create Account</Typography>
        </Paper>
        <Paper
          rounded
          sx={{
            overflowX: "auto",
            margin: "auto",
            borderRadius: "20px !important",
            padding: "20px !important",
            width: "25vw",
            marginBottom: 1,
            marginTop: "-70px",
            display: "inline-block"
          }}
        >
          <Formik
            validationSchema={yup.object({
              name: yup
                .string()
                .min(2, "Must be at least 2 characters")
                .required("Name is required")
                .matches(/^[aA-zZ\s]+$/, "Cannot contan special characters"),
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
              setFieldValue
            }) => {
              const isValid = !Object.keys(errors).length;
              return (
                <div>
                  <StyledTextField
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
                      className: { color: "red !important" }
                    }}
                    helperText={errors.name}
                  />
                  <StyledTextField
                    key={"newUserUsername"}
                    onChange={event =>
                      setFieldValue("username", event.target.value)
                    }
                    value={values.username}
                    name={"username"}
                    fullWidth
                    label={"Username:"}
                    type={"text"}
                    FormHelperTextProps={
                      {
                        //    className: classes.helperText
                      }
                    }
                    helperText={errors.username}
                  />
                  <StyledTextField
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
                  <StyledTextField
                    key={"newUserPassword"}
                    onChange={event =>
                      setFieldValue("password", event.target.value)
                    }
                    FormHelperTextProps={
                      {
                        //                      className: classes.helperText
                      }
                    }
                    name={"password"}
                    value={values.password}
                    fullWidth
                    label={"Password:"}
                    type={"password"}
                    helperText={errors.password}
                  />
                  <StyledTextField
                    key={"newUserPasswordVerify"}
                    name={"passwordVerify"}
                    onChange={event =>
                      setFieldValue("passwordVerify", event.target.value)
                    }
                    FormHelperTextProps={
                      {
                        //  className: classes.helperText
                      }
                    }
                    value={values.passwordVerify}
                    fullWidth
                    label={"Verify Password:"}
                    type={"password"}
                    helperText={errors.passwordVerify}
                  />
                  <div style={{ textAlign: "center" }}>
                    <Button
                      sx={{
                        backgroundColor: "#4882bb !important",
                        color: "white !important",
                        //fontWeight: "bold !important",
                        textAlign: "center"
                      }}
                      type="submit"
                      disabled={!isValid}
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

export default NewAccount;
