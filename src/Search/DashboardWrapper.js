import React from "react";
import { useAppState } from "../util/app-state";

import { gql, useQuery } from "@apollo/client";

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

  const { loading, error, data } = useQuery(getDashboardByUser, {
    variables: {
      fragment: fragment,
      user: { authKeyID: authKeyID, uid: uid }
    }
  });
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
      <Content />
    </DashboardProvider>
  );
};

export default DashboardWrapper;
