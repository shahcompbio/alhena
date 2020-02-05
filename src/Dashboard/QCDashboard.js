import React from "react";

import gql from "graphql-tag";
import { useQuery } from "react-apollo-hooks";

import { withStyles } from "@material-ui/core/styles";

import Heatmap from "./Heatmap/Heatmap.js";
import ChipHeatmap from "./ChipHeatmap/ChipHeatmap.js";
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
    width: 1150,
    margin: 15
  },
  chipHeatmapContent: {
    padding: 15,
    height: 800,
    width: 800
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
      <Paper className={classes.chipHeatmap}>
        <ChipHeatmap analysis={analysis} />
      </Paper>,
      <Paper className={classes.heatmapContent}>
        <Heatmap
          analysis={analysis}
          heatmapOrder={heatmapOrder}
          categoryStats={data.categoriesStats}
        />
      </Paper>
    ];
  } else {
    return null;
  }
};
export default withStyles(styles)(QCDashboard);
