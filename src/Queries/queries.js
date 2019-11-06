import gql from "graphql-tag";
export const DELETEDASHBOARD = gql`
  query deleteDashboard($name: String!) {
    deleteDashboard(name: $name) {
      allDeleted
    }
  }
`;
export const UPDATEDASHBOARD = gql`
  query updateDashboard($dashboard: DashboardInput) {
    updateDashboard(dashboard: $dashboard) {
      hasUpdated
    }
  }
`;
export const CREATENEWDASHBOARD = gql`
  query createNewDashboard($dashboard: DashboardInput!) {
    createNewDashboard(dashboard: $dashboard) {
      roleCreated
      newAliasesHadErrors
    }
  }
`;
export const GETINDICESBYDASHBOARD = gql`
  query getIndex($dashboard: String!) {
    getAllIndices {
      name
    }
    getIndicesByDashboard(dashboard: $dashboard) {
      name
    }
  }
`;
export const GETALLDASHBOARDOPTIONS = gql`
  query getIndices {
    getAllIndices {
      name
    }
  }
`;
export const UPDATEUSERROLES = gql`
  query updateUserRoles(
    $username: String!
    $newRoles: [String!]
    $email: String!
    $name: String!
  ) {
    updateUserRoles(
      username: $username
      newRoles: $newRoles
      email: $email
      name: $name
    ) {
      created
    }
  }
`;
export const GETPROJECTROLES = gql`
  query projectRoles {
    getProjectRoles {
      roles
    }
  }
`;
export const getAllProjects = gql`
  query getAllProjects {
    getAllProjects {
      name
      count
    }
  }
`;
export const getProjects = gql`
  query projects($user: ApiUser!) {
    getProjects(auth: $user) {
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
export const createUserEmail = gql`
  query createUserEmail($recipient: Recipient!) {
    sendMail(recipient: $recipient) {
      response
      rejected
      accepted
    }
  }
`;
export const DELETEUSERBYUSERNAME = gql`
  query DeleteUser($username: String!) {
    deleteUser(username: $username) {
      isDeleted
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
    }
    getProjectRoles {
      roles
    }
  }
`;

export const getAllAnalyses = gql`
  query Sunburst($filter: [Term]!, $user: ApiUser!) {
    analysesStats(filters: $filter, auth: $user) {
      label
      value
    }
    analysesList(filters: $filter, auth: $user) {
      label
      values
      type
    }
    analysesTree(filters: $filter, auth: $user) {
      source
      children {
        ... on ParentType {
          source
          target
          children {
            ... on ParentType {
              source
              target
              children {
                ... on ParentType {
                  source
                  target
                  children {
                    ... on ChildType {
                      source
                      target
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
