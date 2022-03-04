import React from "react";

import PopUpContent from "./Dashboard/PopupContent.js";

import { gql, useQuery } from "@apollo/client";

export const GETALLDASHBOARDOPTIONS = gql`
  query getIndices {
    getAllIndices {
      name
    }
    getAvailableDashboardColumns {
      type
      label
    }
    getAllUsers {
      username
      full_name
      isAdmin
    }
  }
`;
const AddDashboardPopupWrapper = ({ isOpen, handleClose, dashboardAction }) => {
  const { data, loading, error } = useQuery(GETALLDASHBOARDOPTIONS);

  if (loading) return null;
  if (error) return null;
  return (
    <PopUpContent
      isOpen={isOpen}
      allIndices={data.getAllIndices.map(option => option.name)}
      alreadySelectedIndices={[]}
      handleClose={handleClose}
      isEdit={false}
      dashboardName={""}
      dashboardAction={(
        name,
        selectedIndices,
        selectedColumns,
        selectedUsers
      ) =>
        dashboardAction(name, selectedIndices, selectedColumns, selectedUsers)
      }
      selectedDashboardColumns={[]}
      allDashboardColumns={data.getAvailableDashboardColumns}
      selectedDashboardUsers={[]}
      allDashboardsUsers={data.getAllUsers}
    />
  );
};

export default AddDashboardPopupWrapper;
