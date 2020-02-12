import React from "react";

import gql from "graphql-tag";
import { useQuery } from "react-apollo-hooks";

import { withStyles } from "@material-ui/core/styles";

import Heatmap from "./Heatmap/Heatmap.js";
import ChipHeatmap from "./ChipHeatmap/ChipHeatmap.js";
import GCBias from "./GCBias/GCBias.js";

import { Paper } from "@material-ui/core";
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
  paperContainer: {
    margin: 15
  }
});
const QCDashboard = ({ analysis, classes }) => {
  const [{ quality }] = useStatisticsState();

  const { loading, data } = useQuery(HEATMAP_ORDER, {
    variables: {
      analysis: analysis,
      quality: quality
    }
  });

  if (!loading && data) {
    const heatmapOrder = data.heatmapOrder.map(order => order.order);

    return [
      <Paper className={classes.paperContainer}>
        <GCBias analysis={analysis} />
      </Paper>,
      <Paper className={classes.paperContainer}>
        <ChipHeatmap analysis={analysis} />
      </Paper>,
      <Paper className={[classes.heatmapContent, classes.paperContainer]}>
        <Heatmap
          analysis={analysis}
          allHeatmapOrder={heatmapOrder}
          categoryStats={data.categoriesStats}
        />
      </Paper>
    ];
  } else {
    return null;
  }
};
export default withStyles(styles)(QCDashboard);
