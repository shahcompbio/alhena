import gql from "graphql-tag";

export const CREATENEWDASHBOARD = gql`
  query createNewDashboard($dashboard: DashboardInput!) {
    createNewDashboard(dashboard: $dashboard) {
      created
    }
  }
`;

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

export const NEWUSER = gql`
  query createNewUser($user: NewUser!) {
    createNewUser(user: $user) {
      created
    }
  }
`;
export const LOGIN = gql`
  query Login($user: User!) {
    login(user: $user) {
      statusCode
      authKeyID
      role
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
