import {
  VERIFYNEWUSERAUTHKEY,
  DELETEUSERBYUSERNAME,
  CREATENEWDASHBOARD
} from "../Queries/queries.js";

export const createNewDashboard = async (client, name, selectedIndices) => {
  const { data } = await client.query({
    query: CREATENEWDASHBOARD,
    variables: {
      dashboard: { name: name, indices: selectedIndices }
    }
  });
  return data.created;
};

export const verifyNewUserSecureUrl = async (key, client) => {
  const { data } = await client.query({
    query: VERIFYNEWUSERAUTHKEY,
    variables: {
      key: key
    }
  });
  return data;
};
