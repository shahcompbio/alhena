import {
  LOGIN,
  NEWUSER,
  VERIFYNEWUSERAUTHKEY,
  DELETEUSERBYUSERNAME,
  GETDASHBOARDROLES,
  UPDATEUSERROLES,
  DELETEDASHBOARD,
  CREATENEWDASHBOARD,
  UPDATEDASHBOARD
} from "../Queries/queries.js";
export const updateDashboard = async (client, name, selectedIndices) => {
  const { data, loading, error } = await client.query({
    query: UPDATEDASHBOARD,
    variables: {
      dashboard: { name: name, indices: selectedIndices }
    }
  });
  return data.created;
};
export const createNewDashboard = async (client, name, selectedIndices) => {
  const { data, loading, error } = await client.query({
    query: CREATENEWDASHBOARD,
    variables: {
      dashboard: { name: name, indices: selectedIndices }
    }
  });
  return data.created;
};
export const deleteDashboard = async (name, client) => {
  const { data, loading, error } = await client.query({
    query: DELETEDASHBOARD,
    variables: {
      name: name
    }
  });
  return data.deleteDashboard.allDeleted;
};
export const updateUserRoles = async (
  username,
  roles,
  email,
  full_name,
  client
) => {
  const { data, loading, error } = await client.query({
    query: UPDATEUSERROLES,
    variables: {
      email: email,
      name: full_name,
      username: username,
      newRoles: [...roles]
    }
  });
  return data.updateUserRoles.created;
};
export const getProjectRoles = async client => {
  const { data, loading, error } = await client.query({
    query: GETDASHBOARDROLES
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
