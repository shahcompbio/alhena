import React from "react";
import UpdatePassword from "./UpdatePassword.js";

import LoadingCircle from "./../ProgressCircle.js";

import { withRouter } from "react-router";

import { gql, useQuery } from "@apollo/client";

const VERIFYPASSWORDRESETAUTHKEY = gql`
  query verifyPasswordResetUri($key: String!) {
    verifyPasswordResetUri(key: $key) {
      isValid
      username
    }
  }
`;

const UpdatePasswordVerification = ({ uri, dispatch }) => {
  const { loading, error, data } = useQuery(VERIFYPASSWORDRESETAUTHKEY, {
    variables: {
      key: uri.params.redisKey
    }
  });

  if (error) {
    dispatch({
      type: "LOGOUT"
    });
    return null;
  }

  if (loading) {
    return <LoadingCircle />;
  }
  if (data) {
    if (data.verifyPasswordResetUri.isValid) {
      return (
        <UpdatePassword
          username={data.verifyPasswordResetUri.username}
          dispatch={dispatch}
        />
      );
    } else {
      dispatch({
        type: "LOGOUT"
      });
      return null;
    }
  }
};

export default withRouter(UpdatePasswordVerification);
