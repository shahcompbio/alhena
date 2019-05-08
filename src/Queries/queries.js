import gql from "graphql-tag";
export const getAllDashboards = gql`
  query GetIndices {
    getAllDashboards {
      index
      title
      description
      quality
      sampleIds {
        sampleId
      }
      tags {
        sampleId
      }
      quality
    }
  }
`;
