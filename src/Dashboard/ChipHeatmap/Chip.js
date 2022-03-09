import React, { useEffect, useState, useRef, useCallback } from "react";
import * as d3 from "d3";

import Legend from "./Legend.js";

import withStyles from '@mui/styles/withStyles';

import { gql, useQuery } from "@apollo/client";

import _ from "lodash";

import Grid from "@mui/material/Grid";

import { initContext, getSelection, isSelectionAllowed } from "../utils.js";
import { useStatisticsState } from "../DashboardState/statsState";

import d3Tip from "d3-tip";

const chipHeatmapDimension = 775;
const maxColour = "#d91e18";
const margin = {
  left: 55,
  top: 37,
  bottom: 90,
  right: 10
};

const styles = theme => ({
  legend: {
    marginTop: 40,
    marginRight: 30,
    marginLeft: 15
  }
});
const selfType = "CHIP";
const CHIP_HEATMAP_QUERY = gql`
  query getChipHeatmap(
    $analysis: String!
    $quality: String!
    $metric: String!
    $selectedCells: [Int!]
  ) {
    chipHeatmap(
      analysis: $analysis
      quality: $quality
      metric: $metric
      selectedCells: $selectedCells
    ) {
      squares {
        columnIndex
        rowIndex
        cellId
        heatmapOrder
        metric
      }
      stats {
        max
      }
    }
  }
`;

const Chip = ({ analysis, classes }) => {
  const [
    {
      quality,
      selectedCells,
      selectedCellsDispatchFrom,
      chipHeatmapAxis,
      subsetSelection,
      axisChange
    }
  ] = useStatisticsState();

  const selection = getSelection(
    axisChange,
    subsetSelection,
    selectedCells,
    selectedCellsDispatchFrom,
    selfType
  );
  const { loading, error, data } = useQuery(CHIP_HEATMAP_QUERY, {
    variables: {
      analysis,
      quality,
      selectedCells: selection,
      metric: chipHeatmapAxis.type
    }
  });

  if (error) return null;
  if (loading) {
    return null;
  }
  const { chipHeatmap } = data;

  return (
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="flex-start"
      key="chipWrapper"
    >
      <Grid item key="chipGrid">
        <ChipHeatmap
          data={chipHeatmap}
          key="chip"
          selectionAllowed={isSelectionAllowed(
            selfType,
            selectedCellsDispatchFrom,
            subsetSelection,
            selectedCells,
            axisChange
          )}
        />
      </Grid>
      <Grid item className={classes.legend} key="legendWrapper">
        <Legend
          legendTitle={chipHeatmapAxis.label}
          max={chipHeatmap.stats.max}
          maxColour={maxColour}
          key="chipLegend"
        />
      </Grid>
    </Grid>
  );
};

const getHeatmapOrderFromExtent = (extent, data) =>
  data
    .filter(
      entry =>
        entry.columnIndex >= extent[0][0] &&
        entry.columnIndex < extent[1][0] &&
        entry.rowIndex >= extent[0][1] &&
        entry.rowIndex < extent[1][1]
    )
    .map(entry => entry.heatmapOrder)
    .filter(entry => entry !== null && entry.heatmapOrder !== null)
    .sort((a, b) => a - b);

const ChipHeatmap = ({ data, selectionAllowed }) => {
  const [{ selectedCells, axisChange }, dispatch] = useStatisticsState();

  const colourScale = d3.scaleLinear(
    [0, data.stats.max],
    ["#fdfdfd", maxColour]
  );

  const [savedBrush, saveBrush] = useState();
  const [context, saveContext] = useState();

  const [allSelectedWells, setAllSelectedWells] = useState();
  const [extentHighlight, setExtentHighlight] = useState(null);

  const [ref] = useHookWithRefCallback();

  useEffect(() => {
    if (!selectionAllowed) {
      d3.select("#chipSelection .brush").attr("display", "none");
    } else if (savedBrush) {
      d3.select("#chipSelection .brush").attr("display", "all");
    }
  }, [selectionAllowed]);

  const heatmapDim = {
    x1: margin.left,
    y1: margin.top,
    x2: chipHeatmapDimension - margin.right,
    y2: chipHeatmapDimension - margin.bottom,
    width: chipHeatmapDimension - margin.left - margin.right,
    height: chipHeatmapDimension - margin.top - margin.bottom
  };

  useEffect(() => {
    if (context) {
      drawBackground(context);
      drawBackgroundLines(context);
      drawWells(data.squares, context, allSelectedWells);
    }
  }, [allSelectedWells]);

  useEffect(() => {
    if (context) {
      tooltip.hide();
      context.clearRect(
        heatmapDim.x1,
        heatmapDim.y1,
        heatmapDim.width,
        heatmapDim.height
      );
      drawBackground(context);
      drawBackgroundLines(context);
      drawWells(data.squares, context, []);
      d3.select("#chipSelection").attr("class", null);
      saveContext(context);
      setExtentHighlight(null);
    }
  }, [data]);

  useEffect(() => {
    if (
      selectedCells.length === 0 &&
      extentHighlight !== null &&
      selectionAllowed
    ) {
      drawBackground(context);
      drawBackgroundLines(context);
      drawWells(data.squares, context, []);
      setExtentHighlight(null);
      d3.select("#chipSelection").attr("class", null);
    }
  }, [selectedCells]);

  useEffect(() => {
    if (extentHighlight !== null && selectionAllowed) {
      drawBackground(context);
      drawBackgroundLines(context);
      drawWells(data.squares, context, extentHighlight);
      if (axisChange["datafilter"]) {
        dispatch({
          type: "BRUSH",
          value: extentHighlight,
          dispatchedFrom: selfType,
          subsetSelection: extentHighlight
        });
      } else {
        dispatch({
          type: "BRUSH",
          value: extentHighlight,
          dispatchedFrom: selfType
        });
      }
    }
  }, [extentHighlight]);

  var x = d3
    .scaleLinear()
    .range([heatmapDim.x1, heatmapDim.x2])
    .domain([1, 73]);

  var y = d3
    .scaleLinear()
    .range([heatmapDim.y1, heatmapDim.y2])
    .domain([1, 73]);

  var tooltip = d3Tip()
    .attr("class", "d3-tip n")
    .attr("id", "chipTip");

  function useHookWithRefCallback() {
    const ref = useRef(null);
    const setRef = useCallback(node => {
      if (node) {
        const chip = d3.select("#chip");
        const canvas = chip
          .select("canvas")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );

        var context = initContext(
          canvas,
          chipHeatmapDimension,
          chipHeatmapDimension
        );
        context.beginPath();
        saveContext(context);

        drawBackground(context);
        drawBackgroundLines(context);

        drawWells(data.squares, context, []);

        x.ticks(15).forEach(function(d) {
          context.fillStyle = "#000000";
          context.fillText(d, x(d), heatmapDim.y2 + 20);
        });
        y.ticks(15).forEach(function(d) {
          context.fillStyle = "#000000";
          context.fillText(d, heatmapDim.x1 - 20, y(d));
        });

        const chipSelection = d3.select("#chipSelection");

        chipSelection.call(tooltip);
        chipSelection
          .on("click", function() {
            var coordinates = d3.mouse(this);
            const highlightedCell = getSingleWellFromCordinates(
              coordinates
            ).map(entry => entry.heatmapOrder);

            if (highlightedCell.length > 0) {
              d3.select("#chipSelection").classed(highlightedCell, true);

              setExtentHighlight([...highlightedCell]);
            }
          })
          .on("mousemove", function() {
            var coordinates = d3.mouse(this);

            const highlightedCell = getSingleWellFromCordinates(coordinates);

            var wellSelection = d3.select(this).attr("class");

            const alreadySelectedWells =
              wellSelection === null
                ? []
                : wellSelection
                    .split(",")
                    .filter(heatmapOrder => heatmapOrder !== "")
                    .map(heatmapOrder => parseInt(heatmapOrder));
            //if somethinig is highlighted
            if (highlightedCell.length > 0) {
              const heatmapOrder = highlightedCell.map(
                entry => entry.heatmapOrder
              );
              //if the highlighted square is in a selection
              if (alreadySelectedWells.indexOf(heatmapOrder) === -1) {
                const allWells = [...alreadySelectedWells, ...heatmapOrder];
                setAllSelectedWells([...allWells]);
              }
              const tooltipDim = d3
                .select("#chipTip")
                .node()
                .getBoundingClientRect();

              d3.select("#chipTip")
                .style("visibility", "visible")
                .style("opacity", 1)
                .style("left", d3.event.pageX - tooltipDim.width / 2 + "px")
                .style("top", d3.event.pageY - tooltipDim.height - 10 + "px")
                .classed("hidden", false)
                .html(function(d) {
                  return (
                    "<strong>ID:</strong> <span style='color:red'>" +
                    highlightedCell[0].cellId +
                    "</span></br>" +
                    "<strong>Row:</strong> <span style='color:red'>" +
                    highlightedCell[0].rowIndex +
                    "</span></br>" +
                    "<strong>Column:</strong> <span style='color:red'>" +
                    highlightedCell[0].columnIndex +
                    "</span>"
                  );
                });
            } else {
              d3.select("#chipTip")
                .style("opacity", 0)
                .classed("hidden", true);
              setAllSelectedWells([...alreadySelectedWells]);
            }
          })
          .on("mouseout", tooltip.hide);

        const brush = d3
          .brush()
          .extent([
            [heatmapDim.x1, heatmapDim.y1],
            [heatmapDim.x2, heatmapDim.y2]
          ])
          .on("end", brushended)
          .on("brush", brushDuring);

        const gBrush = chipSelection
          .append("g")
          .attr("class", "brush")
          .call(brush)
          .selectAll(".selection")
          .remove();

        gBrush.selectAll(".resize").remove();

        saveBrush(gBrush);

        function getSingleWellFromCordinates(coordinates) {
          var extent = [
            Math.floor(x.invert(coordinates[0])),
            Math.floor(y.invert(coordinates[1]))
          ];
          return data.squares.filter(
            entry =>
              entry.columnIndex === extent[0] && entry.rowIndex === extent[1]
          );
        }

        function brushDuring() {
          const selection = d3.event.selection;
          if (!d3.event.sourceEvent || !selection) return;

          d3.select("#chipTip")
            .style("opacity", 0)
            .classed("hidden", true);

          var snapExtent = d3.event.selection.map(boundry => [
            Math.round(x.invert(boundry[0])),
            Math.round(y.invert(boundry[1]))
          ]);

          const highlightedCells = getHeatmapOrderFromExtent(
            snapExtent,
            data.squares
          );
          setAllSelectedWells([...highlightedCells]);
        }

        function brushended() {
          const selection = d3.event.selection;
          if (!d3.event.sourceEvent || !selection) return;

          var snapExtent = d3.event.selection.map(boundry => [
            Math.round(x.invert(boundry[0])),
            Math.round(y.invert(boundry[1]))
          ]);

          const brushExtent = snapExtent.map(boundry => [
            x(boundry[0]),
            y(boundry[1])
          ]);

          const highlightedCells = getHeatmapOrderFromExtent(
            snapExtent,
            data.squares
          );

          d3.select("#chipSelection").classed(highlightedCells + ",", true);

          setExtentHighlight([...highlightedCells]);
          d3.select(this)
            .transition()
            .call(brush.move, [...brushExtent]);
        }
      }
      ref.current = node;
    }, []);

    return [setRef];
  }

  const drawBackgroundLines = context => {
    x.ticks(72).forEach(function(d) {
      context.moveTo(x(d), heatmapDim.y1);
      context.lineTo(x(d), heatmapDim.y2);
      context.moveTo(heatmapDim.x1, y(d));
      context.lineTo(heatmapDim.x2, y(d));
    });
    context.strokeStyle = "#d2d7d3";
    context.stroke();
  };
  const drawBackground = context => {
    context.beginPath();
    context.fillStyle = "#e6e6e6";
    context.fillRect(
      heatmapDim.x1,
      heatmapDim.y1,
      heatmapDim.width,
      heatmapDim.height
    );
    context.stroke();
  };
  const drawWells = (data, context, extent) => {
    context.beginPath();
    data.map(square => {
      if (_.includes(extent, square.heatmapOrder)) {
        // |
        context.moveTo(x(square.columnIndex) + 0, y(square.rowIndex) + 0);
        context.lineTo(x(square.columnIndex) + 0, y(square.rowIndex) + 9);
        // _
        context.moveTo(x(square.columnIndex) + 0, y(square.rowIndex) + 0);
        context.lineTo(x(square.columnIndex) + 9, y(square.rowIndex) + 0);
        // | right
        context.moveTo(x(square.columnIndex) + 9, y(square.rowIndex) + 0);
        context.lineTo(x(square.columnIndex) + 9, y(square.rowIndex) + 9);
        // _ bottom
        context.moveTo(x(square.columnIndex) + 0, y(square.rowIndex) + 9);
        context.lineTo(x(square.columnIndex) + 9, y(square.rowIndex) + 9);

        context.strokeWidth = 0.5;
        context.strokeStyle = "#1f3a93";
        context.stroke();

        context.fillStyle = colourScale(square.metric);
        context.fillRect(
          x(square.columnIndex) + 1,
          y(square.rowIndex) + 1,
          8,
          8
        );
        context.stroke();
      } else {
        context.fillStyle = colourScale(square.metric);
        context.fillRect(
          x(square.columnIndex) + 1,
          y(square.rowIndex) + 1,
          8,
          8
        );
        context.stroke();
      }
    });
  };

  return [
    <div
      width={chipHeatmapDimension}
      height={chipHeatmapDimension}
      style={{
        position: "relative"
      }}
      key="chipRef"
      ref={ref}
    >
      <div
        id="chip"
        key="chipDivWrapper"
        width={chipHeatmapDimension}
        height={chipHeatmapDimension}
        style={{
          position: "absolute",
          pointerEvents: "all"
        }}
      >
        <canvas width={chipHeatmapDimension} height={chipHeatmapDimension} />
      </div>
      <svg
        id="chipSelection"
        style={{
          width: chipHeatmapDimension,
          height: chipHeatmapDimension,
          position: "relative"
        }}
      />
    </div>
  ];
};
export default withStyles(styles)(Chip);
