import React from "react";
import UpdatePassword from "./UpdatePassword.js";

import LoadingCircle from "./../ProgressCircle.js";

import { withRouter } from "react-router";
import { Query } from "react-apollo";
import gql from "graphql-tag";

const VERIFYPASSWORDRESETAUTHKEY = gql`
  query verifyPasswordResetUri($key: String!) {
    verifyPasswordResetUri(key: $key) {
      isValid
      username
    }
  }
`;

const UpdatePasswordVerification = ({ uri, dispatch }) => {
  return (
    <Query
      query={VERIFYPASSWORDRESETAUTHKEY}
      variables={{
        key: uri.params.redisKey
      }}
    >
      {({ loading, error, data }) => {
        if (error) {
          dispatch({
            type: "LOGOUT"
          });
          return null;
        }

        if (loading) {
          return <LoadingCircle />;
        } else {
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
      }}
    </Query>
  );
};

export default withRouter(UpdatePasswordVerification);
