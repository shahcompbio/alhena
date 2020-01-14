import React, { useReducer, useContext, createContext } from "react";
const StatisticsContext = createContext();

export function StatsProvider({ reducer, children, initialState }) {
  return (
    <StatisticsContext.Provider
      value={useReducer(reducer, initialState)}
      children={children}
    ></StatisticsContext.Provider>
  );
}
export function useStatisticsState() {
  return useContext(StatisticsContext);
}
