import * as d3 from "d3";
import { config } from "../../config/config";
import { color, voronoi, voronoiFormat, centerScale } from "./circles.js";
import { radius } from "./burst.js";
const animationConfig = config.AnimationConfig;

export const getSelectionString = analyses =>
  analyses.reduce((finalSelectionString, dataObj) => {
    finalSelectionString +=
      "." +
      (dataObj.parent
        ? dataObj.parent.replace(/[^\w\s]/gi, "")
        : dataObj.name.replace(/[^\w\s]/gi, "")) +
      "-parent ";
    return finalSelectionString;
  }, "");

export const getCurrentLargestFilter = filters =>
  filters.length === 0
    ? "none"
    : animationConfig.filterHeirarchy[
        Math.max(
          filters.map(filter =>
            animationConfig.filterHeirarchy.indexOf(filter.label)
          )
        )
      ];
export const getAnimationStages = (currLargestFilter, previousLargestFilter) =>
  animationConfig.stages[currLargestFilter].filter(
    startingStageObj =>
      startingStageObj.from.indexOf(previousLargestFilter) !== -1
  )[0].stages;

//D3
export const updateDataNodes = (prevState, packedNodes) => {
  var circles = prevState.mainSvg
    .selectAll("circle")
    .data(packedNodes, function(d) {
      return d.data.name + d.data.parent;
    });
  //exit old data
  circles
    .exit()
    .attr("opacity", 0.2)
    .transition()
    .ease(d3.easeLinear)
    .duration(500)
    .attr("r", 1)
    .remove();

  return circles;
};

export const mergeDataNodes = circles =>
  circles
    .enter()
    .append("circle")
    .attr("class", "circles")
    .attr("class", d => {
      return (
        d.parent.data.name.replace(/[^\w\s]/gi, "") +
        "-parent " +
        d.data.name +
        "-sample"
      );
    })
    .attr("r", d => d.r)
    .merge(circles);
export const animationStageExist = (stages, stage) =>
  stages.indexOf(stage) !== -1;
export const transitionDataNodes = (circles, stages, mainSvg) => {
  mainSvg.select("g").style("filter", "url(#gooey)"); //Set the filter on the container svg

  circles
    .transition(2000)
    .ease(d3.easeBounce)
    .attr("cx", d => {
      return Math.max(d.r, Math.min(window.innerWidth - d.r, d.x));
    })
    .attr("cy", d => d.y)
    .attr("r", d => {
      return stages.indexOf(2) === -1 ? d.r : radius;
    })
    .attr("fill", d => {
      return color(d.parent.data.name);
    })
    .style("stroke", function(d, i) {
      return "black";
    })
    .style("stroke-width", "2px");
};
export const updateSimulation = (
  simulation,
  packedNodes,
  circles,
  prevState,
  stages
) =>
  simulation
    .nodes(packedNodes)
    .force(
      "x",
      d3
        .forceX()
        .strength(0.5)
        .x(d => centerScale(d.data.parent))
    )
    .force(
      "y",
      d3
        .forceY()
        .strength(0.5)
        .y(d => d.y / 10)
    )
    .on(
      "tick",
      function() {
        circles
          .attr("cx", d => {
            return stages.indexOf(2) === -1 ? d.x : window.innerWidth / 4;
          })
          .attr("cy", d => d.y);
        prevState.voronoiSvg
          .selectAll("path")
          .data(voronoi(voronoiFormat(packedNodes, -50)).polygons())
          .enter()
          .append("path")
          .attr("class", "voronoi");

        prevState.voronoiSvg
          .selectAll("path")
          .attr("d", d => (d ? "M" + d.join("L") + "Z" : null))
          .attr("class", d => {
            return d ? d.data.name + "-voronoi" : "";
          })
          //  .style("stroke", "#2074A0")
          .style("fill", "none")
          .style("pointer-events", "all");
      },
      this
    );
export const setBubblesPointerEvents = () => {
  d3.select("#circles").attr("pointer-events", "all");
  d3.select(".bubbles").attr("pointer-events", "all");
};
export const hideSunburst = () => d3.select(".sunburst").attr("opacity", 0);

export const showSunburst = () => d3.select(".sunburst").attr("opacity", 1.0);

export const setSunburstPointerEvents = () => {
  d3.select("#circles").attr("pointer-events", "none");
  d3.select(".bubbles").attr("pointer-events", "none");

  d3.select(".sunburst").attr("pointer-events", "all");
};
