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
  query UserDashboard($user: ApiUser!, $fragment: String) {
    getQueryParams(fragment: $fragment) {
      paramsFromLink
    }
    getDashboardsByUser(auth: $user) {
      dashboards {
        name
      }
      defaultDashboard
    }
  }
`;

const DashboardWrapper = ({ uri, classes, history, client, props }) => {
  const [{ authKeyID, uid }] = useAppState();
  const ticketFromUrl = uri.params.ticket ? uri.params.ticket : null;
  const fragment = uri.params.copyLink ? uri.params.copyLink : null;

  return (
    <Query
      query={getDashboardByUser}
      variables={{
        fragment: fragment,
        user: { authKeyID: authKeyID, uid: uid }
      }}
    >
      {({ loading, error, data }) => {
        if (loading) return null;
        if (error) return null;

        const dashboards = data["getDashboardsByUser"]["dashboards"].map(
          dashboard => dashboard.name
        );
        const defaultDashboard =
          ticketFromUrl !== null
            ? null
            : data["getDashboardsByUser"]["defaultDashboard"];
        const linkParams = data.getQueryParams
          ? data.getQueryParams.paramsFromLink
              .split("||")
              .map(paramString => JSON.parse(paramString))
          : null;

        const intialStateUpdated = initialState(
          dashboards,
          defaultDashboard,
          ticketFromUrl,
          linkParams
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
