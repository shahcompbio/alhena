import React from "react";

import { withStyles } from "@material-ui/core/styles";

import QCDashboard from "./QCDashboard.js";

import { Grid, Paper } from "@material-ui/core";

import statsStateReducer, { initialState } from "./DashboardState/statsReducer";
import { StatsProvider } from "./DashboardState/statsState";

import { useDashboardState } from "../Search/ProjectView/ProjectState/dashboardState";

const styles = theme => ({
  content: {
    overflowX: "scroll"
  },
  heatmapContent: {
    padding: 15,
    height: 1000,
    width: 1150
  },
  paperContainer: {
    margin: 15
  },
  plots: {
    marginLeft: 400
  },
  settings: {
    padding: 10,
    width: 300,
    background: "none",
    height: "100%",
    position: "fixed",
    backgroundColor: "#FFFFFF"
  }
});

const DashboardContent = ({ classes, history }) => {
  const [{ selectedAnalysis }] = useDashboardState();

  return (
    <StatsProvider initialState={initialState} reducer={statsStateReducer}>
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        className={classes.content}
      >
        <Grid item className={classes.dashboard}>
          {selectedAnalysis ? (
            <QCDashboard analysis={selectedAnalysis} item xs={8} />
          ) : (
            [
              <Grid className={classes.settings} item xs={4}>
                <Paper
                  className={[classes.heatmapContent, classes.paperContainer]}
                />
              </Grid>,
              <Grid item className={classes.plots}>
                <Paper
                  className={[classes.heatmapContent, classes.paperContainer]}
                />
              </Grid>
            ]
          )}
        </Grid>
      </Grid>
    </StatsProvider>
  );
};

export default withStyles(styles)(DashboardContent);
