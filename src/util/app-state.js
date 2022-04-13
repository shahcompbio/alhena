import React, { createContext, useReducer, useContext } from "react";
import { Route, Redirect, useLocation, useHistory } from "react-router-dom";
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
          return React.cloneElement(children, { uri: match });
        } else {
          dispatch({
            type: "LOGOUT"
          });
        }
      }}
    />
  );
}
export function PrivateRoute({ children, ...rest }) {
  const [{ authKeyID }, dispatch] = useAppState();
  const location = useLocation();

  //one off for when someone refreshes current analysis
  if (location["search"].indexOf("analysis") !== -1) {
    const history = useHistory();

    const path = location["search"];
    const analysisUrl = "analysis=";

    const ticket = path.substr(
      path.indexOf(analysisUrl) + analysisUrl.length,
      path.length
    );
    history.push("/dashboards/" + ticket);
    return null;
  } else {
    //return normal
    return (
      <Route
        {...rest}
        component={({ match }) => {
          if (authKeyID) {
            return React.cloneElement(children, { uri: match });
          } else {
            dispatch({
              type: "LOGOUT"
            });
          }
        }}
      />
    );
  }
}
export function AdminRoute({ children, ...rest }) {
  const [{ authKeyID, isSuperUser }] = useAppState();
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
