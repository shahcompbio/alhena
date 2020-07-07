const initialState = (dashboards, selectedDashboard, selectedAnalysis) => {
  return {
    dashboards: dashboards,
    selectedDashboard: "DLP",
    selectedAnalysis: selectedAnalysis
  };
};

const statsStateReducer = (state, action) => {
  console.log(action);
  switch (action.type) {
    case "DASHBOARD_SELECT": {
      return {
        ...state,
        selectedDashboard: action.value.selectedDashboard
      };
    }
    case "ANALYSIS_SELECT": {
      return {
        ...state,
        //selectedAnalysis: action.value.selectedAnalysis
        //  ? "sc-2602"
        //  : action.value.selectedAnalysis
        selectedAnalysis: action.value.selectedAnalysis
      };
    }
    default:
      return state;
  }
};
export { initialState };
export default statsStateReducer;
