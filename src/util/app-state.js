import React, { createContext, useReducer, useContext } from "react";
import { Route, Redirect } from "react-router-dom";

import { ApolloConsumer } from "react-apollo";

const StateContext = createContext();

export function AppStateProvider({ reducer, initialState, children }) {
  return (
    <StateContext.Provider
      value={useReducer(reducer, initialState)}
      children={children}
    />
  );
}

export function useAppState() {
  return useContext(StateContext);
}
export function UnauthenticatedRoute({ children, ...rest }) {
  const [{ authKeyID }, dispatch] = useAppState();

  return (
    <Route
      {...rest}
      component={({ match }) => {
        if (!authKeyID) {
          return (
            <ApolloConsumer>
              {client =>
                React.cloneElement(children, { uri: match, client: client })
              }
            </ApolloConsumer>
          );
        }
      }}
    />
  );
}
export function PrivateRoute({ children, ...rest }) {
  const [{ authKeyID, isSuperUser }, dispatch] = useAppState();

  return (
    <Route
      {...rest}
      component={({ match }) => {
        if (authKeyID) {
          return (
            <ApolloConsumer>
              {client =>
                React.cloneElement(children, { uri: match, client: client })
              }
            </ApolloConsumer>
          );
        } else {
          dispatch({
            type: "LOGOUT"
          });
        }
      }}
    />
  );
}
export function AdminRoute({ children, ...rest }) {
  const [{ authKeyID, isSuperUser }, dispatch] = useAppState();
  return (
    <Route
      {...rest}
      component={() =>
        authKeyID && parseInt(isSuperUser) === 1 ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/dashboards"
            }}
          />
        )
      }
    />
  );
}
