import React, { useState, useRef } from "react";

import { ApolloConsumer } from "react-apollo";

import { queryCreateNewUser } from "../../util/utils.js";

import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SnackbarContentWrapper from "../../Misc/SnackBarPopup.js";
import Input from "@material-ui/core/Input";

import styled from "styled-components";
import { withStyles } from "@material-ui/styles";

const styles = theme => ({
  paperTitle: {
    paddingBottom: theme.spacing.unit * 5,
    padding: theme.spacing.unit * 3,
    height: 125,
    borderRadius: 20,
    overflowX: "auto",
    width: "25vw",
    color: "white",
    textAlign: "center",
    background: "#69B3CE"
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
    width: 300
  }
});
const NewAccount = ({ email, dispatch, classes }) => {
  const [error, setError] = useState(null);
  const [userEmail] = useState(email);
  const [newUser, setSuccessfullyCreated] = useState(false);

  const nameRef = useRef();
  const usernameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const verifyPasswordRef = useRef();

  const fields = [
    {
      id: "newUser:name",
      label: "Full Name:",
      ref: nameRef,
      type: "text",
      placeholder: "Your Name"
    },
    {
      id: "newUser:username",
      label: "Username:",
      ref: usernameRef,
      type: "text",
      placeholder: "Username"
    },
    {
      id: "newUser:email",
      label: "Email:",
      ref: emailRef,
      type: "text",
      value: userEmail,
      placeholder: "Email"
    },
    {
      id: "newUser:password",
      label: "Password:",
      ref: passwordRef,
      type: "password",
      placeholder: "Password"
    },
    {
      id: "newUser:passwordVerify",
      label: "Verify Password:",
      ref: verifyPasswordRef,
      type: "password",
      placeholder: "Verify Password"
    }
  ];

  const createNewUser = async (event, client, dispatch) => {
    console.log(verifyPasswordRef.current.value === passwordRef.current.value);
    if (verifyPasswordRef.current.value === passwordRef.current.value) {
      var user = {
        email: emailRef.current.value,
        username: usernameRef.current.value,
        password: passwordRef.current.value,
        name: nameRef.current.value
      };
      event.preventDefault();
      try {
        var acknowledgement = await queryCreateNewUser(user, client);
        console.log(acknowledgement);
        if (acknowledgement) {
          setSuccessfullyCreated(true);
          dispatch({
            type: "LOGOUT"
          });
        } else {
          setError(10);
        }
      } catch (error) {
        console.log(error);
        setError(error);
      }
    } else {
      setError(11);
    }
  };

  return (
    <ApolloConsumer>
      {client => (
        <Grid container direction="row" justify="center" alignItems="center">
          <Typography
            variant="h1"
            color="primary"
            style={{ marginTop: 50, fontWeight: "500" }}
          >
            Alhena
          </Typography>
          <div
            style={{
              top: "20%",
              margin: 10,
              position: "absolute"
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "25%"
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
                New User
              </Typography>
            </Paper>
            <Paper rounded className={classes.paperForm}>
              <form
                onSubmit={ev => createNewUser(ev, client, dispatch)}
                id="newUser"
              >
                {fields.map(field => (
                  <ComponentWrapper>
                    <TextField
                      className={classes.textField}
                      margin="normal"
                      inputRef={field.ref}
                      id={field.id}
                      className="inputField"
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
                    color="primary"
                    variant="outlined"
                    onClick={ev => createNewUser(ev, client, dispatch)}
                  >
                    Create
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

export default withStyles(styles)(NewAccount);
