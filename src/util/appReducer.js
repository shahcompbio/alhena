import { useHistory } from "react-router-dom";
const initialState =
  localStorage.getItem("uid") && localStorage.getItem("authKeyID")
    ? {
        authAttempted: false,
        authKeyID: localStorage.getItem("authKeyID"),
        uid: localStorage.getItem("uid"),
        isSuperUser: localStorage.getItem("isSuperUser"),
        lastSettingsTab: localStorage.getItem("lastSettingsTab")
      }
    : { authAttempted: false, authKeyID: null, uid: null, isSuperUser: null };

const appStateReducer = (state, action) => {
  let history = useHistory();

  switch (action.type) {
    case "AUTH_CHANGE": {
      localStorage.setItem("isSuperUser", action.isSuperUser);
      localStorage.setItem("authKeyID", action.authKeyID);
      localStorage.setItem("uid", action.uid);
      localStorage.setItem("lastSettingsTab", action.lastSettingsTab);
      const lastLink = localStorage.getItem("linkAttempt");
      lastLink && lastLink !== "/dashboards"
        ? history.push(lastLink)
        : action.isSuperUser
        ? history.push("/admin")
        : history.push("/dashboards");
      return {
        ...state,
        authAttempted: true,
        uid: action.uid,
        authKeyID: action.authKeyID,
        isSuperUser: action.isSuperUser,
        lastSettingsTab: action.lastSettingsTab
      };
    }
    case "LOADING_USER": {
      return { ...state, user: action.uid };
    }
    case "LOGOUT": {
      localStorage.removeItem("isSuperUser");
      localStorage.removeItem("authKeyID");
      localStorage.removeItem("uid");
      localStorage.removeItem("linkAttempt");

      history.push("/login");

      return { ...state, authAttempted: false, authKeyID: null, uid: null };
    }
    case "SIZE_CHANGE": {
      return {
        ...state,
        dimensions: { width: action.width, height: action.height }
      };
    }
    default:
      return state;
  }
};
export { initialState };
export default appStateReducer;
