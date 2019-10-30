import {
  LOGIN,
  NEWUSER,
  VERIFYNEWUSERAUTHKEY,
  DELETEUSERBYUSERNAME,
  GETPROJECTROLES,
  UPDATEUSERROLES
} from "../Queries/queries.js";

export const updateUserRoles = async (username, roles, client) => {
  const { data, loading, error } = await client.query({
    query: UPDATEUSERROLES,
    variables: {
      username: username,
      newRoles: [...roles]
    }
  });
  return data.updateUserRoles.created;
};
export const getProjectRoles = async client => {
  const { data, loading, error } = await client.query({
    query: GETPROJECTROLES
  });
  return data.getProjectRoles.roles;
};
export const deleteUserByUsername = async (username, client) => {
  const { data, loading, error } = await client.query({
    query: DELETEUSERBYUSERNAME,
    variables: {
      username: username
    }
  });
  return data.deleteUser.isDeleted;
};

export const verifyNewUserSecureUrl = async (key, client) => {
  const { data, loading, error } = await client.query({
    query: VERIFYNEWUSERAUTHKEY,
    variables: {
      key: key
    }
  });
  return data;
};
export const queryCreateNewUser = async (user, client) => {
  const { data, loading } = await client.query({
    query: NEWUSER,
    variables: {
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password
      }
    }
  });
  return data.createNewUser.created;
};
export const login = async (uid, password, client, dispatch) => {
  const { data, loading } = await client.query({
    query: LOGIN,
    variables: {
      user: { uid: uid, password: password }
    }
  });

  if (loading) {
    dispatch({
      type: "LOADING",
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
      uid: uid,
      isSuperUser: data.login.role.filter(role => role === "superuser").length
    });
  }
};
