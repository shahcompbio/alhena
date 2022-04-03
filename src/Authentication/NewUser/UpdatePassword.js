import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import SnackbarContentWrapper from "../../Misc/SnackBarPopup.js";

import { Formik } from "formik";
import * as yup from "yup";

import { gql, useLazyQuery } from "@apollo/client";

import styled from "styled-components";

const UPDATEPASSWORD = gql`
  query($username: String!, $newPassword: String!) {
    changePassword(username: $username, newPassword: $newPassword) {
      confirmed
    }
  }
`;

const UpdatePassword = ({ username, dispatch }) => {
  let history = useHistory();
  const [error, setError] = useState(null);

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

  return (
    <Grid
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
      sx={{ width: "400px", "& .MuiFormHelperText-root": { color: "red" } }}
    >
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
                <TextField
                  sx={{ margin: "10px !important" }}
                  margin="normal"
                  id={"updatePassword:username"}
                  required
                  fullWidth
                  value={username}
                  label={"Username"}
                  type={"text"}
                />
                <TextField
                  sx={{ margin: "10px !important" }}
                  key={"updatePassword"}
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
                  sx={{ margin: "10px !important" }}
                  key={"updatePasswordVerify"}
                  name={"passwordVerify"}
                  onChange={event => {
                    setFieldValue("passwordVerify", event.target.value);
                  }}
                  value={values.passwordVerify}
                  fullWidth
                  label={"Verify Password:"}
                  type={"password"}
                  error={
                    touched.passwordVerify && Boolean(errors.passwordVerify)
                  }
                  helperText={errors.passwordVerify}
                />
                <ComponentWrapper style={{ textAlign: "center" }}>
                  <Button
                    sx={{
                      backgroundColor: "#5981b7 !important",
                      color: "white !important",
                      ":hover": {
                        backgroundColor: "#2f4461 !important"
                      }
                    }}
                    variant="contained"
                    disableElevation
                    type="submit"
                    disabled={!isValid}
                    onClick={handleSubmit}
                  >
                    Update
                  </Button>
                </ComponentWrapper>
              </div>
            );
          }}
        </Formik>
      </div>
    </Grid>
  );
};

const ComponentWrapper = styled.div`
  margin: 10px;
`;

export default UpdatePassword;
