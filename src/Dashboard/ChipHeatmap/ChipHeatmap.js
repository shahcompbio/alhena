import React from "react";

import XYFrame from "semiotic/lib/XYFrame";
import Legend from "./Legend.js";

import { withStyles } from "@material-ui/core/styles";

import { Query } from "react-apollo";
import gql from "graphql-tag";

import Grid from "@material-ui/core/Grid";

import { useStatisticsState } from "../DashboardState/statsState";
import { scaleLinear } from "d3-scale";

const chipHeatmapHeight = 700;
const maxColour = "#d91e18";
const styles = theme => ({
  legend: {
    marginTop: 50,
    marginRight: 30,
    marginLeft: 15
  }
});

const CHIP_HEATMAP_QUERY = gql`
  query getChipHeatmap($analysis: String!, $quality: String!) {
    chipHeatmap(analysis: $analysis, quality: $quality) {
      squares {
        columnIndex
        rowIndex
        cellId
        totalMappedReads
      }
      stats {
        max
      }
    }
  }
`;

const ChipHeatmap = ({ analysis, classes }) => {
  const [{ quality, categoryState }] = useStatisticsState();

  return (
    <Query query={CHIP_HEATMAP_QUERY} variables={{ analysis, quality }}>
      {({ loading, error, data }) => {
        if (error) return null;
        if (loading && Object.keys(data).length === 0) {
          return null;
        }
        const { chipHeatmap } = data;

        return (
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Grid item>
              <Chip data={chipHeatmap} />
            </Grid>
            <Grid item className={classes.legend}>
              <Legend max={chipHeatmap.stats.max} maxColour={maxColour} />
            </Grid>
          </Grid>
        );
      }}
    </Query>
  );
};

const frameProp = (data, thresholds) => {
  return {
    summaries: [...data],
    /* --- Size --- */
    size: [chipHeatmapHeight, chipHeatmapHeight],
    margin: { left: 60, bottom: 90, right: 10, top: 40 },

    /* --- Layout --- */
    summaryType: {
      type: "heatmap",
      binValue: d => (d[0] ? d[0].totalMappedReads : []),
      xCellPx: 10,
      yCellPx: 10
    },

    /* --- Process --- */
    xAccessor: "columnIndex",
    yAccessor: "rowIndex",
    yExtent: [72, 0],
    xExtent: [0, 72],

    /* --- Customize --- */
    summaryStyle: function(e) {
      return {
        fill: thresholds(e.percent),
        stroke: "#ccc",
        strokeWidth: 0.8
      };
    },

    tooltipContent: d => {
      return (
        <div className="tooltip-content">
          <p>Cell: {d.cellId}</p>
          <p>Column: {d.columnIndex}</p>
          <p>Row: {d.rowIndex}</p>
          <p>Total Mapped Reads {d.totalMappedReads}</p>
        </div>
      );
    },
    axes: [{ orient: "left", label: "" }, { orient: "bottom", label: "" }],

    /* --- Draw --- */
    hoverAnnotation: true,
    showLinePoints: false,
    showSummaryPoints: false
  };
};

const Chip = ({ data }) => {
  const colourScale = scaleLinear([0, data.stats.max]).range([
    "#fdfdfd",
    maxColour
  ]);
  const frameProps = frameProp(data.squares, colourScale);
  return <XYFrame {...frameProps} />;
};

export default withStyles(styles)(ChipHeatmap);
