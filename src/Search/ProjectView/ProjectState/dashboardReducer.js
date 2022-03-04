const initialState = (
  dashboards,
  selectedDashboard,
  selectedAnalysis,
  linkParams
) => {
  if (selectedDashboard) {
    var refresh =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?=" +
      selectedDashboard;

    if (selectedAnalysis) {
      refresh = refresh + "?analysis=" + selectedAnalysis;
    }

    window.history.pushState({ path: refresh }, "", refresh);
  }

  return {
    dashboards: dashboards,
    selectedDashboard: selectedDashboard,
    selectedAnalysis: selectedAnalysis,
    filterMouseover: null,
    dimensions: { width: 0, height: 0 },
    linkParams: linkParams
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
      var refresh =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname;

      refresh = action.value.selectedDashboard
        ? refresh + "?=" + action.value.selectedDashboard
        : refresh;

      window.history.pushState({ path: refresh }, "", refresh);
      return {
        ...state,
        selectedDashboard: action.value.selectedDashboard
      };
    }
    case "ANALYSIS_SELECT": {
      const analysisRefresh =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        "?=" +
        state.selectedDashboard +
        "?analysis=" +
        action.value.selectedAnalysis;

      window.history.pushState({ path: analysisRefresh }, "", analysisRefresh);

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
