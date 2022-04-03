import React from "react";

import { useAppState } from "../../util/app-state";

import Table from "./TableView/Table.js";

import Grid from "@mui/material/Grid";

import { gql, useQuery } from "@apollo/client";

import { useDashboardState } from "./ProjectState/dashboardState";

const getAllAnalyses = gql`
  query Sunburst($filter: [Term]!, $user: ApiUser!, $dashboardName: String!) {
    getDashboardColumnsByDashboard(dashboard: $dashboardName) {
      type
      label
    }
    analyses(filters: $filter, auth: $user, dashboardName: $dashboardName) {
      error
      defaultProjectView
      analysesRows {
        project
        sample_id
        library_id
        dashboard_id
      }
      analysesStats {
        label
        value
      }
      analysesList {
        label
        values
        type
      }
      analysesTree {
        source
        children {
          ... on ParentType {
            source
            target
            children {
              ... on ParentType {
                source
                target
                children {
                  ... on ParentType {
                    source
                    target
                    children {
                      ... on ChildType {
                        source
                        target
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const ProjectViewContent = ({ classes, handleForwardStep }) => {
  const [{ selectedDashboard }] = useDashboardState();

  const [{ authKeyID, uid }, dispatch] = useAppState();

  const { loading, error, data } = useQuery(getAllAnalyses, {
    variables: {
      filter: [],
      dashboardName: selectedDashboard,
      user: { authKeyID: authKeyID, uid: uid }
    },
    skip: selectedDashboard === null
  });

  if (error) {
    console.log(error);
    //  dispatch({
    //    type: "LOGOUT"
    //  });
    return null;
  } else if (loading) {
    return (
      <div>
        <Grid item xs={6} sm={3} sx={{ marginTop: "5vh" }} key={"grid-table"}>
          <Table
            columns={[]}
            rows={[]}
            handleForwardStep={null}
            key={"project-view-table"}
            project={[]}
          />
        </Grid>
      </div>
    );
  } else {
    if (data) {
      if (data["analyses"] && data["analyses"]["error"]) {
        dispatch({
          type: "LOGOUT"
        });
        return null;
      } else {
        return (
          <div>
            <Grid
              container
              direction="column"
              justifyContent="center"
              alignItems="center"
              sx={{ marginTop: "5vh" }}
              key={"grid-table"}
            >
              <Table
                key={"project-view-table"}
                columns={data["getDashboardColumnsByDashboard"]}
                project={data["analyses"]["analysesRows"][0]["project"]}
                rows={data["analyses"]["analysesRows"]}
                handleForwardStep={handleForwardStep}
              />
            </Grid>
          </div>
        );
      }
    } else {
      return null;
    }
  }
};
export default ProjectViewContent;
