import React, { useState, useRef, useEffect } from "react";
import { config } from "../../../config/config";
import * as d3 from "d3";

import Grid from "@material-ui/core/Grid";
import { styled } from "@material-ui/styles";
import { appendGlowFilter } from "./glowUtils.js";

import {
  appendSvgLines,
  appendToolTip,
  appendLegendNode,
  appendLegend,
  createRoot,
  originalLineEquation,
  appendPanelText
} from "./appendUtils.js";
import {
  initSvg,
  greyOutAllNodes,
  linkSelect,
  nodeSelect,
  ungreySelection,
  removeLegendLabels,
  getSelectionPath,
  voronoid
} from "./utils";
const displayConfig = config.DisplayConfig;

const Graph = ({ isLoading, analyses, filters, handleFilterChange }) => {
  const [mainSvg, setMainSvg] = useState({});
  const graphRef = useRef(null);

  useEffect(() => {
    var svg = initSvg(graphRef.current);
    appendGlowFilter(svg);
    svg.append("g").classed("jiraLabelGroup", true);
    svg.append("g").attr("class", "voronoi");
    setMainSvg(svg);
  }, []);

  //When data changes
  useEffect(() => {
    if (!isLoading & (filters.length !== 0)) {
      mainSvg.selectAll(".voronoi-group").remove();
      var root = createRoot(d3.hierarchy(analyses[0]));
      var nodes = root.descendants();
      var links = root.links();

      var svgCircles = mainSvg.select(".allCircleNodes");
      svgCircles = svgCircles.selectAll(".g-node").data(nodes, function(d) {
        return d.data.depth === 0 ? "parent" : d.data.source;
      });

      var svgLines = mainSvg.select(".lines");
      svgLines = svgLines.selectAll("path").data(links, d => {
        return d.source.data.source + "-" + d.target.data.source;
      });

      svgCircles.exit().remove();
      svgLines.exit().remove();

      var svgCircleEnter = svgCircles
        .enter()
        .append("g")
        .attr("class", "g-node");

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

      svgCircleEnter
        .append("circle")
        .attr("fill", function(d) {
          if (d.depth !== 0) return "white";
        })
        .attr("r", function(d) {
          if (d.depth === 0) {
            return 1400;
          } else if (d.depth === 1) {
            return 0;
          } else if (d.depth === 2 || d.height === 0) {
            return 20;
          }
        })
        .on("mouseover", (data, index, element) => {})
        .on("mouseout", (data, index, element) => {})
        .attr("class", function(d) {
          if (d.depth === 0) {
            return "parent-project node-" + d.data.target;
          } else if (d.height === 0 || d.height === 1) {
            return "node-" + d.data.target;
          }
        });

      //second circle around the last level circle
      svgCircles
        .append("circle")
        .filter(node => node.height === 0)
        .attr("fill", function(d) {
          return "none";
        })
        .attr("transform", d => {
          return `
    translate(600,0)
    `;
        })
        .attr("r", 50)
        .attr("class", function(d) {
          return "jiraTicketLabelsOutterRing jiraTicketFor-" + d.data.target;
        });

      //all text on nodes
      svgCircleEnter
        .append("text")
        .attr("dy", "-1em")
        .attr("x", function(d) {
          return (d.x * 180.0) / Math.PI < 180 ? 6 : -6;
        })
        .style("text-anchor", function(d) {
          return (d.x * 180.0) / Math.PI < 180 ? "end" : "start";
        })
        .attr("transform", function(d) {
          return (d.x * 180.0) / Math.PI < 180
            ? "translate(" + (d.data.target.length + 50) + ")"
            : "rotate(180)translate(-" + (d.data.target.length + 50) + ")";
        })
        .text(function(d) {
          return d.data.target;
        })
        .attr("class", function(d) {
          return "jiraTicketlabels jiraTicketFor-" + d.data.target;
        });

      svgCircles
        .append("text")
        .attr("dy", "-1em")
        .attr("x", function(d) {
          return 0;
        })
        .style("text-anchor", function(d) {
          return (d.x * 180.0) / Math.PI < 180 ? "start" : "end";
        })
        .attr("transform", function(d) {
          return (d.x * 180.0) / Math.PI < 180
            ? "translate(" + (d.data.target.length + 50) + ")"
            : "rotate(180)translate(-" + (d.data.target.length + 50) + ")";
        })
        .text(function(d) {
          return d.data.target;
        })
        .attr("class", function(d) {
          return "jiraTicketlabels jiraTicketFor-" + d.data.target;
        });

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

      svgCircles
        .merge(svgCircleEnter)
        .transition()
        .duration(100)
        .attr("transform", d => {
          const yOffset = d.height === 0 ? 650 : 100;
          return `
  rotate(${(d.x * 180) / Math.PI - 90})
  translate(${d.y - yOffset},0)
  `;
        });

      var sampleID = nodes.filter(node => node.depth === 1)[0].data.target;

      d3.select(".sampleAfterFilterLabel")
        .text(function(d) {
          return (sampleID.length <= 6 ? " " : "  ") + sampleID;
        })
        .attr("font-size", function(d) {
          return sampleID.length >= 7 ? "200px" : "300px";
        });

      d3.select(".foreignObject").raise();
    }
  }, [analyses]);

  useEffect(() => {
    if (!isLoading & (filters.length === 0)) {
      var tooltip = appendToolTip(mainSvg);
      mainSvg.call(tooltip);
      var data = analyses;
      mainSvg
        .selectAll(
          ".allCircleNodes, .lines, .directLabel, .node-label, path, .legendDescription"
        )
        .remove();

      var dataHasLabelNodes =
        analyses[0].children.filter(child => child.__typename === "label")
          .length !== 0;

      const modifiedData = !dataHasLabelNodes
        ? appendLegendNode(analyses[0], true)
        : data[0];

      var root = createRoot(d3.hierarchy(modifiedData));
      var nodes = root.descendants();
      var links = root.links();

      d3.select(".sampleAfterFilterLabel").text("");

      appendSvgLines(mainSvg, links);
      var vizChange = handleFilterChange;

      const svgCircles = mainSvg
        .append("g")
        .attr("class", "allCircleNodes")
        .selectAll("circle")
        .data(nodes, function(d) {
          return d.data.depth === 0 ? "parent" : d.data.source;
        })
        .enter()
        .append("g");

      function originalRadius(d) {
        if (d.depth === 0) {
          return 1400;
        } else if (d.depth === 1 || d.depth === 2) {
          return 20;
        } else {
          return 15;
        }
      }
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
        .attr("r", originalRadius)
        .attr("class", function(d) {
          if (d.depth === 0) {
            return "parent-project node-" + d.data.target;
          } else if (d.data.__typename !== "label") {
            return "node-" + d.data.target;
          } else {
            return "node-label";
          }
        });

      var cirlceElementCordinates = [];
      var drawingAreaBounds = mainSvg
        .select(".allCircleNodes")
        .node()
        .getBoundingClientRect();
      var xScale = d3
        .scaleLinear()
        .domain([drawingAreaBounds.x, drawingAreaBounds.right])
        .range([-3250, 3250]);
      var yScale = d3
        .scaleLinear()
        .domain([drawingAreaBounds.y, drawingAreaBounds.bottom])
        .range([-3250, 3250]);

      mainSvg.selectAll(".g-node circle").each(function(element, index) {
        var box = this.getBoundingClientRect();
        cirlceElementCordinates.push({
          x: xScale(box.x + box.width / 2),
          y: yScale(box.y + box.height / 2),
          element: element
        });
      });

      mainSvg
        .append("g")
        .attr("class", "voronoi-group")
        .selectAll("path")
        .data(voronoid(cirlceElementCordinates).polygons())
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
          //find road to node and roads to all children
          if (currNode.data.__typename !== "label") {
            var nodeSelections = getSelectionPath(currNode, ".node-");
            var linkSelections = getSelectionPath(currNode, ".link-");

            greyOutAllNodes(data.data.target);
            linkSelect(linkSelections);
            nodeSelect(nodeSelections);

            removeLegendLabels();

            d3.select(".parent-project")
              .classed("hover", false)
              .classed("greyedNodes", false)
              .classed("parent-hover", true);

            appendPanelText(currNode, mainSvg);
          }
        })
        .on("mouseout", (data, index, element) => {
          var currNode = data.data.element;
          if (filters.length === 0 && currNode.data.__typename !== "label") {
            tooltip.hide();
            var nodeSelections = getSelectionPath(currNode, ".node-");
            var linkSelections = getSelectionPath(currNode, ".link-");

            mainSvg
              .selectAll(nodeSelections)
              .transition()
              .attr("transform", d => {
                if (d.depth !== 1) {
                  return `
                    translate(0,0)
                  `;
                }
              })
              .attr("r", originalRadius);

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
            var currNode = data.data.element;
            if (
              currNode.data.__typename !== "label" &&
              currNode.parent !== null
            ) {
              d3.selectAll(".level1Label, .level2Label, .level3Label").text("");

              var type = currNode.depth === 1 ? "sample_id" : "library_id";
              vizChange({ value: currNode.data.target, label: type }, "update");
            }
          },
          this
        );

      var directLabel = svgCircles.filter(function(d) {
        return d.data.__typename === "label";
      });
      directLabel
        .filter(d => {
          return d.depth !== 1;
        })
        .append("rect")
        .attr("x", function(d) {
          return d.depth === 2 ? -d.data.target.length * 5 : 400;
        })
        .attr("dy", "1em")
        .attr("width", d => d.data.target.length * 50)
        .attr("height", 150)
        .attr("fill", "#2b2a2a")
        .attr("transform", function(d) {
          if (d.depth === 2 || d.depth === 3) {
            return (
              "translate(135,135),rotate(" +
              (d.x < 180 ? d.x + 92 : d.x - 90) +
              ")"
            );
          } else {
            return "rotate(" + d.x + ")";
          }
        });

      directLabel
        .append("svg:text")
        .attr("dy", "1em")
        .attr("x", 400)
        .style("text-anchor", d =>
          d.x < 180 === !d.children ? "start" : "end"
        )
        .attr("transform", d => {
          if (d.depth === 2 || d.depth === 3) {
            return (
              "translate(135,135),rotate(" +
              (d.x < 180 ? d.x + 92 : d.x - 90) +
              ")"
            );
          } else {
            return "rotate(" + d.x + ")";
          }
        })
        .text(d => d.data.target)
        .classed("directLabel", true);

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

      function autoBox() {
        const { x, y, width, height } = this.getBBox();
        return [
          x,
          y,
          width + displayConfig.rootSize / 2,
          height + displayConfig.rootSize / 2
        ];
      }
      mainSvg.attr("viewBox", autoBox).attr("transform", "translate(10,100)");
      //  mainSvg.attr("viewBox", autoBox).attr("transform", "translate(150,100)");
    }
  }, [analyses]);

  return (
    <Grid
      container
      direction="row"
      justify="left"
      alignItems="left"
      key={"circles-container"}
    >
      <GraphContainer id="circles" ref={graphRef} key={"circles-div"} />{" "}
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
