import gql from "graphql-tag";

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
