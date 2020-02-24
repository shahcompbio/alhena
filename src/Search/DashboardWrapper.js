import React from "react";
import { useAppState } from "../util/app-state";

import { Query } from "react-apollo";
import gql from "graphql-tag";
import Content from "./Content.js";

import dashboardStateReducer, {
  initialState
} from "./ProjectView/ProjectState/dashboardReducer";
import { DashboardProvider } from "./ProjectView/ProjectState/dashboardState";

const getDashboardByUser = gql`
  query UserDashboard($user: ApiUser!) {
    getDashboardsByUser(auth: $user) {
      name
    }
  }
`;

const DashboardWrapper = ({ classes, history }) => {
  const [{ authKeyID, uid }] = useAppState();

  return (
    <Query
      query={getDashboardByUser}
      variables={{
        user: { authKeyID: authKeyID, uid: uid }
      }}
    >
      {({ loading, error, data }) => {
        if (loading) return null;
        if (error) return null;
        const dashboards = data.getDashboardsByUser.map(
          dashboard => dashboard.name
        );
        const intialStateUpdated = initialState(dashboards, dashboards[0]);
        return (
          <DashboardProvider
            initialState={intialStateUpdated}
            reducer={dashboardStateReducer}
          >
            <Content />
          </DashboardProvider>
        );
      }}
    </Query>
  );
};

export default DashboardWrapper;
