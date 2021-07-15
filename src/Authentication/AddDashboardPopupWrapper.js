import React from "react";

import PopUpContent from "./Dashboard/PopupContent.js";

import gql from "graphql-tag";
import { Query } from "react-apollo";

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
  return (
    <Query query={GETALLDASHBOARDOPTIONS}>
      {({ loading, error, data }) => {
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
              dashboardAction(
                name,
                selectedIndices,
                selectedColumns,
                selectedUsers
              )
            }
            selectedDashboardColumns={[]}
            allDashboardColumns={data.getAvailableDashboardColumns}
            selectedDashboardUsers={[]}
            allDashboardsUsers={data.getAllUsers}
          />
        );
      }}
    </Query>
  );
};

export default AddDashboardPopupWrapper;
