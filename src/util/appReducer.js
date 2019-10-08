/*const initialState = localStorage.getItem("uid")
  ? {
      authAttempted: false,
      authKeyID: localStorage.getItem("authKeyID"),
      uid: localStorage.getItem("uid")
    }
  : { authAttempted: false, authKeyID: null, uid: null };*/
const initialState = { authAttempted: false, authKeyID: null, uid: null };
const appStateReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_CHANGE": {
      localStorage.setItem("authKeyID", action.authKeyID);
      localStorage.setItem("uid", action.uid);
      return {
        ...state,
        authAttempted: true,
        uid: action.uid,
        authKeyID: action.authKeyID
      };
    }
    case "LOADING_USER": {
      return { ...state, user: action.uid };
    }
    default:
      return state;
  }
};
export { initialState };
export default appStateReducer;
