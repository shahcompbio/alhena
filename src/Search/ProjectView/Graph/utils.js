import * as d3 from "d3";

import { config } from "../../../config/config";
const displayConfig = config.DisplayConfig;

export const removeLegendLabels = () => {
  d3.selectAll(".indicationDots, .seperator, .legendTitles").remove();
  d3.selectAll(".legendDescription").remove();
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

export const greyOutAllNodes = target => {
  d3.selectAll("circle:not(.parent-project)").classed("greyedNodes", true);
  d3.selectAll("path:not(.link-" + target + ")").classed("greyedNodes", true);
};
