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
  const ticketFromUrl = uri && uri.params.ticket ? uri.params.ticket : null;
  const fragment = uri && uri.params.copyLink ? uri.params.copyLink : "";

  return (
    <Query
      query={getQueryParams}
      variables={{
        fragment: fragment
      }}
    >
      {({ loading, error, data }) => {
        if (loading) return null;
        if (error) return null;

        const linkParams = data.getQueryParams
          ? data.getQueryParams.paramsFromLink
              .split("||")
              .map(paramString => JSON.parse(paramString))
          : null;

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
      }}
    </Query>
  );
};

export default DashboardWrapper;
