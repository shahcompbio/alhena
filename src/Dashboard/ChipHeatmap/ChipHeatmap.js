import React, { useRef, useEffect, useCallback, useState } from "react";

import * as d3 from "d3";
import { brush } from "d3";

import XYFrame from "semiotic/lib/XYFrame";
import Legend from "./Legend.js";

import { withStyles } from "@material-ui/core/styles";

import { Query } from "react-apollo";
import gql from "graphql-tag";

import _ from "lodash";

import Grid from "@material-ui/core/Grid";

import { useStatisticsState } from "../DashboardState/statsState";
import { scaleLinear } from "d3-scale";

const chipHeatmapDimension = 700;
const maxColour = "#d91e18";
const margin = {
  left: 60,
  top: 40,
  bottom: 90,
  right: 10
};

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
        heatmapOrder
        totalMappedReads
      }
      stats {
        max
      }
    }
  }
`;

const ChipHeatmap = ({ analysis, classes }) => {
  const [{ quality }, dispatch] = useStatisticsState();

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

const frameProp = (data, thresholds, highlightedCells) => {
  return {
    summaries: [...data],
    /* --- Size --- */
    size: [chipHeatmapDimension, chipHeatmapDimension],
    margin: {
      left: margin.left,
      bottom: margin.bottom,
      right: margin.right,
      top: margin.top
    },

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
    summaryStyle: function(e, index) {
      var fillColour, stroke;
      if (highlightedCells) {
        if (e.percent !== 0) {
          fillColour = thresholds(e.percent);
          if (highlightedCells.hasOwnProperty(e.binItems[0].heatmapOrder)) {
            stroke = "blue";
          } else {
            stroke = "#e6e6e6";
          }
        } else {
          stroke = "#e6e6e6";
          fillColour = "#f3f3f3";
        }
      } else {
        stroke = "#ccc";
        fillColour = thresholds(e.percent);
      }

      if (thresholds(e.percent) === 0) {
        if (highlightedCells.length > 0) {
          stroke = "#e6e6e6";
          fillColour = "#f3f3f3";
        } else {
          stroke = "#ccc";
          fillColour = thresholds(e.percent);
        }
      }
      return {
        fill: fillColour,
        stroke: stroke,
        strokeWidth: 0.8
      };
    },

    axes: [{ orient: "left", label: "" }, { orient: "bottom", label: "" }],

    /* --- Draw --- */
    //  hoverAnnotation: true,
    showLinePoints: false,
    showSummaryPoints: false
  };
};
const getHeatmapOrderFromExtent = (extent, data) =>
  data
    .filter(
      entry =>
        entry.columnIndex >= extent[0][0] &&
        entry.columnIndex <= extent[1][0] &&
        entry.rowIndex >= extent[0][1] &&
        entry.rowIndex <= extent[1][1]
    )
    .map(entry => entry.heatmapOrder)
    .filter(entry => entry !== null && entry.heatmapOrder !== null)
    .sort((a, b) => a - b);

const Chip = ({ data }) => {
  const [paintReady, setPaintReady] = useState(false);
  const [{ selectedCells }, dispatch] = useStatisticsState();
  const [extent, setExtent] = useState([[0, 0], [0, 0]]);
  const [extentHighlight, setExtentHighlight] = useState(null);

  const colourScale = scaleLinear([0, data.stats.max]).range([
    "#fdfdfd",
    maxColour
  ]);

  useEffect(() => {
    setExtent([[0, 0], [0, 0]]);

    if (selectedCells.length === 0) {
      setExtentHighlight(null);
    }
  }, [selectedCells]);

  useEffect(() => {
    if (extentHighlight !== null) {
      dispatch({
        type: "BRUSH",
        value: extentHighlight
      });
    }
  }, [extentHighlight]);

  const extentHighlightedObject = extentHighlight
    ? extentHighlight.reduce((final, entry) => {
        final[entry] = "selected";
        return final;
      }, {})
    : null;

  const frameProps = frameProp(
    data.squares,
    colourScale,
    extentHighlightedObject
  );

  return [
    <div
      style={{
        width: chipHeatmapDimension,
        height: chipHeatmapDimension,
        position: "relative"
      }}
    >
      <XYFrame
        {...frameProps}
        interaction={{
          end: e => {
            if (e !== null && !_.isEqual(e, extent)) {
              const highlightedCells = getHeatmapOrderFromExtent(
                e,
                data.squares
              );
              setExtent([...e]);
              setExtentHighlight(highlightedCells);
            }
          },
          brush: "xyBrush",
          extent: extent
        }}
      />
    </div>
  ];
};
export default withStyles(styles)(ChipHeatmap);
