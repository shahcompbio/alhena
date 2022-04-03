import React from "react";

import withStyles from "@mui/styles/withStyles";

import QCDashboard from "./QCDashboard.js";

import { Grid, Paper } from "@mui/material";

import statsStateReducer, { initialState } from "./DashboardState/statsReducer";
import { StatsProvider } from "./DashboardState/statsState";

import { useDashboardState } from "../Search/ProjectView/ProjectState/dashboardState";

const styles = theme => ({
  heatmapContent: {
    padding: 15,
    height: 1000,
    width: 1000
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
  const [{ selectedAnalysis, linkParams }] = useDashboardState();
  const modifiedInitialState = linkParams ? linkParams[0] : initialState;

  return (
    <StatsProvider
      initialState={modifiedInitialState}
      reducer={statsStateReducer}
    >
      {selectedAnalysis ? (
        <QCDashboard analysis={selectedAnalysis} item xs={8} />
      ) : (
        [
          <Grid className={classes.settings} key={"heatmapSettngs"} item xs={4}>
            <Paper
              className={[classes.heatmapContent, classes.paperContainer].join(
                " "
              )}
            />
          </Grid>,
          <Grid item key={"grid-plots"} className={classes.plots}>
            <Paper
              className={[classes.heatmapContent, classes.paperContainer].join(
                " "
              )}
            />
          </Grid>
        ]
      )}
    </StatsProvider>
  );
};

export default withStyles(styles)(DashboardContent);
