import * as d3 from "d3";

import { config } from "../../../config/config";
const displayConfig = config.DisplayConfig;

export const voronoid = d3
  .voronoi()
  .x(d => d.x)
  .y(d => d.y)
  .extent([[-4000, -4000], [4000, 4000]]);

export const removeLegendLabels = () => {
  d3.selectAll(".indicationDots, .seperator, .legendTitles").remove();
  d3.selectAll(".legendDescription").remove();
};

export const ungreySelection = selectionText =>
  d3.selectAll(selectionText).classed("greyedNodes", false);
export const greySelection = selectionText =>
  d3.selectAll(selectionText).classed("greyedNodes", true);

export function getSelectionPath(data, type) {
  var nodeSelections = traverseTree(data, type);
  var parentSelections = traverseParentTree(data, type);

  nodeSelections = nodeSelections.substring(0, nodeSelections.length - 1);
  return parentSelections + nodeSelections;
}
function traverseParentTree(tree, type) {
  if (!tree.hasOwnProperty("parent") || tree.parent === null) {
    return "";
  } else {
    if (tree.data.source !== null) {
      return (
        type + tree.data.source + "," + traverseParentTree(tree.parent, type)
      );
    } else {
      return "";
    }
  }
}
function traverseTree(tree, type) {
  if (!tree.hasOwnProperty("children")) {
    return type + tree.data.target + ",";
  } else {
    return tree["children"].reduce(
      (str, child) => str + traverseTree(child, type),
      type + tree.data.target + ","
    );
  }
}
export const linkSelect = selectionText => {
  var selection = d3.selectAll(selectionText);

  selection.classed("link-hover", true).classed("greyedNodes", false);

  selection
    .filter(function(d) {
      return d.source.depth !== 0 && d.source.depth !== 1;
    })
    .transition()
    .attr(
      "d",
      d3
        .linkRadial()
        .angle(d => d.x + displayConfig.filtersOffSet)
        .radius(d => {
          return d.y + displayConfig.filtersOffSet + 200;
        })
    );
};

export const ungreyOutJiraLabels = () =>
  d3.selectAll(".jiraTicketlabels").classed("greyedNodes", false);

export const greyOutJiraLabels = notSelection =>
  d3
    .selectAll(".jiraTicketlabels:not(.jiraTicketFor-" + notSelection + ")")
    .classed("greyedNodes", true);

export const linkDeselect = selectionText =>
  d3.selectAll(selectionText).classed("link-hover", false);

export const nodeSelect = selectionText => {
  var selection = d3.selectAll(selectionText).filter(d => d.depth !== 0);

  selection.classed("hover", true);
  selection.classed("greyedNodes", false);

  selection
    .transition()
    .attr("transform", d => {
      if (d.depth === 2) {
        return `
      translate(90,0)
    `;
      }
      if (d.depth !== 1) {
        return `
        translate(700,0)
      `;
      }
    })
    .attr("r", 20);
};

export const nodeDeselect = selectionText =>
  d3
    .selectAll(selectionText)
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
