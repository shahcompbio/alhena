const initialState = (dashboards, selectedDashboard) => {
  return { dashboards: dashboards, selectedDashboard: selectedDashboard };
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
    default:
      return state;
  }
};
export { initialState };
export default statsStateReducer;
