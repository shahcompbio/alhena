import React from "react";
import { useAppState } from "../util/app-state";

import { Query } from "react-apollo";
import gql from "graphql-tag";
import useQuery from "graphql-tag";
import Content from "./Content.js";

import dashboardStateReducer, {
  initialState
} from "./ProjectView/ProjectState/dashboardReducer";
import { DashboardProvider } from "./ProjectView/ProjectState/dashboardState";

const getQueryParams = gql`
  query UserDashboard($fragment: String) {
    getQueryParams(fragment: $fragment) {
      paramsFromLink
    }
  }
`;

const DashboardWrapper = ({ uri, classes, history, client }) => {
  const [{ authKeyID, uid }] = useAppState();
  const ticketFromUrl = uri && uri.params.ticket ? uri.params.ticket : null;
  const fragment = uri && uri.params.copyLink ? uri.params.copyLink : null;
  var linkParams = null;
  console.log(uri);
  if (fragment !== null) {
    const { loading, error, data } = useQuery(getQueryParams, {
      variables: { fragment }
    });

    linkParams = data.getQueryParams
      ? data.getQueryParams.paramsFromLink
          .split("||")
          .map(paramString => JSON.parse(paramString))
      : null;
  }

  const intialStateUpdated = initialState(
    ["Fitness"],
    "Fitness",
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
};

export default DashboardWrapper;
