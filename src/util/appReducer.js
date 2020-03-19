import { useHistory } from "react-router-dom";
const initialState =
  localStorage.getItem("uid") && localStorage.getItem("authKeyID")
    ? {
        authAttempted: false,
        authKeyID: localStorage.getItem("authKeyID"),
        uid: localStorage.getItem("uid"),
        isSuperUser: localStorage.getItem("isSuperUser")
      }
    : { authAttempted: false, authKeyID: null, uid: null, isSuperUser: null };

const appStateReducer = (state, action) => {
  let history = useHistory();

  switch (action.type) {
    case "AUTH_CHANGE": {
      localStorage.setItem("isSuperUser", action.isSuperUser);
      localStorage.setItem("authKeyID", action.authKeyID);
      localStorage.setItem("uid", action.uid);
      action.isSuperUser ? history.push("/admin") : history.push("/dashboards");
      return {
        ...state,
        authAttempted: true,
        uid: action.uid,
        authKeyID: action.authKeyID,
        isSuperUser: action.isSuperUser
      };
    }
    case "LOADING_USER": {
      return { ...state, user: action.uid };
    }
    case "LOGOUT": {
      localStorage.setItem("isSuperUser", null);
      localStorage.setItem("authKeyID", null);
      localStorage.setItem("uid", null);
      history.push("/login");
      return { authAttempted: false, authKeyID: null, uid: null };
    }
    default:
      return state;
  }
};
export { initialState };
export default appStateReducer;
