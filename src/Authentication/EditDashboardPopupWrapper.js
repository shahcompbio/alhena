import React from "react";
import PopUpContent from "./Dashboard/PopupContent.js";

import { gql, useQuery } from "@apollo/client";

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
  const { data, loading, error } = useQuery(GETINDICESBYDASHBOARD, {
    variables: { dashboard: dashboardName }
  });

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
};

export default EditDashboardPopupWrapper;
