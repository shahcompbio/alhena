import d3Tip from "d3-tip";
import * as d3 from "d3";

import { config } from "../../../config/config";
const displayConfig = config.DisplayConfig;
export const appendLegendGlowFilter = svg => {
  createFilter(svg, "legendRedGlow", "55", 0.5, "rgb(207, 0, 15)");
  createFilter(svg, "legendGreenGlow", "55", 0.5);
  createFilter(svg, "legendWhiteGlow", "8.5", 0.5);
};
export const appendGlowFilter = svg => {
  createFilter(svg, "glow", "55", 0.2);
  createFilter(svg, "innerRingGlow", "55", 0.5);
  createFilter(svg, "textGlow", "8.5", 0.5);
};
const createFilter = (svg, id, stDeviation, floodOpacity, colour) => {
  var defs = svg.append("defs");

  var filter = defs.append("filter").attr("id", id);
  filter
    .append("feFlood")
    .attr("flood-color", colour ? colour : "rgb(255, 249, 222)")
    .attr("flood-opacity", floodOpacity)
    .attr("in", "SourceGraphic");
  filter
    .append("feComposite")
    .attr("operator", "in")
    .attr("in2", "SourceGraphic");
  filter
    .append("feGaussianBlur")
    .attr("stdDeviation", stDeviation)
    .attr("result", "coloredBlur");

  var feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");
};
export const appendLegend = (svg, mainCircleDim) => {
  var legendSpacing = 600;
  var legendTitleSpacing = 500;
  var sampleTextSpacing = 600;
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
        .attr("y", mainCircleDim.height / 2 - (lineHeight - 100) * index)
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
export const ungreySelection = selectionText =>
  d3.selectAll(selectionText).classed("greyedNodes", false);
export const greySelection = selectionText =>
  d3.selectAll(selectionText).classed("greyedNodes", true);
export const linkSelect = selectionText =>
  d3
    .selectAll(selectionText)
    .classed("link-hover", true)
    .classed("greyedNodes", false);

export const ungreyOutJiraLabels = () =>
  d3.selectAll(".jiraTicketlabels").classed("greyedNodes", false);

export const greyOutJiraLabels = notSelection =>
  d3
    .selectAll(".jiraTicketlabels:not(.jiraTicketFor-" + notSelection + ")")
    .classed("greyedNodes", true);

export const linkDeselect = selectionText =>
  d3.selectAll(selectionText).classed("link-hover", false);

export const nodeSelect = selectionText =>
  d3
    .select(selectionText)
    .classed("hover", true)
    .classed("greyedNodes", false);

export const nodeDeselect = selectionText =>
  d3
    .select(selectionText)
    .classed("hover", true)
    .classed("greyedNodes", false);

export const initSvg = root =>
  d3
    .select(root)
    .append("svg")
    .classed("bubbles", true)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr(
      "viewBox",
      "0 0 " + displayConfig.viewBoxX + " " + displayConfig.viewBoxY + " "
    )
    .attr("width", "100vw")
    .attr("height", "100vh");
export const raiseLabels = prevState => {
  prevState.labelGroup.raise();
  d3.select(".jiraLabelTitle").raise();
  d3.select(".titleUnderline").raise();
};
export const removeAllPreviousContent = () => {
  d3.selectAll("path.visible")
    .classed("greyedNodes", false)
    .classed("choosenLink", false);

  d3.selectAll("circle")
    .classed("greyedNodes", false)
    .classed("choosenNode", false)
    .classed("chosenNodeParent", false);

  d3.selectAll(".marker").remove();
  d3.selectAll(".jiraLabel").remove();
};
export const appendSimulation = () =>
  d3
    .forceSimulation()
    .force(
      "collide",
      d3.forceCollide(function(d) {
        if (d.depth === 0) {
          return 400;
        } else if (d.depth === 1) {
          return 150;
        } else if (d.depth === 2) {
          return 1;
        } else {
          return 0;
        }
      })
    )
    .force(
      "charge",
      d3.forceManyBody().strength(function(d) {
        if (d.depth < 2) {
          return -1000;
        } else {
          return 5;
        }
      })
    );
export const greyOutAllNodes = target => {
  d3.selectAll("circle:not(.parent-project)").classed("greyedNodes", true);
  d3.selectAll("path:not(.link-" + target + ")").classed("greyedNodes", true);
};
