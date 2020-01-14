import React from "react";

import gql from "graphql-tag";
import { useQuery } from "react-apollo-hooks";

import Heatmap from "./Heatmap/Heatmap.js";

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

const QCDashboard = ({ analysis }) => {
  const [{ quality }] = useStatisticsState();

  const { loading, data } = useQuery(HEATMAP_ORDER, {
    variables: {
      analysis: analysis,
      quality: quality
    }
  });

  if (!loading && data) {
    const heatmapOrder = data.heatmapOrder.map(order => order.order);

    return (
      <Heatmap
        analysis={analysis}
        heatmapOrder={heatmapOrder}
        categoryStats={data.categoriesStats}
      />
    );
  } else {
    return null;
  }
};
export default QCDashboard;
