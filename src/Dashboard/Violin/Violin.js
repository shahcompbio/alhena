import React, { useEffect, useState, useRef, useCallback } from "react";
import * as d3 from "d3";

import withStyles from '@mui/styles/withStyles';

import { gql, useQuery } from "@apollo/client";

import _ from "lodash";

import Grid from "@mui/material/Grid";

import { useStatisticsState } from "../DashboardState/statsState";

import d3Tip from "d3-tip";

import { initContext, getSelection, isSelectionAllowed } from "../utils.js";

const margin = {
  left: 60,
  top: 15,
  bottom: 30,
  right: 10
};

const dimensions = {
  x1: margin.left,
  y1: margin.top,
  x2: 700 + margin.left,
  y2: 300 + margin.top,
  height: 375,
  width: 700,
  padding: 4
};
const selfType = "VIOLIN";

const styles = theme => ({
  root: {}
});
const color = {
  defaultStroke: "black",
  defaultFill: "#4fabf7",
  hoverFill: "#6db9f7",
  hoverStroke: "black",
  grey: "#c7ccd1",
  black: "#000000",
  green: "#2f7d29",
  red: "#96281b"
};

const VIOLIN_QUERY = gql`
  query violin(
    $analysis: String!
    $selectedCells: [Int!]
    $quality: String!
    $xAxis: String!
    $yAxis: String!
  ) {
    violin(
      analysis: $analysis
      selectedCells: $selectedCells
      quality: $quality
      xAxis: $xAxis
      yAxis: $yAxis
    ) {
      stats {
        count
        max
        min
        sum
        avg
      }
      cells {
        order
        category
      }
      data {
        name
        histogram {
          key
          count
        }
        percentiles {
          percentile
          value
        }
        stat {
          count
          max
          min
          sum
          avg
        }
      }
    }
  }
`;

const Violin = ({ analysis, classes }) => {
  const [
    {
      quality,
      selectedCellsDispatchFrom,
      selectedCells,
      violinAxis,
      subsetSelection,
      axisChange
    }
  ] = useStatisticsState();

  const xAxis = violinAxis.x.type;
  const yAxis = violinAxis.y.type;
  const selection = getSelection(
    axisChange,
    subsetSelection,
    selectedCells,
    selectedCellsDispatchFrom,
    selfType
  );

  const { loading, error, data } = useQuery(VIOLIN_QUERY, {
    variables: {
      analysis,
      quality,
      selectedCells: selection,
      xAxis,
      yAxis
    }
  });

  if (error) return null;
  if (loading) {
    return null;
  }

  const { violin } = data;

  return (
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="flex-start"
      key="violin"
    >
      <Grid item key="violinWrapper">
        <Plot
          cells={violin.cells}
          data={violin.data}
          stats={violin.stats}
          selectionAllowed={isSelectionAllowed(
            selfType,
            selectedCellsDispatchFrom,
            subsetSelection,
            selectedCells,
            axisChange
          )}
          key="violinplot"
        />
      </Grid>
    </Grid>
  );
};
const tooltip = d3Tip()
  .attr("class", "d3-tip w")
  .attr("id", "violinTip");

const Plot = ({ data, stats, cells, selectionAllowed }) => {
  const [
    { selectedCells, violinAxis, axisChange },
    dispatch
  ] = useStatisticsState();

  const xAxis = violinAxis.x.label;
  const yAxis = violinAxis.y.label;

  const [context, saveContext] = useState();

  const [violinPaths, setViolinPaths] = useState({});

  const [ref] = useHookWithRefCallback();

  var x = d3
    .scaleBand()
    .range([dimensions.x1, dimensions.width])
    .domain([...data.map(option => option["name"])])
    .padding(0.05);

  const isCountInsignificant = data.reduce((final, cur) => {
    if (
      cur["stat"]["min"] > parseFloat(cur["histogram"]["0"]["key"]) ||
      final
    ) {
      return true;
    } else {
      return false;
    }
  }, false);

  var y =
    isCountInsignificant < 10
      ? d3
          .scaleLinear()
          .domain([
            parseFloat(data[0]["histogram"][9]["key"]) > stats.max
              ? parseFloat(data[0]["histogram"][9]["key"])
              : stats.max,
            parseFloat(data[0]["histogram"][0]["key"])
          ])
          .range([dimensions.y1, dimensions.y2])
          .nice()
      : d3
          .scaleLinear()
          .domain([stats.max, stats.min])
          .range([dimensions.y1, dimensions.y2])
          .nice();

  const maxNum = Math.max.apply(
    Math,
    _.flatten(data.map(d => d["histogram"])).map(d => d["count"])
  );

  useEffect(() => {
    if (selectedCells.length === 0 && context) {
      const percentileObj = getPercentileObject(data);
      d3.select("#violin").attr("category", null);
      context.clearRect(0, 0, dimensions.width, dimensions.height);
      Object.keys(violinPaths).forEach(name => {
        //grapql cache error
        if (percentileObj[name]) {
          drawViolinArea(context, name, violinPaths[name]);
          drawQLines(context, percentileObj[name], name);
        }
      });
      drawAxis(context, x, y, xNum, data);
      drawAxisLabels(context, x, y);
    }
  }, [selectedCells]);

  var xNum = d3
    .scaleLinear()
    .range([0, x.bandwidth()])
    .domain([-maxNum, maxNum]);

  useEffect(() => {
    if (context && data) {
      context.clearRect(0, 0, dimensions.width, dimensions.height);
      setViolinPaths({});
      drawViolin(context, data);
      drawAxis(context, x, y, xNum, data);
      drawAxisLabels(context, x, y);
    }
  }, [data]);

  function useHookWithRefCallback() {
    const ref = useRef(null);
    const setRef = useCallback(node => {
      if (node) {
        const violin = d3.select("#violin");

        d3.select("#violinSelection").call(tooltip);

        const canvas = violin
          .select("canvas")
          .attr("width", dimensions["width"])
          .attr("height", dimensions["height"]);

        const context = initContext(
          canvas,
          dimensions["width"],
          dimensions["height"]
        );
        saveContext(context);

        drawViolin(context, data);

        drawAxis(context, x, y, xNum, data);
        drawAxisLabels(context, x, y);
      }
    }, []);

    return [setRef];
  }
  const drawAxisLabels = (context, x, y) => {
    context.save();
    context.translate(10, dimensions.height / 2);
    context.rotate(-Math.PI / 2);

    context.fillText(yAxis, 0, 0);

    context.restore();
    context.fillText(
      xAxis,
      dimensions.width / 2,
      dimensions.y2 + margin.bottom
    );
    context.stroke();
    context.restore();
  };

  const drawAxis = (context, x, y, xNum, data) => {
    const decimalFormat = d3.format(".3f");
    const intFormat = d3.format("0.5~s");
    const isDecimal = d => parseFloat(d) < 1 && parseFloat(d) > 0;
    data.forEach(d => {
      context.fillStyle = color["black"];
      context.fillText(
        d["name"],
        x(d["name"]) + xNum(0) - dimensions.padding,
        dimensions.y2 + margin.top + dimensions.padding
      );
    });

    y.ticks(10).forEach(function(d) {
      context.fillStyle = color["black"];
      context.fillText(
        isDecimal(d) ? decimalFormat(d) : intFormat(parseInt(d)),
        dimensions.x1 - margin.left / 2 - dimensions.padding,
        y(d)
      );
    });
    context.strokeStyle = color["black"];
    context.beginPath();
    context.moveTo(dimensions.x1, dimensions.y1);
    context.lineTo(dimensions.x1, dimensions.y2);
    context.stroke();

    context.beginPath();
    context.moveTo(dimensions.x1, dimensions.y2);
    context.lineTo(dimensions.x2, dimensions.y2);
    context.stroke();
  };

  const drawViolin = (context, data) => {
    var svg = d3.select("#violinSelection");
    svg.selectAll("*").remove();

    svg = svg
      .selectAll("path")
      .data(data)
      .enter()
      .append("g")
      .attr("id", (d, index) => "violinCategory-" + data[index]["name"]);

    const percentileObj = getPercentileObject(data);
    svg
      .append("path")
      .datum(function(d) {
        return d.histogram;
      })
      .attr("transform", (d, index) => {
        return "translate(" + +x(data[index]["name"]) + "," + 0 + ")";
      })
      .style("stroke", "none")
      .style("fill", "none")
      .attr(
        "d",
        d3
          .area()
          .x0(function(d) {
            return xNum(-d.count);
          })
          .x1(function(d) {
            return xNum(d.count);
          })
          .y(function(d) {
            return y(d.key);
          })
          .curve(d3.curveCatmullRom)
      )
      .on("mousemove", function(d) {
        const selectedCategory = d3.select("#violin").attr("category");
        if (selectedCategory) {
          showTooltip(percentileObj[d["name"]], d["name"]);
        } else {
          context.clearRect(0, 0, dimensions.width, dimensions.height);
          drawAxis(context, x, y, xNum, data);
          drawAxisLabels(context, x, y);
          Object.keys(percentileObj).forEach(name => {
            if (name === d["name"]) {
              showTooltip(percentileObj[name], name);
              drawViolinArea(context, name, violinPathObjects[name], {
                isHover: true
              });
            } else {
              drawViolinArea(context, name, violinPathObjects[name]);
            }
            drawQLines(context, percentileObj[name], name);
          });
        }
      })
      .on("mouseout", function(d) {
        const selectedCategory = d3.select("#violin").attr("category");
        tooltip.hide();
        context.clearRect(0, 0, dimensions.width, dimensions.height);
        drawAxis(context, x, y, xNum, data);
        drawAxisLabels(context, x, y);
        Object.keys(percentileObj).forEach(name => {
          !selectedCategory || selectedCategory === name
            ? drawViolinArea(context, name, violinPathObjects[name])
            : drawViolinArea(context, name, violinPathObjects[name], {
                isGrey: true
              });
          !selectedCategory || selectedCategory === name
            ? drawQLines(context, percentileObj[name], name)
            : drawQLines(context, percentileObj[name], name, { isGrey: true });
        });
      })
      .on("mousedown", function(d) {
        if (!d3.select("#violin").attr("category") && selectionAllowed) {
          context.clearRect(0, 0, dimensions.width, dimensions.height);

          drawAxis(context, x, y, xNum, data);
          drawAxisLabels(context, x, y);
          Object.keys(percentileObj).map(name => {
            if (d["name"] === name) {
              d3.select("#violin").attr("category", name);
              drawViolinArea(context, name, violinPathObjects[name]);
              drawQLines(context, percentileObj[name], name);
            } else {
              drawViolinArea(context, name, violinPathObjects[name], {
                isGrey: true
              });
              drawQLines(context, percentileObj[name], name, {
                isGrey: true
              });
            }
          });
          const selection = cells
            .filter(cell => cell.category === d["name"])
            .map(cell => cell["order"]);

          if (axisChange["datafilter"]) {
            dispatch({
              type: "BRUSH",
              value: [...selection],
              dispatchedFrom: selfType,
              subsetSelection: [...selection]
            });
          } else {
            dispatch({
              type: "BRUSH",
              value: [...selection],
              dispatchedFrom: selfType
            });
          }
        }
      });

    var violinPathObjects = {};

    svg.each(function(d, index) {
      const that = d3.select(this).select("path");
      const path = that.attr("d");
      const violinPath = new Path2D(path);

      violinPathObjects[d["name"]] = violinPath;
      drawViolinArea(context, d["name"], violinPath);
      drawQLines(context, percentileObj[d["name"]], d["name"]);
    });

    setViolinPaths(violinPathObjects);
  };
  const showTooltip = (data, name) => {
    const format = d3.format(".3f");

    const dim = d3
      .select("#violinCategory-" + name)
      .node()
      .getBoundingClientRect();

    d3.select("#violinTip")
      .style("visibility", "visible")
      .style("opacity", 1)
      .style("left", dim.x + dim.width + "px")
      .style("top", dim.y + dim.height / 2 + window.scrollY + "px")
      .classed("hidden", false)
      .html(function(d) {
        return (
          "<strong>Max: </strong>" +
          format(data["99.0"]) +
          "</span></br>" +
          "<strong>Q3: </strong>" +
          "</span>" +
          format(data["75.0"]) +
          "</br><strong>Median: </strong>" +
          format(data["50.0"]) +
          "</br><strong>Q1: </strong>" +
          format(data["25.0"]) +
          "</span>"
        );
      });
  };
  const getPercentileObject = data =>
    data.reduce((final, curr) => {
      final[curr["name"]] = curr["percentiles"].reduce((f, c, index) => {
        f[c["percentile"]] = c["value"];
        return f;
      }, {});
      return final;
    }, {});

  const setDefaultStyles = context => {
    context.strokeStyle = color["defaultStroke"];
    context.fillStyle = color["defaultFill"];
  };
  const setHoverStyles = context => {
    context.strokeStyle = color["hoverStroke"];
    context.fillStyle = color["hoverFill"];
  };
  const setGreyedOutStyles = context => {
    context.strokeStyle = color["grey"];
    context.fillStyle = color["grey"];
  };
  const drawQLines = (context, data, categoryName, isGrey) => {
    //q1
    context.restore();
    context.beginPath();
    context.strokeStyle = isGrey ? color["grey"] : color["red"];

    const xShift = x(categoryName);

    context.moveTo(xNum.range()[0] + xShift, y(data["25.0"]));
    context.lineTo(xNum.range()[1] + xShift, y(data["25.0"]));
    context.stroke();

    //q3
    context.beginPath();
    context.moveTo(xNum.range()[0] + xShift, y(data["75.0"]));
    context.lineTo(xNum.range()[1] + xShift, y(data["75.0"]));
    context.stroke();

    //q2
    context.beginPath();
    context.strokeStyle = isGrey ? color["grey"] : color["green"];
    context.moveTo(xNum.range()[0] + xShift, y(data["50.0"]));
    context.lineTo(xNum.range()[1] + xShift, y(data["50.0"]));
    context.stroke();
  };
  const drawViolinArea = (context, name, path, style) => {
    context.save();
    context.beginPath();
    context.translate(x(name), 0);

    style
      ? style.isHover
        ? setHoverStyles(context)
        : setGreyedOutStyles(context)
      : setDefaultStyles(context);

    context.stroke(path);
    context.fill(path);
    context.restore();
  };
  return (
    <div
      id="violinWrapper"
      style={{
        pointerEvents: "all",
        width: dimensions["width"],
        height: dimensions["height"],
        position: "relative"
      }}
      ref={ref}
    >
      <div
        id="violin"
        style={{
          width: dimensions["width"],
          height: dimensions["height"],
          position: "absolute",
          pointerEvents: "all"
        }}
      >
        <canvas />
      </div>
      <svg
        id="violinSelection"
        style={{
          pointerEvents: "all",
          width: dimensions["width"],
          height: dimensions["height"],
          position: "relative"
        }}
      />
    </div>
  );
};
export default withStyles(styles)(Violin);
