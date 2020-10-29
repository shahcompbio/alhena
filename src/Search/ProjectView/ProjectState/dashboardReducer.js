const initialState = (dashboards, selectedDashboard, selectedAnalysis) => {
  return {
    dashboards: dashboards,
    selectedDashboard: selectedDashboard,
    selectedAnalysis: selectedAnalysis,
    filterMouseover: null
  };
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
    case "FILTER_MOUSEOVER": {
      return {
        ...state,
        filterMouseover: {
          type: action.value.type,
          value: action.value.value
        }
      };
    }
    default:
      return state;
  }
};
export { initialState };
export default statsStateReducer;
