import React, { useState, useRef } from "react";

import { ApolloConsumer } from "react-apollo";
import { Route } from "react-router-dom";

import { queryCreateNewUser } from "../../util/utils.js";
import { useAppState } from "../../util/app-state";

import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";

import VisuallyHidden from "@reach/visually-hidden";
import styled from "styled-components";

import UnauthenticatedApp from "./../Unauthenticated.js";

const NewAccount = ({ email, dispatch }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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
      }
    } catch (error) {
      setError(error);
    }
  };

  return (
    <ApolloConsumer>
      {client => (
        <Grid container direction="row" justify="center" alignItems="center">
          {" "}
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
              marginLeft: 10
            }}
          >
            <Typography variant="h4" color="primary">
              New User
            </Typography>
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
                <button style={{ marginLeft: 30 }} type="submit">
                  Submit
                </button>
              </ComponentWrapper>
            </form>
          </div>
        </Grid>
      )}
    </ApolloConsumer>
  );
};

const ComponentWrapper = styled.div`
  margin: 10px;
`;

export default NewAccount;
