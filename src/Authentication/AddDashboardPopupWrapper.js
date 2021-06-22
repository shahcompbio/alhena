import React from "react";

import PopUpContent from "./NewDashboard/PopupContent.js";

import gql from "graphql-tag";
import { Query } from "react-apollo";

export const GETALLDASHBOARDOPTIONS = gql`
  query getIndices {
    getAllIndices {
      name
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
            dashboardAction={(name, selectedIndices) =>
              dashboardAction(name, selectedIndices)
            }
          />
        );
      }}
    </Query>
  );
};

export default AddDashboardPopupWrapper;
