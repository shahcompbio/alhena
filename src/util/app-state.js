import React, { createContext, useReducer, useContext } from "react";
import { Route, Redirect } from "react-router-dom";
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

export function PrivateRoute({ children, ...rest }) {
  const [{ authKeyID, isSuperUser }, dispatch] = useAppState();
  return (
    <Route
      {...rest}
      component={() => {
        if (authKeyID) {
          return children;
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
