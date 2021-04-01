const initialState = (dashboards, selectedDashboard, selectedAnalysis) => {
  return {
    dashboards: dashboards,
    selectedDashboard: selectedDashboard,
    selectedAnalysis: selectedAnalysis,
    selectedAnalysisMetadata: null,
    filterMouseover: null,
    dimensions: { width: 0, height: 0 }
  };
};

const statsStateReducer = (state, action) => {
  switch (action.type) {
    case "SIZE_CHANGE": {
      return {
        ...state,
        dimensions: { width: action.width, height: action.height }
      };
    }
    case "DASHBOARD_SELECT": {
      return {
        ...state,
        selectedDashboard: action.value.selectedDashboard
      };
    }
    case "ANALYSIS_SELECT": {
      return {
        ...state,
        selectedAnalysis: action.value.selectedAnalysis,
        selectedAnalysisMetadata: action.value.metaData
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
