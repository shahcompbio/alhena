import gql from "graphql-tag";

export const getProjects = gql`
  query projects($user: ApiUser!) {
    getProjects(auth: $user) {
      name
      count
    }
  }
`;
export const LOGIN = gql`
  query Login($user: User!) {
    login(user: $user) {
      statusCode
      authKeyID
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
