import React from "react";

import NewAccount from "./NewAccount.js";
import LoadingCircle from "./../ProgressCircle.js";

import { withRouter } from "react-router";

import { gql, useQuery } from "@apollo/client";

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
  const { loading, error, data } = useQuery(VERIFYNEWUSERAUTHKEY, {
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
  } else {
    if (data.verifyNewUserUri.isValid) {
      return (
        <NewAccount email={data.verifyNewUserUri.email} dispatch={dispatch} />
      );
    } else {
      dispatch({
        type: "LOGOUT"
      });
      return null;
    }
  }
};

export default withRouter(NewUserUriVerification);
