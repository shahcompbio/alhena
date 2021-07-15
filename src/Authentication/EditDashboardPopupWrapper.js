import React from "react";
import gql from "graphql-tag";
import PopUpContent from "./Dashboard/PopupContent.js";

import { Query } from "react-apollo";
export const GETINDICESBYDASHBOARD = gql`
  query getIndex($dashboard: String!) {
    getAllIndices {
      name
    }
    getIndicesByDashboard(dashboard: $dashboard) {
      name
    }
    getDashboardColumnsByDashboard(dashboard: $dashboard) {
      type
      label
    }
    getAvailableDashboardColumns {
      type
      label
    }
    getDashboardUsers(name: $dashboard) {
      username
    }
    getAllUsers {
      username
      full_name
      isAdmin
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
            allDashboardColumns={data.getAvailableDashboardColumns}
            selectedDashboardColumns={data.getDashboardColumnsByDashboard}
            handleClose={handleClose}
            isEdit={true}
            dashboardName={dashboardName}
            dashboardAction={dashboardAction}
            selectedDashboardUsers={data.getDashboardUsers}
            allDashboardsUsers={data.getAllUsers}
          />
        );
      }}
    </Query>
  );
};

export default EditDashboardPopupWrapper;
