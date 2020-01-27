import React from "react";

import { withRouter } from "react-router";

import { withStyles } from "@material-ui/core/styles";
import { useAppState } from "../../util/app-state";

import { useDashboardState } from "../ProjectView/ProjectState/dashboardState";
import { Query } from "react-apollo";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Typography from "@material-ui/core/Typography";
import gql from "graphql-tag";
const getDashboardByUser = gql`
  query UserDashboard($user: ApiUser!) {
    getDashboardsByUser(auth: $user) {
      name
    }
  }
`;
const styles = theme => ({
  content: {
    flexGrow: 1
  },
  container: {
    minHeight: "100vh"
  }
});

const OverviewContent = ({ classes, handleForwardStep }) => {
  const [{ selectedDashboard, dashboards }, dispatch] = useDashboardState();
  const [{ authKeyID, uid }] = useAppState();
  const selectProject = project => {
    handleForwardStep();

    dispatch({
      type: "DASHBOARD_SELECT",
      value: { selectedDashboard: project }
    });
  };

  return dashboards.length > 0 ? (
    <div className={classes.content}>
      <Grid
        direction="column"
        justify="center"
        alignItems="center"
        container
        spacing={2}
        key={"grid"}
        className={classes.container}
      >
        <Grid item style={{ textAlign: "center" }}>
          <Typography
            variant="h5"
            color="secondary"
            style={{ marginBottom: 50 }}
          >
            Select from the following available dashboards:
          </Typography>
          <ButtonGroup
            fullWidth
            color="secondary"
            size="large"
            aria-label="full width secondary outlined button group"
          >
            {dashboards.map(project => {
              return (
                <Button
                  key={"button" + project}
                  value={project}
                  onClick={() => selectProject(project)}
                >
                  {project}
                </Button>
              );
            })}
          </ButtonGroup>
        </Grid>
      </Grid>
    </div>
  ) : null;
};

export default withStyles(styles)(OverviewContent);
