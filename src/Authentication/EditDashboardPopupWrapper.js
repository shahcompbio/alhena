import React, { useState, useEffect } from "react";

import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";

import PopUpContent from "./PopUpContent.js";

import { withRouter } from "react-router";
import { Query } from "react-apollo";
import { GETINDICESBYDASHBOARD } from "../Queries/queries.js";

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
