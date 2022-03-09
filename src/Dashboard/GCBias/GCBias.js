import React, { useEffect, useState, useRef, useCallback } from "react";
import * as d3 from "d3";

import { gql, useQuery } from "@apollo/client";

import Grid from "@mui/material/Grid";

import { useStatisticsState } from "../DashboardState/statsState";

import { initContext, getSelection, isSelectionAllowed } from "../utils.js";

const selfType = "gcBias";

const GCBIAS_QUERY = gql`
  query gcBias(
    $analysis: String!
    $quality: String!
    $selectedCells: [Int!]
    $gcBiasIsGrouped: Boolean!
  ) {
    gcBias(
      analysis: $analysis
      quality: $quality
      selectedCells: $selectedCells
      isGrouped: $gcBiasIsGrouped
    ) {
      experimentalCondition
      cellOrder
      gcCells {
        gcPercent
        highCi
        lowCi
        median
      }
      stats {
        yMin
        yMax
        xMax
        xMin
      }
    }
  }
`;

const GCBias = ({ analysis }) => {
  const [
    {
      gcBiasIsGrouped,
      quality,
      selectedCells,
      selectedCellsDispatchFrom,
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
  const { loading, error, data } = useQuery(GCBIAS_QUERY, {
    variables: {
      analysis,
      quality,
      selectedCells: selection,
      gcBiasIsGrouped
    }
  });
  if (error) return null;
  if (loading) {
    return null;
  }
  const { gcBias } = data;

  return (
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="flex-start"
      key="gcBias"
    >
      <Grid item key="gcBiasWrapper">
        <Plot
          data={gcBias}
          selectionAllowed={isSelectionAllowed(
            selfType,
            selectedCellsDispatchFrom,
            subsetSelection,
            selectedCells,
            axisChange
          )}
          key="plot"
        />
      </Grid>
    </Grid>
  );
};
const margin = { left: 50, bottom: 50, right: 80, top: 50 };
const plotHeight = 500;
const plotWidth = 700;
const gcBiasDim = {
  x1: margin.left,
  y1: margin.top,
  x2: margin.left + plotWidth,
  y2: margin.top + plotHeight,
  width: margin.left + plotWidth + margin.right,
  height: margin.top + plotHeight + margin.bottom
};
const Plot = ({ data, selectionAllowed }) => {
  const [
    { gcBiasAxis, selectedCells, axisChange },
    dispatch
  ] = useStatisticsState();

  const [context, saveContext] = useState();

  const [ref] = useHookWithRefCallback();

  const highestMax = Math.max(
    ...data.map(category => category["stats"]["yMax"])
  );

  var medianLine = d3
    .area()
    .curve(d3.curveMonotoneX)
    .x(function(d) {
      return x(d.gcPercent);
    })
    .y(function(d) {
      return y(d.median);
    });

  var lineLow = d3
    .area()
    .curve(d3.curveMonotoneX)
    .x(function(d) {
      return x(d.gcPercent);
    })
    .y(function(d) {
      return y(d.lowCi);
    });

  var lineHigh = d3
    .area()
    .curve(d3.curveMonotoneX)
    .x(function(d) {
      return x(d.gcPercent);
    })
    .y(function(d) {
      return y(d.highCi);
    });

  var area = d3
    .area()
    .x(function(d) {
      return x(d.gcPercent);
    })
    .y0(function(d) {
      return y(d.lowCi);
    })
    .y1(function(d) {
      return y(d.highCi);
    });

  var x = d3
    .scaleLinear()
    .domain([0, 100])
    .range([gcBiasDim.x1, gcBiasDim.x2])
    .nice();

  var y = d3
    .scaleLinear()
    .domain([0, highestMax])
    .range([gcBiasDim.y2, gcBiasDim.y1])
    .nice();

  var colors = d3
    .scaleOrdinal()
    .domain([...data.map(category => category["experimentalCondition"])])
    .range([
      "#4ecdc4",
      "#f64747",
      "#1f78b4",
      "#fad859",
      "#736598",
      "#019875",
      "#013243",
      "#e87e04",
      "#f2784b"
    ]);

  useEffect(() => {
    if (selectedCells.length === 0 && context) {
      context.clearRect(0, 0, gcBiasDim.width, gcBiasDim.height);

      var svg = d3.select("#gcBiasSelection");
      svg.selectAll("g").remove("*");

      setSvgPaths(svg);
      const paths = getSvgPaths(svg);

      drawPaths(context, paths);
      canvasClipping(context);

      drawAxis(context, x, y);
      drawAxisLabels(context, x, y, gcBiasAxis);
      drawLegend(context, data, svg, paths);
    }
  }, [selectedCells]);

  useEffect(() => {
    if (data && context) {
      context.clearRect(0, 0, gcBiasDim.width, gcBiasDim.height);

      var svg = d3.select("#gcBiasSelection");
      svg.selectAll("g").remove("*");

      setSvgPaths(svg);
      const paths = getSvgPaths(svg);

      drawPaths(context, paths);
      canvasClipping(context);

      drawAxis(context, x, y);
      drawAxisLabels(context, x, y, gcBiasAxis);
      drawLegend(context, data, svg, paths);
    }
  }, [data]);

  function useHookWithRefCallback() {
    const ref = useRef(null);
    const setRef = useCallback(node => {
      if (node) {
        const gcBias = d3.select("#gcBias");

        const canvas = gcBias
          .select("canvas")
          .attr("width", gcBiasDim.width)
          .attr("height", gcBiasDim.height);

        const context = initContext(canvas, gcBiasDim.width, gcBiasDim.height);
        saveContext(context);

        var svg = d3.select("#gcBiasSelection");
        setSvgPaths(svg);
        const paths = getSvgPaths(svg);
        drawPaths(context, paths);
        canvasClipping(context);

        drawAxis(context, x, y);
        drawAxisLabels(context, x, y, gcBiasAxis);
        drawLegend(context, data, svg, paths);
      }
    }, []);

    return [setRef];
  }
  const canvasClipping = context => {
    context.clearRect(0, 0, gcBiasDim.width, gcBiasDim.y1);
    context.clearRect(0, gcBiasDim.y2, gcBiasDim.width, margin.bottom);
    context.save();
  };
  const drawLegend = (context, data, svg, canvasPaths) => {
    context.beginPath();
    const rectSize = 10;
    const padding = rectSize / 2;
    var titleHeight = 15;

    context.globalAlpha = 1;
    context.fillStyle = "black";
    context.font = "13px MyFont";

    context.fillText("Experimental", gcBiasDim.x2 + padding, gcBiasDim.y1);
    context.fillText(
      "Condition",
      gcBiasDim.x2 + padding,
      gcBiasDim.y1 + titleHeight
    );
    titleHeight = titleHeight * 2;
    data.map((category, index) => {
      context.globalAlpha = 0.5;
      context.strokeStyle = colors(category["experimentalCondition"]);
      context.fillStyle = colors(category["experimentalCondition"]);
      const yLocation =
        gcBiasDim.y1 + rectSize * index + padding * index + titleHeight;
      const rectXLocation = gcBiasDim.x2 + padding;
      //  context.fillRect(rectXLocation, yLocation, rectSize, rectSize);
      context.fillStyle = "black";
      context.font = "13px MyFont";
      context.globalAlpha = 1;
      context.fillText(
        category["experimentalCondition"],
        rectXLocation + rectSize + padding,
        yLocation + rectSize
      );

      const rect = svg.append("g").append("rect");

      rect
        .attr("x", rectXLocation)
        .attr("y", yLocation)
        .attr("width", rectSize)
        .attr("height", rectSize)
        .attr("opacity", 0.5)
        .attr("fill", colors(category["experimentalCondition"]))
        .on("mousedown", function(d) {
          if (category["experimentalCondition"] !== "All" && selectionAllowed) {
            context.clearRect(
              gcBiasDim.x1,
              gcBiasDim.y1,
              plotWidth,
              plotHeight
            );
            canvasPaths.map(path => {
              fillPaths(
                context,
                path,
                path.category !== category["experimentalCondition"]
              );
            });

            canvasClipping(context);
            drawAxis(context, x, y);
            drawAxisLabels(context, x, y, gcBiasAxis);
            drawLegend(context, data, svg, canvasPaths);

            const selection = data.filter(
              option =>
                option["experimentalCondition"] ===
                category["experimentalCondition"]
            )[0]["cellOrder"];

            if (axisChange["datafilter"]) {
              dispatch({
                type: "BRUSH",
                value: [...selection],
                subsetSelection: [...selection],
                dispatchedFrom: selfType
              });
            } else {
              dispatch({
                type: "BRUSH",
                value: [...selection],
                dispatchedFrom: selfType
              });
            }
          }
        })
        .on("mouseover", function(d) {
          const that = d3.select(this);
          that.attr("opacity", 1);
        })
        .on("mouseout", function(d) {
          const that = d3.select(this);
          that.attr("opacity", 0.5);
        });
    });
  };
  const fillPaths = (context, path, isGrey) => {
    if (isGrey) {
      context.strokeStyle = "#dadfe1";
      context.fillStyle = "#ececec";
    } else {
      context.strokeStyle = colors(path["category"]);
      context.fillStyle = colors(path["category"]);
    }

    context.stroke(path["path"]);
    context.globalAlpha = 0.5;
    context.fill(path["path"]);
    context.restore();
  };
  const drawPaths = (context, paths) => {
    context.beginPath();
    paths.map(path => {
      fillPaths(context, path);
    });
    context.clearRect(0, 0, gcBiasDim.width, gcBiasDim.y1);
    context.save();
  };
  const getSvgPaths = svg => {
    var pathsList = [];
    svg.selectAll("g").each(function(d) {
      const that = d3.select(this);
      that.selectAll("path").each(function(d) {
        const thatPath = d3.select(this);
        const dAttr = thatPath.attr("d");

        pathsList = [
          ...pathsList,
          { path: new Path2D(dAttr), category: that.attr("category") }
        ];
      });
    });
    return pathsList;
  };
  const setSvgPaths = svg => {
    svg = svg
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("display", "none")
      .attr(
        "id",
        (d, index) => "gcbias-" + data[index]["experimentalCondition"]
      )
      .attr("category", (d, index) => data[index]["experimentalCondition"]);

    svg
      .append("path")
      .datum(function(d) {
        return d.gcCells;
      })
      .attr("class", "line")
      .style("stroke", (d, index) =>
        colors(data[index]["experimentalCondition"])
      )
      .attr("d", medianLine);
    svg
      .append("path")
      .datum(function(d) {
        return d.gcCells;
      })
      .attr("class", "line")
      .style("stroke", (d, index) =>
        colors(data[index]["experimentalCondition"])
      )
      .attr("d", lineLow);

    svg
      .append("path")
      .datum(function(d) {
        return d.gcCells;
      })
      .attr("class", "line")
      .style("stroke", (d, index) =>
        colors(data[index]["experimentalCondition"])
      )
      .attr("d", lineHigh);

    svg
      .append("path")
      .datum(function(d) {
        return d.gcCells;
      })
      .attr("class", "area")
      .attr("d", area)
      .style("fill", (d, index) => colors(data[index]["experimentalCondition"]))
      .style("opacity", 0.2);
  };
  const drawAxisLabels = (context, x, y, labels) => {
    context.globalAlpha = 1;
    context.save();
    context.translate(gcBiasDim.x1 / 3, plotHeight / 2);
    context.rotate(-Math.PI / 2);

    context.fillText(labels.y.label, 0, 0);

    context.restore();
    context.fillText(
      labels.x.label,
      plotWidth / 2,
      gcBiasDim.y2 + margin.bottom
    );
    context.stroke();
    context.save();
  };

  const drawAxis = (context, x, y) => {
    context.globalAlpha = 1;
    context.fillStyle = "black";
    context.strokeStyle = "black";
    const fontDim = 20;
    x.ticks(15).forEach(function(d) {
      context.fillStyle = "#000000";
      context.fillText(d, x(d), gcBiasDim.y2 + fontDim);
    });

    y.ticks(15).forEach(function(d) {
      context.fillStyle = "#000000";
      context.fillText(d, gcBiasDim.x1 - fontDim, y(d));
    });
    context.fillStyle = "black";
    context.strokeStyle = "black";
    context.beginPath();
    context.moveTo(gcBiasDim.x1, gcBiasDim.y1);
    context.lineTo(gcBiasDim.x1, gcBiasDim.y2);
    context.stroke();

    context.beginPath();
    context.moveTo(gcBiasDim.x1, gcBiasDim.y2);
    context.lineTo(gcBiasDim.x2, gcBiasDim.y2);
    context.stroke();
  };

  return (
    <div
      style={{
        width: gcBiasDim.width,
        height: gcBiasDim.height,
        position: "relative",
        pointerEvents: "all"
      }}
      ref={ref}
    >
      <div
        id="gcBias"
        style={{
          width: gcBiasDim.width,
          height: gcBiasDim.height,
          pointerEvents: "none",
          position: "absolute"
        }}
      >
        <canvas id="gcBiasCanvas" />
      </div>
      <svg
        id="gcBiasSelection"
        style={{
          pointerEvents: "all",
          width: gcBiasDim.width,
          height: gcBiasDim.height,
          position: "unset"
        }}
      />
    </div>
  );
};
export default GCBias;
