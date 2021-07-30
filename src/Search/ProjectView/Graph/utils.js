import * as d3 from "d3";

import { config } from "../config.js";
export const setLargerPanelFont = (context, screenType) => {
  context.font = screenType.isBigScreen
    ? "30px Lucida Console, Monaco, monospace"
    : screenType.isMedScreen
    ? "18px Lucida Console, Monaco, monospace"
    : "15px Lucida Console, Monaco, monospace";
};
export const setSmallerPanelFont = (context, screenType) => {
  context.font = screenType.isBigScreen
    ? "15px Lucida Console, Monaco, monospace"
    : screenType.isMedScreen
    ? "12px Lucida Console, Monaco, monospace"
    : "10px Lucida Console, Monaco, monospace";
};
export function originalRadiusCanvas(d) {
  if (d.depth === 0) {
    return 800;
  } else if (d.depth === 1 || d.depth === 2) {
    return 15;
  } else {
    return 15;
  }
}
export function originalRadius(d, isSecondLevelInteraction) {
  if (isSecondLevelInteraction) {
    return d.depth === 0 ? 1400 : d.depth === 1 ? 0 : 40;
  } else {
    if (d.depth === 0) {
      return 1400;
    } else if (d.depth === 1 || d.depth === 2) {
      return 20;
    } else {
      return 15;
    }
  }
}
export const voronoiYScale = (y1, y2) =>
  d3
    .scaleLinear()
    .domain([y1, y2])
    .range([-2700, 2700]);

export const voronoiXScale = (x1, x2) =>
  d3
    .scaleLinear()
    .domain([x1, x2])
    .range([-2700, 2700]);

export const voronoid = d3
  .voronoi()
  .x((d) => d.x)
  .y((d) => d.y)
  .extent([
    [-4000, -4000],
    [4000, 4000],
  ]);

export const removeLegendLabels = () => {
  d3.selectAll(
    ".indicationDots, .seperator, .legendTitles, .directLabel, .node-label"
  ).remove();
  d3.selectAll(".legendDescription").remove();
};

export const colourNodeSelections = (nodeSelection, heightOfDetail) =>
  nodeSelection
    .classed("highlight0", function(d) {
      return d.height === 0;
    })
    .classed("highlight1", function(d) {
      return d.height === 1;
    })
    .classed("highlight2", function(d) {
      return d.height === 2;
    })
    .attr("r", function(d) {
      return heightOfDetail === d.height ? 70 : 20;
    });

export const removeAllContent = (mainSvg) => {
  mainSvg
    .selectAll(
      ".allCircleNodes, .lines, .directLabel, .node-label, path, .legendDescription"
    )
    .remove();

  d3.select(".sampleAfterFilterLabel").text("");
};
export const ungreySelection = (selectionText) =>
  d3.selectAll(selectionText).classed("greyedNodes", false);
export const greySelection = (selectionText) =>
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
export const linkSelect = (selectionText) => {
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
        .angle((d) => d.x + config.filtersOffSet)
        .radius((d) => {
          return d.y + config.filtersOffSet + 125;
        })
    );
};

export const ungreyOutJiraLabels = () =>
  d3.selectAll(".jiraTicketlabels").classed("greyedNodes", false);

export const greyOutJiraLabels = (notSelection) =>
  d3
    .selectAll(".jiraTicketlabels:not(.jiraTicketFor-" + notSelection + ")")
    .classed("greyedNodes", true);

export const linkDeselect = (selectionText) =>
  d3.selectAll(selectionText).classed("link-hover", false);

export const nodeSelect = (selection, heightOfDetail) => {
  selection.classed("hover", true);
  selection.classed("greyedNodes", false);

  selection.transition().attr("transform", (d) => {
    if (d.depth === 2) {
      return `
      translate(65,0)
    `;
    }
    if (d.depth !== 1) {
      return heightOfDetail === d.height
        ? `
          translate(500,0)
        `
        : `
        translate(700,0)
      `;
    }
  });
};

export const nodeDeselect = (selectionText) =>
  d3
    .selectAll(selectionText)
    .classed("hover", true)
    .classed("greyedNodes", false);

export const initSvg = (root, width, height) =>
  d3
    .select(root)
    .append("svg")
    .classed("bubbles", true)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + width + " " + height + " ")
    .attr("width", "100vw")
    .attr("height", "100vh")
    .attr("transform", "scale(1.25,1.25)");

export const raiseLabels = (prevState) => {
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

export const greyOutAllNodes = (target) => {
  d3.selectAll(".allCircleNodes circle:not(.parent-project)").classed(
    "greyedNodes",
    true
  );
  d3.selectAll(".lines path:not(.link-" + target + ")").classed(
    "greyedNodes",
    true
  );
};
