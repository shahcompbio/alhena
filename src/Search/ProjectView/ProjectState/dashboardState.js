import React, { useReducer, useContext, createContext } from "react";
const DashboardContext = createContext();

export function DashboardProvider({ reducer, children, initialState }) {
  return (
    <DashboardContext.Provider
      value={useReducer(reducer, initialState)}
      children={children}
    ></DashboardContext.Provider>
  );
}
export function useDashboardState() {
  return useContext(DashboardContext);
}
