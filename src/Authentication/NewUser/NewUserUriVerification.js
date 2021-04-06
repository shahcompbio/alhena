import React from "react";
import NewAccount from "./NewAccount.js";

import LoadingCircle from "./../ProgressCircle.js";

import { withRouter } from "react-router";
import { Query } from "react-apollo";
import gql from "graphql-tag";

const VERIFYNEWUSERAUTHKEY = gql`
  query verifyNewUserUri($key: String!) {
    verifyNewUserUri(key: $key) {
      isValid
      email
    }
  }
`;

const NewUserUriVerification = ({ uri, dispatch }) => {
  //const [error, setError] = useState(false);

  return (
    <Query
      query={VERIFYNEWUSERAUTHKEY}
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
          if (data.verifyNewUserUri.isValid) {
            return (
              <NewAccount
                email={data.verifyNewUserUri.email}
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

export default withRouter(NewUserUriVerification);
