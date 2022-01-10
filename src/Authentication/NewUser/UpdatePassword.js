import React, { useState, useRef, useEffect } from "react";
import { useHistory } from "react-router-dom";

import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import SnackbarContentWrapper from "../../Misc/SnackBarPopup.js";

import { Formik } from "formik";
import * as yup from "yup";

import { gql, useLazyQuery } from "@apollo/client";

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
    margin: 10,
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

const UpdatePassword = ({ username, dispatch, classes }) => {
  let history = useHistory();
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ password: "", passwordVerify: "" });

  const [password, setPassword] = useState(null);
  const [passwordVerify, setVerifyPassword] = useState(null);

  const [updatePassword, { loading, error: updateError, data }] = useLazyQuery(
    UPDATEPASSWORD
  );

  useEffect(() => {
    if (data) {
      if (data.changePassword.confirmed) {
        history.push("/login");
      } else {
        setError(10);
      }
    }
    if (updateError) {
      setError(updateError);
    }
  }, [data, loading, updateError]);

  const handleChange = event => {
    var newUser = user;
    newUser[event.target.name] = event.target.value;
    setUser({ ...newUser });
  };

  /*  useEffect(() => {
    ValidatorForm.addValidationRule("isPasswordMatch", value =>
      user["password"] === value ? true : false
    );
  }, [user]);*/

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
        <Typography variant="h6">Update Password</Typography>

        <Formik
          validationSchema={yup.object({
            password: yup
              .string("Enter your password")
              .min(8, "Password should be of minimum 8 characters length")
              .required("Password is required"),
            passwordVerify: yup
              .string()
              .oneOf([yup.ref("password"), null], "Passwords must match")
          })}
          initialValues={{
            username: username,
            password: "",
            passwordVerify: ""
          }}
          onSubmit={values =>
            updatePassword({
              variables: {
                username: values.username,
                newPassword: values.password
              }
            })
          }
          style={{ maxWidth: 450 }}
          className={classes.root}
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
          }) => (
            <div>
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
              <TextField
                className={classes.textField}
                key={"updatePassword"}
                onChange={handleChange}
                name={"password"}
                value={values.password}
                fullWidth
                label={"Password:"}
                type={"password"}
                error={touched.password && Boolean(errors.password)}
                helperText={errors.password}
                onChange={event => {
                  setFieldValue("password", event.target.value);
                }}
              />
              <TextField
                className={classes.textField}
                key={"updatePasswordVerify"}
                name={"passwordVerify"}
                onChange={event => {
                  setFieldValue("passwordVerify", event.target.value);
                }}
                value={values.passwordVerify}
                fullWidth
                label={"Verify Password:"}
                type={"password"}
                error={touched.passwordVerify && Boolean(errors.passwordVerify)}
                helperText={errors.passwordVerify}
              />
              <ComponentWrapper style={{ textAlign: "center" }}>
                <Button
                  className={classes.button}
                  variant="outlined"
                  disableElevation
                  type="submit"
                  disabled={!isValid}
                  onClick={handleSubmit}
                >
                  Update
                </Button>
              </ComponentWrapper>
            </div>
          )}
        </Formik>
      </div>
    </Grid>
  );
};

const ComponentWrapper = styled.div`
  margin: 10px;
`;

export default withStyles(styles)(UpdatePassword);
