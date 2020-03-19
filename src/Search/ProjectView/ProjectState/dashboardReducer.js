const initialState = (dashboards, selectedDashboard) => {
  return { dashboards: dashboards, selectedDashboard: selectedDashboard };
};

const statsStateReducer = (state, action) => {
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
        selectedAnalysis: action.value.selectedAnalysis
      };
    }
    default:
      return state;
  }
};
export { initialState };
export default statsStateReducer;
