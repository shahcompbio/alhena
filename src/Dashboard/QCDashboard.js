import React from "react";

import gql from "graphql-tag";
import { useQuery } from "react-apollo-hooks";

import { withStyles } from "@material-ui/core/styles";

import Heatmap from "./Heatmap/Heatmap.js";
import ChipHeatmap from "./ChipHeatmap/ChipHeatmap.js";
import GCBias from "./GCBias/GCBias.js";

import SettingsPanel from "./SettingsPanel.js";

import { Paper, Grid } from "@material-ui/core";
import { useStatisticsState } from "./DashboardState/statsState";
const HEATMAP_ORDER = gql`
  query heatmapOrder($analysis: String!, $quality: String!) {
    heatmapOrder(analysis: $analysis, quality: $quality) {
      order
    }
    categoriesStats(analysis: $analysis) {
      category
      types
    }
  }
`;
const styles = theme => ({
  heatmapContent: {
    padding: 15,
    height: 1000,
    width: 1150
  },
  gcBias: {
    width: 800
  },
  chip: {
    width: 900
  },
  paperContainer: {
    margin: 15
  },
  settings: {
    width: 400
  },
  plots: {
    marginLeft: 400
  }
});
const QCDashboard = ({ analysis, classes }) => {
  const [{ selectedCells, quality }] = useStatisticsState();

  const { loading, data } = useQuery(HEATMAP_ORDER, {
    variables: {
      analysis: analysis,
      quality: quality
    }
  });

  if (!loading && data) {
    const heatmapOrder = data.heatmapOrder.map(order => order.order);

    return [
      <Grid item className={classes.settings} item xs={4}>
        <SettingsPanel
          categoryStats={data.categoriesStats}
          analysis={analysis}
        />
      </Grid>,
      <Grid item className={classes.plots}>
        <Paper className={[classes.gcBias, classes.paperContainer]}>
          <GCBias analysis={analysis} />
        </Paper>

        <Paper className={[classes.chip, classes.paperContainer]}>
          <ChipHeatmap analysis={analysis} />
        </Paper>

        <Paper className={[classes.heatmapContent, classes.paperContainer]}>
          <Heatmap
            analysis={analysis}
            allHeatmapOrder={heatmapOrder}
            categoryStats={data.categoriesStats}
          />
        </Paper>
      </Grid>
    ];
  } else {
    return null;
  }
};

export default withStyles(styles)(QCDashboard);
