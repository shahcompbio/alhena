import {
  VERIFYNEWUSERAUTHKEY,
  DELETEUSERBYUSERNAME,
  CREATENEWDASHBOARD
} from "../Queries/queries.js";

export const verifyNewUserSecureUrl = async (key, client) => {
  const { data } = await client.query({
    query: VERIFYNEWUSERAUTHKEY,
    variables: {
      key: key
    }
  });
  return data;
};
