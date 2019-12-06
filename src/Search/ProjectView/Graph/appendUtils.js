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

export const appendToolTip = svg => {
  var tip = d3Tip()
    .attr("class", "d3-tip")
    .direction("n")
    .offset([-10, 0])
    .attr("class", "d3-tip")
    .attr("data-placement", "bottom")
    .html(function(d) {
      var toolTipDepth = d.depth;
      if (toolTipDepth !== 3) {
        var content = `<table style="margin-top: 2.5px;">`;
        if (toolTipDepth === 2) {
          content +=
            `<tr><td>Jira ID: </td><td style="text-align: right">` +
            d.data.children.map(child => child.target).join(",") +
            `</td><tr><td>Sample: </td><td style="text-align: right">` +
            d.data.target +
            `</td><tr><td>Library: </td><td style="text-align: right">` +
            d.parent.data.target +
            `</td><tr><td>Project: </td><td style="text-align: right">` +
            d.parent.data.source +
            `</td>`;
        } else {
          content +=
            `<tr><td>Library: </td><td style="text-align: right">` +
            d.data.target +
            `</td><tr><td>Project: </td><td style="text-align: right">` +
            d.data.source +
            `</td>`;
        }
        content += `</tr>`;
        return content;
      }
    });
  svg.call(tip);
  return tip;
};
export const appendLegend = (svg, mainCircleDim) => {
  var legendSpacing = 600;
  var legendTitleSpacing = 500;
  var radius = 30;
  var lineHeight = mainCircleDim.height / 8 - mainCircleDim.height / 6;
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
        .attr("y", mainCircleDim.height / 2 - (lineHeight * index - 100))
  );

  ["sampleIDLabel", "libraryInfoIDLabel", "jiraInfoIDLabel"].map(
    (className, index) => {
      svg
        .append("svg:text")
        .attr("x", mainCircleDim.x + mainCircleDim.width / 2)
        .attr(
          "y",
          mainCircleDim.height / 3 + (mainCircleDim.height / 6) * index
        )
        .classed(className, true);
    }
  );
  ["sample", "library", "jira"].map((className, index) => {
    svg
      .append("svg:text")
      .text("")
      .attr("class", className + "AfterFilterLabel")
      .attr("x", mainCircleDim.x + mainCircleDim.width / 2)
      .attr("y", mainCircleDim.height / 2 - lineHeight * 2 * index);
  });
};
export const appendSvgLines = (svg, links) =>
  svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "black")
    .classed("lines", true)
    .selectAll("path")
    .data(links, d => {
      console.log(d);
      return d.id;
    })
    .enter()
    .append("path")
    .attr(
      "d",
      d3
        .linkRadial()
        .angle(d => d.x + displayConfig.filtersOffSet)
        .radius(d => d.y + displayConfig.filtersOffSet)
    )
    .attr("stroke-width", function(d) {
      if (d.target) {
        if (d.target.depth === 1 || d.target.depth === 2) {
          return 10;
        } else {
          return 0;
        }
      } else {
        return;
      }
    })
    .attr("class", function(d) {
      if (d.target.height !== 0) {
        return "visible link-" + d.target.data.target;
      }
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
            __typename: "label"
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
