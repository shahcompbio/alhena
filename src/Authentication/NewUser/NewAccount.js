import React, { useState, useRef } from "react";

import { ApolloConsumer } from "react-apollo";

import { queryCreateNewUser } from "../../util/utils.js";

import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";

import SnackbarContentWrapper from "../../Misc/SnackBarPopup.js";
import VisuallyHidden from "@reach/visually-hidden";
import styled from "styled-components";
import { withStyles } from "@material-ui/styles";

const styles = theme => ({
  paperTitle: {
    paddingBottom: theme.spacing.unit * 5,
    padding: theme.spacing.unit * 3,
    height: 125,
    borderRadius: 20,
    overflowX: "auto",
    color: "white",
    background: "#69B3CE"
  },
  paperForm: {
    overflowX: "auto",
    margin: "auto",
    borderRadius: 20,
    padding: 20,
    marginBottom: theme.spacing.unit,
    marginTop: "-70px",
    display: "inline-block"
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
    }
  ];

  const createNewUser = async (event, client, dispatch) => {
    var user = {
      email: emailRef.current.value,
      username: usernameRef.current.value,
      password: passwordRef.current.value,
      name: nameRef.current.value
    };
    event.preventDefault();
    try {
      var acknowledgement = await queryCreateNewUser(user, client);
      if (acknowledgement) {
        setSuccessfullyCreated(true);
        dispatch({
          type: "LOGOUT"
        });
      } else {
        setError(10);
      }
    } catch (error) {
      setError(error);
    }
  };

  return (
    <ApolloConsumer>
      {client => (
        <Grid container direction="row" justify="center" alignItems="center">
          {error && (
            <SnackbarContentWrapper variant="error" errorNumber={error} />
          )}{" "}
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
              top: "25%",
              marginLeft: 10,
              textAlign: "center"
            }}
          >
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
                    <VisuallyHidden style={{ color: "#ffffff" }}>
                      <label htmlFor={field.id}>{field.label}</label>
                    </VisuallyHidden>
                    <input
                      ref={field.ref}
                      id={field.id}
                      className="inputField"
                      required
                      value={field.value}
                      placeholder={field.placeholder}
                      type={field.type}
                    />
                  </ComponentWrapper>
                ))}
                <ComponentWrapper>
                  <button type="submit">Submit</button>
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
