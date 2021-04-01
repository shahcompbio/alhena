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
      dashboards {
        name
      }
      defaultDashboard
    }
  }
`;

const DashboardWrapper = ({ uri, classes, history, client }) => {
  const [{ authKeyID, uid }] = useAppState();
  const ticketFromUrl = uri ? uri.params.ticket : null;
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

        const dashboards = data["getDashboardsByUser"]["dashboards"].map(
          dashboard => dashboard.name
        );
        const { defaultDashboard } = data["getDashboardsByUser"];

        const intialStateUpdated = initialState(
          dashboards,
          defaultDashboard,
          ticketFromUrl
        );
        return (
          <DashboardProvider
            initialState={intialStateUpdated}
            reducer={dashboardStateReducer}
          >
            <Content client={client} />
          </DashboardProvider>
        );
      }}
    </Query>
  );
};

export default DashboardWrapper;
