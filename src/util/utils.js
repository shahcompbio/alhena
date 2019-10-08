import { LOGIN } from "../Queries/queries.js";
export async function login(uid, password, client, dispatch) {
  const { data, loading } = await client.query({
    query: LOGIN,
    variables: {
      user: { uid: "elastic", password: "JemYoDqYACLp8JPvD3dL" }
    }
  });
  if (loading) {
    dispatch({
      type: "AUTH_CHANGE",
      response: data.login.response,
      authKeyID: data.login.authKeyID,
      uid: uid
    });
  }
  if (data) {
    dispatch({
      type: "AUTH_CHANGE",
      response: data.login.response,
      authKeyID: data.login.authKeyID,
      uid: uid
    });
  }
}

export function onAuthStateChanged(callback) {
  // dispatch({ type: "AUTH_CHANGE", callback });
}
