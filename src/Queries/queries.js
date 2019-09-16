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
          target
          children {
            ... on ParentType {
              target
              children {
                ... on ParentType {
                  target
                  children {
                    ... on ChildType {
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
