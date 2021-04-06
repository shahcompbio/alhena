import React from "react";
import gql from "graphql-tag";
import PopUpContent from "./PopUpContent.js";

import { Query } from "react-apollo";
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

const EditDashboardPopupWrapper = ({
  isOpen,
  handleClose,
  dashboardAction,
  dashboardName
}) => {
  return (
    <Query
      query={GETINDICESBYDASHBOARD}
      variables={{ dashboard: dashboardName }}
    >
      {({ loading, error, data }) => {
        if (loading) return null;
        if (error) return null;

        return (
          <PopUpContent
            isOpen={isOpen}
            allIndices={data.getAllIndices.map(option => option.name)}
            alreadySelectedIndices={data.getIndicesByDashboard.map(
              option => option.name
            )}
            handleClose={handleClose}
            isEdit={true}
            dashboardName={dashboardName}
            dashboardAction={dashboardAction}
          />
        );
      }}
    </Query>
  );
};

export default EditDashboardPopupWrapper;
