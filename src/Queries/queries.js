import gql from "graphql-tag";

export const getProjects = gql`
  query {
    getProjects {
      name
      count
    }
  }
`;
export const analysesBySampleID = gql`
  query Sunburst($sampleID: String!, $project: String!) {
    analysesBySampleID(sampleID: $sampleID, project: $project) {
      children {
        ... on ParentType {
          name
          children {
            ... on ParentType {
              name
              children {
                ... on ParentType {
                  name
                  children {
                    ... on ChildType {
                      name
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

export const getAllSunburstAnalyses = gql`
  query Sunburst($filter: [Term]!) {
    analysesStats(filters: $filter) {
      label
      value
    }
    analysesList(filters: $filter) {
      label
      values
      type
    }
    analysesTree(filters: $filter) {
      parent
      children {
        ... on ParentType {
          parent
          name
          children {
            ... on ParentType {
              parent
              name
              children {
                ... on ParentType {
                  parent
                  name
                  children {
                    ... on ChildType {
                      parent
                      name
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
