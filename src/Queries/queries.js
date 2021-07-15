import gql from "graphql-tag";

export const getAllDashboards = gql`
  query getAllDashboards($user: ApiUser!) {
    getAllDashboards(auth: $user) {
      name
      count
    }
  }
`;

export const VERIFYNEWUSERAUTHKEY = gql`
  query verifyNewUserUri($key: String!) {
    verifyNewUserUri(key: $key) {
      isValid
      email
    }
  }
`;

export const getUsers = gql`
  query AdminPanel($user: ApiUser!) {
    getUsers(auth: $user) {
      username
      roles
      full_name
      email
      isAdmin
    }
    getAllDashboards(auth: $user) {
      name
    }
  }
`;
