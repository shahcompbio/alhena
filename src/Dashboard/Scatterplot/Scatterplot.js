import React, { useEffect, useState, useRef, useCallback } from "react";
import * as d3 from "d3";

import { withStyles } from "@material-ui/core/styles";

import { Query } from "react-apollo";
import gql from "graphql-tag";

import _ from "lodash";

import Grid from "@material-ui/core/Grid";

import { useStatisticsState } from "../DashboardState/statsState";
import { scaleLinear } from "d3-scale";
import d3Tip from "d3-tip";

import { initContext } from "../utils.js";

const scatterplotDimension = 550;
const axisTextPadding = 55;
const histogramMaxHeight = 55;

const margin = {
  left: 75,
  top: 37,
  bottom: 90,
  right: 10,
  histogram: 20
};
const scatterplotDim = {
  x1: margin.left,
  y1: margin.top + histogramMaxHeight,
  x2: scatterplotDimension - margin.right,
  y2: scatterplotDimension - margin.bottom
};
const selfType = "SCATTERPLOT";
const styles = theme => ({
  legend: {
    marginTop: 40,
    marginRight: 30,
    marginLeft: 15
  }
});

const SCATTERPLOT_QUERY = gql`
  query scatterplot(
    $analysis: String!
    $quality: String!
    $selectedCells: [Int!]
    $xAxis: String!
    $yAxis: String!
  ) {
    scatterplot(
      analysis: $analysis
      quality: $quality
      selectedCells: $selectedCells
      xAxis: $xAxis
      yAxis: $yAxis
    ) {
      points {
        heatmapOrder
        x
        y
      }
      stats {
        yMax
        yMin
        xMax
        xMin
      }
      histogram {
        xBuckets {
          key
          count
        }
        yBuckets {
          key
          count
        }
      }
    }
  }
`;

const Scatterplot = ({ analysis, classes }) => {
  const [
    { quality, selectedCellsDispatchFrom, selectedCells, scatterplotAxis }
  ] = useStatisticsState();

  const xAxis = scatterplotAxis.x.type;
  const yAxis = scatterplotAxis.y.type;
  const selection = selectedCellsDispatchFrom === selfType ? [] : selectedCells;

  return (
    <Query
      query={SCATTERPLOT_QUERY}
      variables={{
        analysis,
        quality,
        selectedCells: selection,
        xAxis,
        yAxis
      }}
    >
      {({ loading, error, data }) => {
        if (error) return null;
        if (loading && Object.keys(data).length === 0) {
          return null;
        }
        const { scatterplot } = data;

        return (
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            key="scatterplot"
          >
            <Grid item key="scatterplotWrapper">
              <Plot
                data={scatterplot.points}
                stats={scatterplot.stats}
                histogram={scatterplot.histogram}
                selectionAllowed={
                  selectedCellsDispatchFrom === selfType ||
                  selectedCellsDispatchFrom === null ||
                  selectedCellsDispatchFrom === undefined
                }
                key="plot"
              />
            </Grid>
          </Grid>
        );
      }}
    </Query>
  );
};

const Plot = ({ data, stats, histogram, selectionAllowed }) => {
  const [
    { scatterplotAxis, selectedCells, selectedCellsDispatchFrom },
    dispatch
  ] = useStatisticsState();
  const [savedBrush, saveBrush] = useState();
  const [context, saveContext] = useState();
  const [highlightedCells, setHighlightCells] = useState(null);
  const [extentHighlight, setExtentHighlight] = useState(null);
  const [ref] = useHookWithRefCallback();
  const brush = d3.brush();

  var x = d3
    .scaleLinear()
    .domain([stats.xMin, stats.xMax])
    .range([scatterplotDim.x1, scatterplotDim.x2])
    .nice();

  var y = d3
    .scaleLinear()
    .domain([stats.yMax, stats.yMin])
    .range([scatterplotDim.y1, scatterplotDim.y2])
    .nice();

  useEffect(() => {
    if (savedBrush) {
      if (!selectionAllowed) {
        savedBrush.select("*").attr("display", "none");
      } else {
        savedBrush.select("*").attr("display", "all");
      }
    }
  }, [selectionAllowed]);

  useEffect(() => {
    if (selectedCells.length === 0 && highlightedCells !== null) {
      setHighlightCells(null);
      setExtentHighlight(null);
      savedBrush.call(brush.move, null);
      context.clearRect(
        0,
        0,
        scatterplotDimension + histogramMaxHeight + margin.histogram,
        scatterplotDimension + histogramMaxHeight + margin.histogram
      );

      drawPoints(context, data);
      drawAxis(context, x, y);
      drawAxisLabels(context, x, y, stats, scatterplotAxis);

      drawHistogram(context, histogram, stats, x, y);
    }
  }, [selectedCells]);

  useEffect(() => {
    if (extentHighlight !== null && selectionAllowed) {
      const cordinateExtent = extentHighlight.map(boundry => {
        return [x.invert(boundry[0]), y.invert(boundry[1])];
      });
      const highlighted = getHeatmapOrderFromExtent(cordinateExtent, data);

      const highlightedCellsObject = createHighlightedObjectFromArray(
        highlighted
      );
      drawPoints(context, data, highlightedCellsObject);
      saveContext(context);
      dispatch({
        type: "BRUSH",
        value: highlighted,
        dispatchedFrom: selfType
      });
    }
  }, [extentHighlight]);

  useEffect(() => {
    if (context && highlightedCells) {
      var cordinateExtent = highlightedCells.map(boundry => {
        return [x.invert(boundry[0]), y.invert(boundry[1])];
      });
      const highlighted = getHeatmapOrderFromExtent(cordinateExtent, data);

      const highlightedCellsObject = createHighlightedObjectFromArray(
        highlighted
      );
      drawPoints(context, data, highlightedCellsObject);
      saveContext(context);
    }
  }, [highlightedCells]);

  useEffect(() => {
    if (context) {
      setHighlightCells(null);
      setExtentHighlight(null);
      context.clearRect(
        0,
        0,
        scatterplotDimension + histogramMaxHeight + margin.histogram,
        scatterplotDimension + histogramMaxHeight + margin.histogram
      );
      saveContext(context);
      drawPoints(context, data);
      drawAxis(context, x, y);
      drawAxisLabels(context, x, y, stats, scatterplotAxis);

      drawHistogram(context, histogram, stats, x, y);
    }
  }, [data]);

  var tooltip = d3Tip()
    .attr("class", "d3-tip n")
    .attr("id", "scatterTip");

  function useHookWithRefCallback() {
    const ref = useRef(null);
    const setRef = useCallback(node => {
      if (node) {
        const chip = d3.select("#scatterplot");
        const canvas = chip
          .select("canvas")
          .attr(
            "width",
            scatterplotDimension + histogramMaxHeight + margin.histogram
          )
          .attr("height", scatterplotDimension)
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );

        const context = initContext(
          canvas,
          scatterplotDimension + histogramMaxHeight + margin.histogram,
          scatterplotDimension
        );
        saveContext(context);

        drawPoints(context, data);
        drawAxis(context, x, y);
        drawAxisLabels(context, x, y, stats, scatterplotAxis);

        drawHistogram(context, histogram, stats, x, y);

        brush
          .extent([
            [scatterplotDim.x1, scatterplotDim.y1],
            [scatterplotDim.x2, scatterplotDim.y2]
          ])
          .on("brush", brushing)
          .on("end", brushended);

        const scatterSelection = d3.select("#scatterSelection");

        scatterSelection.call(tooltip);

        const gBrush = scatterSelection
          .append("g")
          .attr("class", "brush")
          .call(brush);

        saveBrush(gBrush);

        function brushing() {
          const selection = d3.event.selection;
          if (!d3.event.sourceEvent || !selection) return;
          setHighlightCells([...selection]);
        }
        function brushended() {
          const selection = d3.event.selection;
          if (!d3.event.sourceEvent || !selection) return;

          setExtentHighlight([...selection]);

          d3.select(this)
            .transition()
            .call(brush.move, [...selection]);
        }
      }
    }, []);

    return [setRef];
  }
  const drawAxisLabels = (context, x, y, stats, labels) => {
    context.save();
    context.translate(
      x(x.domain()[0]) - axisTextPadding,
      scatterplotDimension / 2
    );
    context.rotate(-Math.PI / 2);

    context.fillText(labels.y.label, 0, 0);

    context.restore();
    context.fillText(
      labels.x.label,
      scatterplotDimension / 2,
      y(y.domain()[1]) + axisTextPadding
    );
    context.stroke();
    context.save();
  };

  const drawAxis = (context, x, y) => {
    const tickFormat = d3.format(".2s");

    x.ticks(15).forEach(function(d) {
      context.fillStyle = "#000000";
      context.fillText(
        d > 1000 ? tickFormat(d) : d,
        x(d),
        scatterplotDim.y2 + margin.histogram
      );
    });

    y.ticks(15).forEach(function(d) {
      context.fillStyle = "#000000";
      context.fillText(
        d > 1000 ? tickFormat(d) : d,
        scatterplotDim.x1 - 30,
        y(d)
      );
    });
    context.beginPath();
    context.moveTo(scatterplotDim.x1, scatterplotDim.y1);
    context.lineTo(scatterplotDim.x1, scatterplotDim.y2);
    context.stroke();

    context.beginPath();
    context.moveTo(scatterplotDim.x1, scatterplotDim.y2);
    context.lineTo(scatterplotDim.x2, scatterplotDim.y2);
    context.stroke();
  };

  const drawPoints = (context, data, highlightedCells) => {
    context.beginPath();

    data.map(point => {
      context.beginPath();
      context.arc(x(point.x), y(point.y), 4, 0, Math.PI * 2, true);
      if (!highlightedCells) {
        context.fillStyle = "#3498db";
      } else if (
        highlightedCells &&
        highlightedCells.hasOwnProperty(point.heatmapOrder)
      ) {
        context.fillStyle = "#3498db";
      } else {
        context.fillStyle = "#d2d7d3";
      }
      context.fill();
      context.stroke();
    });
  };

  const createHighlightedObjectFromArray = highlightedCells =>
    highlightedCells.reduce((final, heatmapOrder) => {
      final[heatmapOrder] = true;
      return final;
    }, {});

  const getHeatmapOrderFromExtent = (extent, data) =>
    data
      .filter(
        point =>
          point.y >= extent[1][1] &&
          point.y <= extent[0][1] &&
          point.x >= extent[0][0] &&
          point.x <= extent[1][0]
      )
      .map(entry => entry.heatmapOrder);

  const drawHistogram = (context, data, stats, x, y) => {
    const barPadding = { width: 5, height: 2, margin: 10 };

    const xBarWidth =
      x(data.xBuckets[1].key) - x(data.xBuckets[0].key) - barPadding.width;
    const xBucketCountMax = _.maxBy(data.xBuckets, "count").count;

    const yBucketCountMax = _.maxBy(data.yBuckets, "count").count;
    const yBarHeight =
      y(data.yBuckets[1].key) - y(data.yBuckets[0].key) - barPadding.height;

    const xBucketHeightScale = d3
      .scaleLinear()
      .domain([xBucketCountMax, 0])
      .range([margin.top, scatterplotDim.y1])
      .nice();

    const yBucketWidthScale = d3
      .scaleLinear()
      .domain([0, yBucketCountMax])
      .range([
        scatterplotDim.y2,
        scatterplotDim.y2 + histogramMaxHeight + barPadding.margin
      ])
      .nice();

    const xBucketZero = xBucketHeightScale(0);
    const yBucketZero = yBucketWidthScale(0);

    data.yBuckets.forEach(bucket => {
      const width = yBucketWidthScale(bucket.count);
      context.beginPath();
      context.fillStyle = "#e8ecf1";
      context.fillRect(
        scatterplotDim.x2 + barPadding.margin,
        y(bucket.key) + barPadding.height,
        width - yBucketZero,
        yBarHeight + barPadding.width
      );
      context.stroke();

      context.fillStyle = "#6c7a89";
      context.rect(
        scatterplotDim.x2 + barPadding.margin,
        y(bucket.key),
        width - yBucketZero,
        yBarHeight + barPadding.width
      );
      context.stroke();
    });

    data.xBuckets.forEach(bucket => {
      const y1 = xBucketHeightScale(bucket.count);
      context.beginPath();
      context.fillStyle = "#e8ecf1";
      context.fillRect(
        x(bucket.key),
        y1 - barPadding.margin,
        xBarWidth,
        xBucketZero - y1
      );
      context.stroke();
      context.fillStyle = "#6c7a89";
      context.rect(
        x(bucket.key),
        y1 - barPadding.margin,
        xBarWidth,
        xBucketZero - y1
      );
      context.stroke();
    });
  };

  return (
    <div
      style={{
        width: scatterplotDimension,
        height: scatterplotDimension,
        position: "relative"
      }}
      ref={ref}
    >
      <div
        id="scatterplot"
        style={{
          width: scatterplotDimension,
          height: scatterplotDimension,
          position: "absolute",
          pointerEvents: "all"
        }}
      >
        <canvas />
      </div>
      <svg
        id="scatterSelection"
        style={{
          width: scatterplotDimension,
          height: scatterplotDimension,
          position: "relative"
        }}
      />
    </div>
  );
};
export default withStyles(styles)(Scatterplot);
