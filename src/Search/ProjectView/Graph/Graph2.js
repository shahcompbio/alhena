import React, { useState, useRef, useEffect } from "react";
import { config } from "../../../config/config";
import * as d3 from "d3";

import { useDashboardState } from "../../ProjectView/ProjectState/dashboardState";

import Grid from "@material-ui/core/Grid";
import { styled } from "@material-ui/styles";
import { appendGlowFilter } from "./glowUtils.js";

import {
  appendSvgLines,
  appendSvgCircles,
  appendLegend,
  createRoot,
  originalLineEquation,
  appendPanelText,
  hierarchyColouring,
  appendPanelTextAfterFilter
} from "./appendUtils.js";
import {
  initSvg,
  greyOutAllNodes,
  colourNodeSelections,
  linkSelect,
  nodeSelect,
  ungreySelection,
  removeAllContent,
  removeLegendLabels,
  getSelectionPath,
  voronoid,
  originalRadius,
  voronoiXScale,
  voronoiYScale
} from "./utils";
const displayConfig = config.DisplayConfig;

const depthTohierarchy = {
  1: "sample_id",
  2: "library_id",
  3: "jira_id"
};
const Graph = ({
  isLoading,
  data,
  filters,
  handleFilterChange,
  handleForwardStep
}) => {
  const [{}, dispatch] = useDashboardState();
  const [mainSvg, setMainSvg] = useState({});
  const graphRef = useRef(null);

  useEffect(() => {
    var svg = initSvg(graphRef.current);
    appendGlowFilter(svg);
    setMainSvg(svg);
  }, []);

  //When data changes
  useEffect(() => {
    if (!isLoading & (filters.length !== 0)) {
      mainSvg.selectAll(".voronoi-group").remove();
      mainSvg.selectAll(".legendDescription").remove();

      var root = createRoot(d3.hierarchy(data[0]));
      var nodes = root.descendants();
      var links = root.links();

      appendPanelTextAfterFilter(filters, nodes, mainSvg);

      const svgLines = appendSvgLines();
      const merge = appendSvgCircles();

      transformSvgLines(svgLines, merge);
      appendSecondCircleOnAnalysisNode(merge);
      appendVoronoi(merge, mainSvg);
      appendTextToNodes(merge);

      //~~~~~
      //~~~~~
      function appendSvgLines() {
        var svgLines = mainSvg.select(".lines");
        svgLines = svgLines.selectAll("path").data(links, d => {
          return d.target.data.source;
        });
        svgLines
          .attr("class", function(d) {
            return "link-" + d.target.data.target;
          })
          .transition()
          .attr(
            "d",
            d3
              .linkRadial()
              .angle(d => d.x)
              .radius(d => d.y)
          );

        var svgLinesEnter = svgLines
          .enter()
          .append("g")
          .attr("class", "lines");

        svgLinesEnter
          .append("path")
          .attr("stroke", "white")
          .attr("stroke-width", 15)
          .attr("class", function(d) {
            return "link-" + d.target.data.target;
          })
          .attr(
            "d",
            d3
              .linkRadial()
              .angle(d => d.x)
              .radius(d => d.y)
          );
        svgLinesEnter
          .select("path")
          .transition()
          .duration(1000)
          .attr(
            "d",
            d3
              .linkRadial()
              .angle(d => d.x)
              .radius(d => d.y - 100)
          );

        svgLines.exit().remove();
        return svgLines;
      }
      function appendSvgCircles() {
        var svgCircles = mainSvg.select(".allCircleNodes");
        svgCircles = svgCircles.selectAll(".g-node").data(nodes, d => {
          return d.data.target;
        });

        var svgCircleEnter = svgCircles
          .enter()
          .append("g")
          .attr("class", "g-node");

        svgCircles
          .selectAll(".g-node circle")
          .attr("fill", function(d) {
            return d.depth !== 1 ? hierarchyColouring[d.height] : "none";
          })
          .attr("r", d => originalRadius(d, true))
          .attr("class", function(d) {
            if (d.depth === 0) {
              return "parent-project node-" + d.data.target;
            } else if (d.height === 0 || d.height === 1) {
              return "node-" + d.data.target;
            }
          })
          .attr("transform", d => {
            if (d.height === 0) {
              return `translate(700,0)`;
            }
          });

        svgCircleEnter
          .append("circle")
          .filter(function(d) {
            return d.depth !== 1;
          })
          .attr("fill", function(d) {
            return hierarchyColouring[d.height];
          })
          .attr("r", d => originalRadius(d, true))
          .attr("class", function(d) {
            if (d.depth === 0) {
              return "parent-project node-" + d.data.target;
            } else if (d.height === 0 || d.height === 1) {
              return "node-" + d.data.target;
            }
          })
          .filter(d => d.height === 0)
          .attr("transform", d => {
            if (d.height === 0) {
              return `translate(700,0)`;
            }
          });

        //remove old content
        svgCircles.exit().remove();
        return svgCircles.merge(svgCircleEnter);
      }
      function appendSecondCircleOnAnalysisNode(merge) {
        //second circle around the last level circle
        merge
          .append("circle")
          .filter(node => node.height === 0)
          .attr("fill", function(d) {
            return "none";
          })
          .attr("transform", d => {
            return `translate(700,0)`;
          })
          .attr("r", 50)
          .attr("class", function(d) {
            return "jiraTicketLabelsOutterRing jiraTicketFor-" + d.data.target;
          });
      }
      function transformSvgLines(svgLines, merge) {
        svgLines.attr("transform", d => {
          const nodeOffset = merge.size() === 4 ? 90 : 0;
          return `
rotate(${nodeOffset})
`;
        });
      }
      function appendVoronoi(merge, mainSvg) {
        merge
          .transition()
          .duration(100)
          .attr("transform", d => {
            const nodeOffset = merge.size() === 4 ? 0 : 90;
            const yOffset = d.height === 0 ? 650 : 100;
            return `
  rotate(${(d.x * 180) / Math.PI - nodeOffset})
  translate(${d.y - yOffset},0)
  `;
          })
          .on("end", function() {
            mainSvg.selectAll(".voronoi-group").remove();
            var drawingAreaBounds = mainSvg
              .select(".allCircleNodes")
              .node()
              .getBoundingClientRect();

            var xScale = voronoiXScale(
              drawingAreaBounds.x,
              drawingAreaBounds.right
            );
            var yScale = voronoiYScale(
              drawingAreaBounds.y,
              drawingAreaBounds.bottom
            );

            var cirlceElementCordinates = [];
            mainSvg
              .selectAll(".allCircleNodes .g-node")
              .filter(d => {
                return d.depth !== 1;
              })
              .each(function(element, index) {
                var box = this.getBoundingClientRect();
                cirlceElementCordinates = [
                  ...cirlceElementCordinates,
                  {
                    x: xScale(box.x + box.width / 2),
                    y: yScale(box.y + box.height / 2),
                    element: element
                  }
                ];
              });

            var voronoi = mainSvg.append("g").attr("class", "voronoi-group");

            voronoi
              .selectAll("path")
              .data(voronoid(cirlceElementCordinates).polygons(), d => {
                return d.data.element.data.target;
              })
              .enter()
              .append("path")
              //  .style("stroke", "#2074A0")
              //  .style("stroke-width", 5)
              .style("fill", "none")
              .style("pointer-events", "all")
              .attr("d", d => (d ? "M" + d.join("L") + "Z" : null))
              .attr("class", d => {
                return d ? d.data.element.data.target + "-voronoi" : "";
              })
              .on("mousedown", (data, index, element) => {
                if (data.data.element.height === 0) {
                  dispatch({
                    type: "ANALYSIS_SELECT",
                    value: { selectedAnalysis: data.data.element.data.target }
                  });

                  handleForwardStep();
                }
              })
              .on("mouseover", (data, index, element) => {
                var currNode = data.data.element;
                var nodeSelectionText = getSelectionPath(currNode, ".node-");
                var linkSelections = getSelectionPath(currNode, ".link-");

                const nodeSelections = d3
                  .selectAll(nodeSelectionText)
                  .filter(d => d.depth !== 0);
                const lastLevelNodes =
                  currNode.height === 0 ? [currNode] : currNode.children;

                lastLevelNodes.map(node => {
                  var nodeLabel = node.data.target;

                  mainSvg
                    .selectAll(".jiraTicketFor-" + nodeLabel)
                    .classed("labelsOutterRingHover", true)
                    .classed("greyedNodes", false)
                    .transition()
                    .attr("r", 80);
                });
                greyOutAllNodes(data.data.target);
                nodeSelections.classed("greyedNodes", false);

                nodeSelections.transition().attr("r", 60);
                mainSvg
                  .selectAll(linkSelections)
                  .classed(".link-hover", true)
                  .classed("greyedNodes", false);
              })
              .on("mouseout", (data, index, element) => {
                ungreySelection("circle, path");

                var currNode = data.data.element;
                var nodeSelectionText = getSelectionPath(currNode, ".node-");
                const nodeSelections = d3
                  .selectAll(nodeSelectionText)
                  .filter(d => d.depth !== 0);
                const lastLevelNodes =
                  currNode.height === 0 ? [currNode] : currNode.children;

                lastLevelNodes.map(node => {
                  var nodeLabel = node.data.target;

                  mainSvg
                    .selectAll(".jiraTicketFor-" + nodeLabel)
                    .classed("labelsOutterRingHover", false);
                });
                nodeSelections
                  .transition()
                  .attr("r", d => originalRadius(d, true));

                mainSvg.selectAll(".link-hover").classed(".link-hover", false);
              });
          });
      }
      function appendTextToNodes(merge) {
        //all text on nodes
        merge
          .append("text")
          .attr("dy", "-1em")
          .attr("x", function(d) {
            return (d.x * 180.0) / Math.PI < 180 ? 6 : -6;
          })
          .style("text-anchor", function(d) {
            return (d.x * 180.0) / Math.PI < 180 ? "start" : "end";
          })
          .attr("transform", function(d) {
            if (d.height === 0) {
              return (d.x * 180.0) / Math.PI < 180
                ? "translate(" + (d.data.target.length + 300) + ")"
                : "rotate(180)translate(-" + (d.data.target.length + 300) + ")";
            } else if (d.height === 1) {
              return (d.x * 180.0) / Math.PI < 180
                ? "translate(-" + (d.data.target.length + 250) + ")"
                : "rotate(180)translate(+" + (d.data.target.length + 300) + ")";
            }
          })
          .text(function(d) {
            return d.depth > 1 ? d.data.target : "";
          })
          .attr("class", function(d) {
            return "jiraTicketlabels jiraTicketFor-" + d.data.target;
          });

        d3.select(".foreignObject").raise();
      }
    }
  }, [data]);

  useEffect(() => {
    if (
      !isLoading &
      (filters.length === 0) &
      (Object.entries(mainSvg).length !== 0)
    ) {
      removeAllContent(mainSvg);

      var root = createRoot(d3.hierarchy(data[0]));
      var nodes = root.descendants();
      var links = root.links();

      appendSvgLines(mainSvg, links);

      const svgCircles = appendSvgCircles(mainSvg, nodes);

      appendVoronoi(mainSvg);
      initPanelText(svgCircles, mainSvg);

      //~~~~~
      //~~~~~
      function appendVoronoi(mainSvg) {
        var cirlceElementCordinates = [];
        var drawingAreaBounds = mainSvg
          .select(".allCircleNodes")
          .node()
          .getBoundingClientRect();

        var xScale = voronoiXScale(
          drawingAreaBounds.x,
          drawingAreaBounds.right
        );
        var yScale = voronoiYScale(
          drawingAreaBounds.y,
          drawingAreaBounds.bottom
        );

        mainSvg.selectAll(".g-node circle").each(function(element, index) {
          var box = this.getBoundingClientRect();
          cirlceElementCordinates = [
            ...cirlceElementCordinates,
            {
              x: xScale(box.x + box.width / 2),
              y: yScale(box.y + box.height / 2),
              element: element
            }
          ];
        });

        mainSvg
          .append("g")
          .attr("class", "voronoi-group")
          .selectAll("path")
          .data(voronoid(cirlceElementCordinates).polygons(), d => {
            return d.data.element.data.target;
          })
          .enter()
          .append("path")
          //.style("stroke", "#2074A0")
          //.style("stroke-width", 5)
          .style("fill", "none")
          .style("pointer-events", "all")
          .attr("d", d => (d ? "M" + d.join("L") + "Z" : null))
          .attr("class", d => {
            return d ? d.data.element.data.target + "-voronoi" : "";
          })
          .on("mouseover", (data, index, element) => {
            var currNode = data.data.element;
            var nodeSelectionText = getSelectionPath(currNode, ".node-");
            var linkSelections = getSelectionPath(currNode, ".link-");

            const nodeSelections = d3
              .selectAll(nodeSelectionText)
              .filter(d => d.depth !== 0);
            const heightOfDetail = currNode.height;

            colourNodeSelections(nodeSelections, heightOfDetail);

            greyOutAllNodes(data.data.target);
            linkSelect(linkSelections);
            nodeSelect(nodeSelections, heightOfDetail);

            removeLegendLabels();

            d3.select(".parent-project")
              .classed("hover", false)
              .classed("greyedNodes", false)
              .classed("parent-hover", true);

            appendPanelText(currNode, mainSvg);
          })
          .on("mouseout", (data, index, element) => {
            var currNode = data.data.element;
            if (filters.length === 0 && currNode.data.__typename !== "label") {
              //  tooltip.hide();
              var nodeSelections = getSelectionPath(currNode, ".node-");
              var linkSelections = getSelectionPath(currNode, ".link-");

              mainSvg.selectAll(".panelLabel").classed("selectedText", false);

              mainSvg.selectAll(".diagramOutterCircles").attr("r", 45);
              mainSvg.selectAll(".diagramCircles").attr("r", 30);

              mainSvg
                .selectAll(".legendCircles circle")
                .classed("hidePanel", true);
              mainSvg
                .selectAll(nodeSelections)
                .classed("highlight0 highlight1 highlight2", false)
                .transition()
                .attr("transform", d => {
                  if (d.depth !== 1) {
                    return `
                 translate(0,0)
               `;
                  }
                })
                .attr("r", d => originalRadius(d, false))
                .attr("fill", "white");

              mainSvg
                .selectAll(linkSelections)
                .transition()
                .attr("d", originalLineEquation);

              ungreySelection("circle, path");

              mainSvg.selectAll(".hover").classed("hover", false);
              mainSvg.selectAll(".link-hover").classed("link-hover", false);

              mainSvg
                .selectAll(".diagramLines,.diagramCircles,.diagramLines")
                .classed("hidePanel", true);
              mainSvg
                .selectAll(".level1Label, .level2Label, .level3Label ")
                .text("");
            }
          })
          .on(
            "mousedown",
            (data, index, element) => {
              if (data.data.element.height === 0) {
                dispatch({
                  type: "ANALYSIS_SELECT",
                  value: { selectedAnalysis: data.data.element.data.target }
                });

                handleForwardStep();
              } else {
                var currNode = data.data.element;
                if (currNode.parent !== null) {
                  d3.selectAll(".level1Label, .level2Label, .level3Label").text(
                    ""
                  );

                  handleFilterChange(
                    {
                      value: currNode.data.target,
                      label: depthTohierarchy[currNode.depth]
                    },
                    "update"
                  );
                }
              }
            },
            this
          )
          .attr("transform", "translate(600,100)");
      }
      function initPanelText(svgCircles, mainSvg) {
        var circleText = svgCircles.filter(d => d.parent === null);

        var mainCircleDim = circleText.node().getBBox();

        if (d3.select(".foreignObject").size() === 0) {
          var labelForeignObject = mainSvg
            .append("foreignObject")
            .attr("height", (2 * mainCircleDim.height) / 3)
            .attr("width", mainCircleDim.width / 2)
            .attr("x", mainCircleDim.x + mainCircleDim.width / 4)
            .attr("y", mainCircleDim.y + mainCircleDim.height / 4)
            .classed("foreignObject", true);

          var labelSvg = labelForeignObject
            .append("svg")
            .attr("height", mainCircleDim.height)
            .attr("width", mainCircleDim.width / 2);

          appendLegend(labelSvg, mainCircleDim);
        } else {
          d3.select(".foreignObject").raise();
        }
      }
      function autoBox() {
        const { x, y, width, height } = this.getBBox();
        return [
          x,
          y,
          width + displayConfig.rootSize / 3,
          height + displayConfig.rootSize / 3
        ];
      }
      mainSvg.attr("viewBox", autoBox).attr("transform", "translate(100,50)");
    }
  }, [data, mainSvg]);

  return (
    <Grid container direction="row" key={"circles-container"}>
      <GraphContainer id="circles" ref={graphRef} key={"circles-div"} />
    </Grid>
  );
};

const GraphContainer = styled("div")`
  display: inline-block;
  position: relative;
  width: 80vw;
  padding-bottom: 100%;
  vertical-align: top;
  overflow: hidden;
`;

export default Graph;
