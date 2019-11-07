import React, { useState, useEffect } from "react";

import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";

import PopUpContent from "./PopUpContent.js";

import { withRouter } from "react-router";
import { Query } from "react-apollo";
import { GETALLDASHBOARDOPTIONS } from "../Queries/queries.js";

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
