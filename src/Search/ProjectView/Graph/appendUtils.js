import { config } from "../../../config/config";
import * as d3 from "d3";
import d3Tip from "d3-tip";
import { originalRadius } from "./utils.js";

export const smallDotRadius = 30;
export const largeDotRadius = 45;

const displayConfig = config.DisplayConfig;

export const createRoot = cluster =>
  d3
    .cluster()
    .separation(function(a, b) {
      return (a.parent === b.parent ? 2 : 1) / a.depth;
    })
    .size([2 * Math.PI, displayConfig.rootSize])(cluster);

export const appendPanelTextAfterFilter = (filters, nodes, mainSvg) => {
  const hierarchyToDepth = {
    project: 0,
    sample_id: 1,
    library_id: 2,
    jira_id: 3
  };
  const lowestFilterTypeToGraphDepth = Math.max.apply(
    Math,
    filters.map(filter => hierarchyToDepth[filter.label]).map(level => level)
  );

  const filterSelectionToGraphNode = nodes.filter(
    node => node.depth === lowestFilterTypeToGraphDepth
  )[0];
  appendPanelText(filterSelectionToGraphNode, mainSvg);
};

export const appendPanelText = (nodeData, mainSvg) => {
  mainSvg
    .selectAll(".legendCircles circle")
    .classed("greyedNodes", false)
    .classed("hidePanel", false);

  mainSvg.selectAll(".diagramLines").classed("hidePanel", false);

  const level1 = mainSvg.select(".level1Label");
  const level2 = mainSvg.select(".level2Label");
  const level3 = mainSvg.select(".level3Label");

  const depthOfDetail = nodeData.depth - 1;
  mainSvg.selectAll(".outterLegendCircle" + depthOfDetail).attr("r", 80);
  mainSvg.selectAll(".legendCircle" + depthOfDetail).attr("r", 60);

  if (depthOfDetail === 2) {
    level1.text(nodeData.data.source);
    level2.text(nodeData.data.source);
    level3.text(nodeData.data.target).classed("selectedText", true);
  }
  if (depthOfDetail === 1) {
    level1.text(nodeData.data.source);
    level2.text(nodeData.data.target).classed("selectedText", true);
    level3.text(nodeData.children.length + " Analyses");
  }
  if (depthOfDetail === 0) {
    level1.text(nodeData.data.target).classed("selectedText", true);
    level2.text(nodeData.children.length + " Libraries");
    level3.text(nodeData.children.length + " Analyses");
  }
};

export const appendToolTip = svg => {
  return d3Tip()
    .attr("class", "d3-tip")
    .direction("n")
    .offset([-10, -10])
    .attr("class", "d3-tip")
    .attr("data-placement", "bottom")
    .html(function(d) {
      return `<p>` + d.data.target + `</p>`;
    });
};
export const hierarchyColouring = {
  0: "#f1c023",
  1: "#BC4746",
  2: "#95d2dc"
};
export const appendLegend = (svg, mainCircleDim) => {
  var legendSpacing = 600;
  var legendTitleSpacing = 500;
  var radius = 30;

  var lineHeight = -mainCircleDim.height / 24;
  var legendCircles = svg.append("g").classed("legendCircles", true);

  [" Select a filter or ", "hover over a node to", "     view more."].map(
    (description, index) =>
      svg
        .append("svg:text")
        .classed("legendDescription", true)
        .text(description)
        .attr("x", mainCircleDim.x + mainCircleDim.width / 2)
        .attr("y", mainCircleDim.height / 5 - lineHeight * index + 100)
  );
  const defualtYCord = mainCircleDim.height / 12;
  ["level1Label", "level2Label", "level3Label"].map((className, index) =>
    svg
      .append("svg:text")
      .attr("class", "panelLabel")
      .attr("x", mainCircleDim.x + mainCircleDim.width / 2 + 400)
      .attr("y", mainCircleDim.height / 11 - (lineHeight - 400) * index + 20)
      .classed(className, true)
  );

  [1, 2].map((colour, index) =>
    svg
      .append("line")
      .attr("stroke", "black")
      .attr("stroke-width", 10)
      .attr("x1", mainCircleDim.x + mainCircleDim.width / 2 + 200)
      .attr("y1", defualtYCord - (lineHeight - 350) * index)
      .attr("x2", mainCircleDim.x + mainCircleDim.width / 2 + 200)
      .attr("y2", defualtYCord - (lineHeight - 350) * (index + 1))
      .attr("class", "diagramLines hidePanel")
  );

  [200, 200, 750, 750, 1250, 1250].map((position, index) =>
    legendCircles
      .append("circle")
      .attr("fill", d =>
        index % 2 !== 0 ? hierarchyColouring[2 - (index - 1) / 2] : "none"
      )
      .attr("r", d => (index % 2 === 0 ? largeDotRadius : smallDotRadius))
      .attr("cx", mainCircleDim.x + mainCircleDim.width / 2 + 200)
      .attr("cy", position)
      .attr("class", d =>
        index % 2 === 0
          ? "diagramOutterCircles hidePanel outterLegendCircle" + index / 2
          : "diagramCircles hidePanel legendCircle" + (index - 1) / 2
      )
  );
  d3.selectAll(".legendCircles").raise();
};
export const originalLineEquation = d3
  .linkRadial()
  .angle(d => d.x + displayConfig.filtersOffSet)
  .radius(d => {
    const levelOffset = d.height === 0 ? -400 : 0;
    return d.y + displayConfig.filtersOffSet + levelOffset;
  });
export const appendSvgCircles = (mainSvg, nodes) => {
  const svgCircles = mainSvg
    .append("g")
    .attr("class", "allCircleNodes")
    .selectAll("circle")
    .data(nodes, function(d) {
      return d.data.target;
    })
    .enter()
    .append("g");

  svgCircles
    .attr("class", "g-node")
    .attr("transform", d => {
      const yOffset = d.depth === 0 ? -800 : d.height === 0 ? -400 : 0;
      return `
  rotate(${((d.x + displayConfig.filtersOffSet) * 180) / Math.PI - 90})
    translate(${d.y + displayConfig.filtersOffSet + yOffset},0)
  `;
    })
    .append("circle")
    .attr("fill", function(d) {
      if (d.depth !== 0) {
        return "white";
      }
    })
    .attr("r", d => originalRadius(d, false))
    .attr("class", function(d) {
      if (d.depth === 0) {
        return "parent-project node-" + d.data.target;
      } else if (d.data.__typename !== "label") {
        return "node-" + d.data.target;
      } else {
        return "node-label";
      }
    });
  return svgCircles;
};
export const appendSvgLines = (svg, links) =>
  svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "white")
    .classed("lines", true)
    .selectAll("path")
    .data(links, d => {
      return d.source.data.source + "-" + d.target.data.source;
    })
    .enter()
    .append("path")
    .attr("d", originalLineEquation)
    .attr("stroke-width", function(d) {
      if (d.target) {
        if (d.target.depth === 1 || d.target.depth === 2) {
          return 10;
        } else {
          return 8;
        }
      } else {
        return;
      }
    })
    .attr("class", function(d) {
      return "link-" + d.target.data.target;
    });

export const textAppendToNodes = container =>
  container
    .append("text")
    .attr("dy", "-1em")
    .attr("x", 0)
    .style("text-anchor", function(d) {
      return (d.x * 180.0) / Math.PI < 180 ? "start" : "end";
    })
    .attr("transform", function(d) {
      return (d.x * 180.0) / Math.PI < 180
        ? "translate(" + (d.data.target.length + 250) + ")"
        : "rotate(180)translate(-" + (d.data.target.length + 250) + ")";
    })
    .text(function(d) {
      return d.depth > 1 ? d.data.target : "";
    });
