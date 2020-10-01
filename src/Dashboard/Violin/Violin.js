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

const margin = {
  left: 50,
  top: 20,
  bottom: 50,
  right: 10
};
const dimensions = {
  x1: margin.left,
  y1: margin.top,
  x2: 700 - margin.right,
  y2: 350 - margin.bottom,
  height: 350,
  width: 700
};
const selfType = "VIOLIN";

const styles = theme => ({
  legend: {
    marginTop: 40,
    marginRight: 30,
    marginLeft: 15
  }
});
const color = {
  defaultStroke: "#4183d7",
  defaultFill: "#2c82c9",
  black: "#000000",
  green: "#26a65b",
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
    { quality, selectedCellsDispatchFrom, selectedCells, violinAxis }
  ] = useStatisticsState();

  const xAxis = violinAxis.x.type;
  const yAxis = violinAxis.y.type;
  const selection = selectedCellsDispatchFrom === selfType ? [] : selectedCells;

  return (
    <Query
      query={VIOLIN_QUERY}
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
        const { violin } = data;

        return (
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
            key="scatterplot"
          >
            <Grid item key="violinWrapper">
              <Plot
                cells={violin.cells}
                data={violin.data}
                stats={violin.stats}
                selectionAllowed={
                  selectedCellsDispatchFrom === selfType ||
                  selectedCellsDispatchFrom === null ||
                  selectedCellsDispatchFrom === undefined
                }
                key="violinplot"
              />
            </Grid>
          </Grid>
        );
      }}
    </Query>
  );
};

const Plot = ({ data, stats, cells, selectionAllowed }) => {
  const [
    { scatterplotAxis, selectedCells, selectedCellsDispatchFrom, violinAxis },
    dispatch
  ] = useStatisticsState();

  const xAxis = violinAxis.x.label;
  const yAxis = violinAxis.y.label;

  const [context, saveContext] = useState();

  const [violinPaths, setViolinPaths] = useState({});
  const [ref] = useHookWithRefCallback();
  const brush = d3.brush();

  var x = d3
    .scaleBand()
    .range([0, dimensions.width])
    .domain([...data.map(option => option["name"])])
    .padding(0.05);

  var y = d3
    .scaleLinear()
    .domain([stats.max, stats.min])
    .range([dimensions.y1, dimensions.y2])
    .nice();

  const maxNum = Math.max.apply(
    Math,
    _.flatten(data.map(d => d["histogram"])).map(d => d["count"])
  );

  var xNum = d3
    .scaleLinear()
    .range([0, x.bandwidth()])
    .domain([-maxNum, maxNum]);

  useEffect(() => {
    if (context) {
    }
  }, [data]);

  var tooltip = d3Tip()
    .attr("class", "d3-tip n")
    .attr("id", "violionTip");

  function useHookWithRefCallback() {
    const ref = useRef(null);
    const setRef = useCallback(node => {
      if (node) {
        const violin = d3.select("#violin");
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

        drawAxis(context, x, y, data);
        drawAxisLabels(context, x, y);
      }
    }, []);

    return [setRef];
  }
  const drawAxisLabels = (context, x, y) => {
    context.save();
    context.translate(x(x.domain()[0]) - margin.left, dimensions.height / 2);
    context.rotate(-Math.PI / 2);

    context.fillText(yAxis, 0, 0);

    context.restore();
    context.fillText(
      xAxis,
      dimensions.width / 2,
      y(y.domain()[1]) + margin.bottom / 2
    );
    context.stroke();
    context.save();
  };

  const drawAxis = (context, x, y, data) => {
    const tickFormat = d3.format(".3f");

    data.forEach(d => {
      context.fillStyle = color["black"];
      context.fillText(
        d["name"],
        x(d["name"]) + xNum(0),
        dimensions.y2 + margin.top
      );
    });

    y.ticks(15).forEach(function(d) {
      context.fillStyle = color["black"];
      context.fillText(tickFormat(d), dimensions.x1 - margin.left, y(d));
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

    svg = svg
      .selectAll("path")
      .data(data)
      .enter()
      .append("g");

    svg
      .append("path")
      .datum(function(d) {
        return d.histogram;
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
      );
    var violinPaths = {};

    context.translate(margin.left, margin.top);
    context.save();
    console.log(data);
    const percentileObj = getPercentileObject(data);
    console.log(percentileObj);
    svg.each(function(d, index) {
      const that = d3.select(this).select("path");
      const path = that.attr("d");
      const violinPath = new Path2D(path);

      violinPaths[d["name"]] = violinPath;
      drawViolinArea(context, data[index], violinPath);
      drawQLines(context, data[index]["percentiles"]);
    });

    setViolinPaths(violinPaths);
  };
  const getPercentileObject = data =>
    data.reduce(
      (final, curr) =>
        (final[curr["name"]] = curr["percentiles"].reduce(
          (f, c, index) => (f[c] = curr["percentiles"][index]),
          {}
        )),
      {}
    );

  const setDefaultStyles = context => {
    context.strokeStyle = color["defaultStroke"];
    context.fillStyle = color["defaultFill"];
  };
  const drawQLines = (context, data) => {
    //q1
    context.beginPath();
    context.strokeStyle = color["green"];
    console.log(data);
    console.log(xNum.range()[0]);
    context.moveTo(xNum.range()[0], y(data["25.0"]));
    context.lineTo(xNum.range()[1], y(data["25.0"]));
    context.stroke();
  };
  const drawViolinArea = (context, data, path) => {
    context.save();
    context.beginPath();
    context.translate(x(data.name) + margin.left, -margin.top);

    setDefaultStyles(context);

    context.stroke(path);
    context.fill(path);
    context.restore();
  };
  return (
    <div
      style={{
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
          width: dimensions["width"],
          height: dimensions["height"],
          position: "relative"
        }}
      />
    </div>
  );
};
export default withStyles(styles)(Violin);
