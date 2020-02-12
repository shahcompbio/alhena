import React, { useRef, useEffect, useCallback, useState } from "react";

import * as d3 from "d3";

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

const frameProp = (data, thresholds, extent, setExtent) => {
  return {
    summaries: [...data],
    /* --- Size --- */
    size: [chipHeatmapHeight, chipHeatmapHeight],
    margin: {
      left: margin.left,
      bottom: margin.bottom,
      right: margin.right,
      top: margin.left
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
    summaryStyle: function(e) {
      return {
        fill: thresholds(e.percent),
        stroke: "#ccc",
        strokeWidth: 0.8
      };
    },
    foregroundGraphics: [<svg id="chipheatmapBrush" />],
    /*  tooltipContent: d => {
      return (
        <div className="tooltip-content">
          <p>Cell: {d.cellId}</p>
          <p>Column: {d.columnIndex}</p>
          <p>Row: {d.rowIndex}</p>
          <p>Total Mapped Reads {d.totalMappedReads}</p>
        </div>
      );
    },*/
    axes: [{ orient: "left", label: "" }, { orient: "bottom", label: "" }],

    /* --- Draw --- */
    //  hoverAnnotation: true,
    showLinePoints: false,
    showSummaryPoints: false
  };
};
const round = number => Math.round(number);
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
    .filter(entry => entry !== null)
    .sort((a, b) => a - b);

const Chip = ({ data }) => {
  const [paintReady, setPaintReady] = useState(false);
  const [{ selectedCells }, dispatch] = useStatisticsState();
  const colourScale = scaleLinear([0, data.stats.max]).range([
    "#fdfdfd",
    maxColour
  ]);

  const [extent, setExtent] = useState([[0, 0], [0, 0]]);
  const [extentHighlight, setExtentHighlight] = useState([]);

  function refCallback() {
    const ref = useRef(null);
    const setRef = useCallback(node => {
      if (node) {
        setPaintReady(true);
      }
      ref.current = node;
    }, []);

    return [setRef];
  }

  const [ref] = refCallback();
  useEffect(() => {
    if (paintReady) {
      const brushSvg = d3.select("#chipheatmapBrush");
      console.log(brushSvg);
      var brush = d3
        .brush()
        .extent([[margin.left, margin.top], [700, 700]])
        .on("start brush", brushed)
        .on("end", brushEnd);

      function brushed() {
        console.log("brushing");
        //  console.log(d3.event.selection);
      }
      function brushEnd() {
        const selection = d3.event.selection;
        if (!d3.event.sourceEvent || !selection) return;

        //  setExtent([...selection]);
        //console.log(selection);
        //  brush.move(gBrush, [...selection]);
      }

      //.selectAll(".overlay")
      //  .remove();

      var gBrush = brushSvg.append("g").attr("class", "brush");

      gBrush.call(brush);
      brush.move(gBrush, [[0, 0], [0, 0]]);
    }
  }, [paintReady]);

  useEffect(() => {
    if (extent[1][1] !== 0) {
      const selection = getHeatmapOrderFromExtent(extent, data.squares);
      dispatch({
        type: "BRUSH",
        value: selection
      });
    }
  }, [extent]);

  const frameProps = frameProp(data.squares, colourScale);
  return (
    <div ref={ref}>
      <XYFrame {...frameProps} />
    </div>
  );
};

export default withStyles(styles)(ChipHeatmap);
