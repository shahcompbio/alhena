import React from "react";

import { useAppState } from "../../util/app-state";
import { withStyles } from "@material-ui/styles";

import Table from "./TableView/Table.js";

import Grid from "@material-ui/core/Grid";

import { gql, useQuery } from "@apollo/client";

import { useDashboardState } from "./ProjectState/dashboardState";

const styles = {
  root: { flexGrow: 1 },
  hide: {
    display: "none"
  },
  title: {
    color: "white",
    filter: "url(#textGlow)",
    paddingTop: 50,
    paddingLeft: 50
  },
  activeWhite: {
    cursor: "pointer",
    color: "white !important"
  },
  disabled: { cursor: "pointer" },
  stepper: { margin: "auto", position: "absolute", bottom: 50, left: "50vw" },
  tableWrapper: {
    marginTop: "5vh"
  }
};
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
        <Grid
          item
          xs={6}
          sm={3}
          className={classes.tableWrapper}
          key={"grid-table"}
        >
          <Table
            columns={[]}
            rows={[]}
            handleForwardStep={null}
            key={"project-view-table"}
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
              justify="center"
              alignItems="center"
              className={classes.tableWrapper}
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
export default withStyles(styles)(ProjectViewContent);
