import { config } from "../../../config/config";
import * as d3 from "d3";
import d3Tip from "d3-tip";

const displayConfig = config.DisplayConfig;

export const createRoot = cluster =>
  d3
    .cluster()
    .separation(function(a, b) {
      return (a.parent === b.parent ? 2 : 1) / a.depth;
    })
    .size([2 * Math.PI, displayConfig.rootSize])(cluster);

export const appendPanelText = (nodeData, mainSvg) => {
  mainSvg
    .selectAll(".diagramCircles")
    .classed("greyedNodes", false)
    .classed("hidePanel", false);

  mainSvg.selectAll(".diagramLines").classed("hidePanel", false);

  const level1 = mainSvg.select(".level1Label");
  const level2 = mainSvg.select(".level2Label");
  const level3 = mainSvg.select(".level3Label");
  const depthOfDetail = nodeData.depth;

  if (depthOfDetail === 3) {
    level1.text(nodeData.data.source);
    level2.text(nodeData.data.source);
    level3.text(nodeData.data.target);
  }
  if (depthOfDetail === 2) {
    level1.text(nodeData.data.source);
    level2.text(nodeData.data.target);
    level3.text(nodeData.children.length + " Analyses");
  }
  if (depthOfDetail === 1) {
    level1.text(nodeData.data.target);
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

export const appendLegend = (svg, mainCircleDim) => {
  var legendSpacing = 600;
  var legendTitleSpacing = 500;
  var radius = 30;
  var lineHeight = -mainCircleDim.height / 24;
  var dotsContainer = svg.append("g").classed("indicationDots", true);

  ["#cf000f", "#7befb2", "white"].map((colour, index) =>
    dotsContainer
      .append("circle")
      .attr("fill", colour)
      .attr("r", radius)
      .attr("cx", mainCircleDim.width / 4 - legendSpacing)
      .attr("cy", mainCircleDim.height / 8 - lineHeight * index)
      .attr("class", "legendCircles")
  );
  ["Currently Down", "Recently Added", "Dashboard Available"].map(
    (title, index) =>
      svg
        .append("svg:text")
        .text(title)
        .attr("dx", mainCircleDim.width / 4 - legendTitleSpacing)
        .attr("dy", mainCircleDim.height / 8 - lineHeight * index + 30)
        .classed("legendTitles", true)
  );

  svg
    .append("rect")
    .attr("dx", mainCircleDim.width / 4)
    .attr("y", mainCircleDim.height / 4)
    .attr("width", mainCircleDim.width)
    .attr("height", 8)
    .attr("fill", "white")
    .classed("seperator", true);

  [" Select a filter or ", "hover over a node to", "     view more."].map(
    (description, index) =>
      svg
        .append("svg:text")
        .classed("legendDescription", true)
        .text(description)
        .attr("x", mainCircleDim.x + mainCircleDim.width / 2)
        .attr("y", mainCircleDim.height / 3 - lineHeight * index + 100)
  );

  ["level1Label", "level2Label", "level3Label"].map((className, index) =>
    svg
      .append("svg:text")
      .attr("class", "panelLabel")
      .attr("x", mainCircleDim.x + mainCircleDim.width / 2 + 400)
      .attr("y", mainCircleDim.height / 10 - (lineHeight - 400) * index)
      .classed(className, true)
  );

  [200, 200, 750, 750, 1250, 1250].map((position, index) =>
    svg
      .append("circle")
      .attr("fill", "black")
      .attr("r", function() {
        const mulitplier = index % 2 === 0 ? 1.5 : 1;
        return radius * mulitplier;
      })
      .attr("cx", mainCircleDim.x + mainCircleDim.width / 2 + 200)
      .attr("cy", position)
      .attr("class", d =>
        index % 2 === 0
          ? "diagramOutterCircle diagramCircles hidePanel"
          : "diagramCircles hidePanel"
      )
  );
  [1, 2].map((colour, index) =>
    svg
      .append("line")
      .attr("stroke", "black")
      .attr("stroke-width", 10)
      .attr("x1", mainCircleDim.x + mainCircleDim.width / 2 + 200)
      .attr("y1", mainCircleDim.height / 10 - (lineHeight - 350) * index)
      .attr("x2", mainCircleDim.x + mainCircleDim.width / 2 + 200)
      .attr("y2", mainCircleDim.height / 10 - (lineHeight - 350) * (index + 1))
      .attr("class", "diagramLines hidePanel")
  );
  /*["sample", "library", "jira"].map((className, index) => {
    svg
      .append("svg:text")
      .text("")
      .attr("class", className + "AfterFilterLabel")
      .attr("x", mainCircleDim.x + mainCircleDim.width / 2)
      .attr("y", mainCircleDim.height / 2 - lineHeight * 2 * index);
  });*/
};
export const originalLineEquation = d3
  .linkRadial()
  .angle(d => d.x + displayConfig.filtersOffSet)
  .radius(d => {
    const levelOffset = d.height === 0 ? -400 : 0;
    return d.y + displayConfig.filtersOffSet + levelOffset;
  });
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
export const appendLegendNode = (data, isMainDraw) => {
  var legendNode = !isMainDraw
    ? {
        source: data.children[0].target,
        target: "Libraries",
        __typename: "label",
        children: [
          {
            source: "Libraries",
            target: "JiraID",
            value: 1,
            __typename: "label",
            children: [
              {
                source: "Libraries",
                target: "JiraID",
                value: 1,
                __typename: "label"
              }
            ]
          }
        ]
      }
    : {
        source: data.target,
        target: "Samples",
        __typename: "label",
        children: [
          {
            source: "Samples",
            target: "Libraries",
            __typename: "label",
            children: [
              {
                source: "Libraries",
                target: "JiraID",
                value: 1,
                __typename: "label"
              }
            ]
          }
        ]
      };
  var cutIndex = 0;
  //find the best spot to place the legend
  if (!isMainDraw) {
    data.children[0].children = [...data.children[0].children, legendNode];
  } else {
    data.children.forEach((child, index) => {
      if (child.children.length > 10) {
        cutIndex = index;
      }
    });
    data.children.splice(cutIndex, 0, legendNode);
  }
  return data;
};
