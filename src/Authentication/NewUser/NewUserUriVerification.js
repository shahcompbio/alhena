import React, { useState, useEffect, useAppState } from "react";
import NewAccount from "./NewAccount.js";
import Unauthenticated from "./../Unauthenticated.js";
import LoadingCircle from "./../ProgressCircle.js";
import { VERIFYNEWUSERAUTHKEY } from "./../../Queries/queries.js";

import { withRouter } from "react-router";
import { Query } from "react-apollo";

const NewUserUriVerification = ({ uri, dispatch }) => {
  const [error, setError] = useState(false);

  return (
    <Query
      query={VERIFYNEWUSERAUTHKEY}
      variables={{
        key: uri.params.key
      }}
    >
      {({ loading, error, data }) => {
        if (error) {
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
