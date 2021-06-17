import React from "react";
import * as d3 from "d3";

import { withStyles } from "@material-ui/core/styles";

import QCDashboard from "./QCDashboard.js";
import CellmineDashboard from "./CellmineDashboard.js";

import LoadingCircle from "./CommonModules/LoadingCircle.js";

import { Grid, Paper } from "@material-ui/core";

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

const DashboardContent = ({ classes, history, client }) => {
  const [
    { selectedAnalysis, selectedDashboard, linkParams }
  ] = useDashboardState();
  const modifiedInitialState = linkParams ? linkParams[0] : initialState;

  return (
    <StatsProvider
      initialState={modifiedInitialState}
      reducer={statsStateReducer}
    >
      {selectedAnalysis ? (
        selectedDashboard.toLowerCase() === "fitness" ? (
          <QCDashboard
            analysis={selectedAnalysis}
            item
            xs={8}
            client={client}
          />
        ) : (
          <CellmineDashboard
            analysis={selectedAnalysis}
            item
            xs={8}
            client={client}
          />
        )
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
    </StatsProvider>
  );
};

export default withStyles(styles)(DashboardContent);
