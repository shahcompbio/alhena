import React, { createContext, useReducer, useContext } from "react";

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
