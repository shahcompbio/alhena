import React, { PureComponent } from "react";
import { config } from "../../../config/config";
import * as d3 from "d3";

import Grid from "@material-ui/core/Grid";
import { styled } from "@material-ui/styles";
import {
  appendGlowFilter,
  appendToolTip,
  initSvg,
  appendSimulation,
  greyOutAllNodes,
  raiseLabels,
  removeAllPreviousContent,
  linkSelect,
  linkDeselect,
  nodeSelect,
  nodeDeselect,
  greySelection,
  ungreySelection,
  appendLegend,
  appendLegendGlowFilter,
  greyOutJiraLabels,
  ungreyOutJiraLabels
} from "./utils";
const displayConfig = config.DisplayConfig;

class PackingCircles extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      highlightedNodes: null,
      highlightedLinks: null,
      hasBeenUpdated: false,
      root: null
    };
    this.graphChart = this.graphChart.bind(this);
  }
  appendLegendNode = (data, isMainDraw) => {
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
  graphChart = (data, hasBeenUpdated) => {
    this.state.mainSvg
      .selectAll(
        ".group-node, .lines, .directLabel, .node-label, path, .legendDescription"
      )
      .remove();

    var isMainView = this.props.filters.length === 0;
    var dataHasLabelNodes =
      data[0].children.filter(child => child.__typename === "label").length !==
      0;

    if (isMainView && !dataHasLabelNodes) {
      var modifiedData = this.appendLegendNode(data[0], isMainView);
      var cluster = d3.hierarchy(modifiedData);
    } else {
      var cluster = d3.hierarchy(data[0]);
    }

    var root = d3
      .cluster()
      .separation(function(a, b) {
        return (a.parent == b.parent ? 2 : 1) / a.depth;
      })
      .size([2 * Math.PI, 3000])(cluster);

    if (isMainView) {
      var nodes = root.descendants().filter(function(d) {
        return d.height !== 0;
      });

      var links = root.links().filter(function(d) {
        return d.target.height !== 0;
      });
      d3.select(".sampleAfterFilterLabel").text("");

      var svgLines = this.state.mainSvg
        .append("g")
        .attr("fill", "none")
        .attr("stroke", "black")
        .classed("lines", true)
        .selectAll("path")
        .data(links, d => d.id)
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
      var toolTip = this.state.tip;
      var vizChange = this.props.handleFilterChange;

      const svgCircles = this.state.mainSvg
        .selectAll(".node")
        .data(nodes)
        .enter()
        .append("g");

      svgCircles.attr("class", "group-node").attr("transform", d => {
        var xOffset = 0;
        var yOffset = 0;
        if (d.depth === 0 && isMainView) {
          xOffset = 0;
          yOffset = -800;
        }
        return `
  rotate(${((d.x + displayConfig.filtersOffSet) * 180) / Math.PI - 90})
    translate(${d.y + displayConfig.filtersOffSet + yOffset},${xOffset})
  `;
      });

      var initViz = this.props.handleVizChange;
      svgCircles
        .append("circle")
        .attr("fill", function(d) {
          if (d.depth === 0) {
            return "#212121";
          } else {
            return "white";
          }
        })
        .attr("r", function(d) {
          if (d.depth === 0) {
            return 1400;
          } else if (d.depth === 1 || d.depth === 2) {
            return 20;
          } else {
            return 0;
          }
        })
        .attr("class", function(d) {
          if (d.depth === 0) {
            return "parent-project node-" + d.data.target;
          } else if (d.height !== 0 && d.data.__typename !== "label") {
            return "node-" + d.data.target;
          } else if (d.data.__typename === "label") {
            return "node-label";
          }
        })
        .on("mouseover", (data, index, element) => {
          if (
            this.props.filters.length === 0 &&
            data.parent !== null &&
            data.data.__typename !== "label"
          ) {
            greyOutAllNodes(data.data.target);
            nodeSelect(element[index]);
            linkSelect("path.link-" + data.data.target);
            d3.selectAll(".legendDescription").remove();
            if (data.parent && data.parent.parent) {
              nodeSelect("circle.node-" + data.parent.data.target);
              linkSelect("path.link-" + data.parent.data.target);
              d3.select(".sampleIDLabel").text(
                "Sample - " + data.parent.data.target
              );
              d3.select(".libraryInfoIDLabel").text(
                "Library   | " + data.data.target
              );
              d3.select(".jiraInfoIDLabel").text(
                "Jira Tickets | " + data.parent.data.target.length
              );
            } else if (data.children) {
              data.children.map(child => {
                nodeSelect("circle.node-" + child.data.target);
                linkSelect("path.link-" + child.data.target);
              });
              d3.select(".sampleIDLabel").text(
                "Sample   - " + data.data.target
              );
              d3.select(".libraryInfoIDLabel").text(
                "Libraries    | " + data.children.length
              );
              d3.select(".jiraInfoIDLabel").text(
                "Jira Tickets | " + data.children.length
              );
            }

            d3.select(".parent-project")
              .classed("hover", false)
              .classed("greyedNodes", false)
              .classed("parent-hover", true);
          }
          if (data.depth !== 0) {
            //  toolTip.show(data, element[index]);
          }
        })
        .on("mouseout", (data, index, element) => {
          if (
            this.props.filters.length === 0 &&
            data.data.__typename !== "label"
          ) {
            ungreySelection("circle, path.visible");

            ungreySelection(element[index]);

            linkDeselect("path.link-" + data.data.target);
            if (data.children) {
              data.children.map(child => {
                linkDeselect("path.link-" + child.data.target);
              });
            }

            if (data.parent && data.parent.parent) {
              nodeDeselect("circle.node-" + data.parent.data.target);
              linkDeselect("path.link-" + data.parent.data.target);
            }
            d3.selectAll(
              ".sampleIDLabel, .libraryInfoIDLabel, .jiraInfoIDLabel "
            ).text("");
          }
          //  toolTip.hide();
        })
        .on(
          "mousedown",
          (data, index, element) => {
            if (data.data.__typename !== "label" && data.parent !== null) {
              d3.selectAll(
                ".sampleIDLabel, .libraryInfoIDLabel, .jiraInfoIDLabel"
              ).text("");
              var type = data.depth === 1 ? "sample_id" : "library_id";
              vizChange({ value: data.data.target, label: type }, "update");
            }
          },
          this
        );

      var directLabel = svgCircles.filter(function(d) {
        return d.data.__typename === "label" && d.height !== 0;
      });

      directLabel
        .append("svg:text")
        .attr("dy", "1.2em")
        .attr("x", function(d) {
          return 400;
        })
        .style("text-anchor", function(d) {
          return d.x < 180 === !d.children ? "start" : "end";
        })
        .attr("transform", function(d) {
          if (d.depth === 2) {
            return (
              "translate(140,140),rotate(" +
              (d.x < 180 ? d.x + 90 : d.x - 90) +
              ")"
            );
          } else {
            return "rotate(" + (d.x < 180 ? d.x : d.x) + ")";
          }
        })
        .text(function(d) {
          return d.data.target;
        })
        //.classed("jiraLabelTitle", true)
        .classed("directLabel", true);

      var circleText = svgCircles.filter(function(d) {
        return d.parent === null;
      });
      var mainCircleDim = circleText.node().getBBox();

      if (d3.select(".foreignObject").size() === 0) {
        var labelForeignObject = this.state.mainSvg
          .append("foreignObject")
          .attr("height", mainCircleDim.height)
          .attr("width", mainCircleDim.width / 2)
          .attr("x", mainCircleDim.x + mainCircleDim.width / 4)
          .attr("y", mainCircleDim.y)
          .classed("foreignObject", true);

        var labelSvg = labelForeignObject
          .append("svg")
          .attr("height", mainCircleDim.height)
          .attr("width", mainCircleDim.width / 2);

        //appendLegendGlowFilter(labelSvg, true);
        appendLegend(labelSvg, mainCircleDim);
      } else {
        d3.select(".foreignObject").raise();
      }

      function autoBox() {
        const { x, y, width, height } = this.getBBox();
        return [x - 500, y - 500, width + 3000, height + 3000];
      }
      this.state.mainSvg
        .attr("viewBox", autoBox)
        .attr("transform", "translate(100,100)");
    } else {
      var nodes = root.descendants();
      var links = root.links();

      var svgCircles = this.state.mainSvg.selectAll(".node").data(nodes);
      var svgLines = this.state.mainSvg
        .append("g")
        .attr("fill", "none")
        .attr("stroke", "black")
        .classed("lines", true)
        .selectAll("path")
        .data(links, (data, id, element) => id);

      var svgEnter = svgCircles
        .enter()
        .append("g")
        .attr("class", "group-node");

      var svgLinesEnter = svgLines
        .enter()
        .append("g")
        .attr("class", "group-line");

      svgLinesEnter
        .append("path")
        .attr("stroke", "white")
        .attr("stroke-width", function(d) {
          if (d.target) {
            if (d.target.depth === 1 || d.target.height === 0) {
              return 50;
            } else {
              return 0;
            }
          }
        })
        .attr("class", function(d) {
          return "visible link-" + d.target.data.target;
        })
        .attr(
          "d",
          d3
            .linkRadial()
            .angle(d => d.x)
            .radius(d => d.y)
        );

      svgEnter
        .append("circle")
        .attr("fill", function(d) {
          return d.depth === 0 ? "#2b2a2a" : "white";
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
        .on("mouseover", (data, index, element) => {
          if (data.height === 1 || data.height === 0) {
            greyOutAllNodes(data.data.target);
            greyOutJiraLabels(data.data.target);
            nodeSelect(element[index]);
            linkSelect("path.link-" + data.data.target);
            if (data.children) {
              data.children.map(child => {
                linkSelect("path.link-" + child.data.target);
                nodeSelect("text.jiraTicketFor-" + child.data.target);
                nodeSelect(".node-" + child.data.target);
              });

              d3.select(".libraryAfterFilterLabel").text(
                "Library - " + data.data.target
              );
              d3.select(".jiraAfterFilterLabel").text(
                " Jira Tickets - " + data.data.children.length
              );
            } else {
              linkSelect("path.link-" + data.data.source);
              d3.select(".libraryAfterFilterLabel").text(
                " Library - " + data.data.source
              );
              d3.select(".jiraAfterFilterLabel").text(
                " Tickets - " + data.data.target
              );
            }
          }
        })
        .on("mouseout", (data, index, element) => {
          if (data.height === 1 || data.height === 0) {
            ungreySelection("circle, path.visible");
            ungreySelection(element[index]);
            ungreyOutJiraLabels();
            linkDeselect(
              "path.link-" + data.data.target + ", .link-" + data.data.source
            );
            ungreySelection("jiraTicketFor-" + data.data.target);
            d3.select(".libraryAfterFilterLabel").text("");
            d3.select(".jiraAfterFilterLabel").text("");
            if (data.children) {
              data.children.map(child => {
                nodeDeselect("text.jiraTicketFor-" + child.data.target);

                linkDeselect("path.link-" + child.data.target);
              });
            }
          }
        })
        .attr("class", function(d) {
          if (d.depth === 0) {
            return "parent-project node-" + d.data.target;
          } else if (d.height === 0 || d.height === 1) {
            return "node-" + d.data.target;
          }
        });

      svgEnter
        .append("circle")
        .filter(node => node.height === 0)
        .attr("fill", function(d) {
          return "none";
        })
        .attr("r", 40)
        .attr("class", function(d) {
          return "jiraTicketLabelsOutterRing jiraTicketFor-" + d.data.target;
        });

      svgEnter
        .filter(node => node.height === 1 || node.height === 0)
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

      var lineUpdate = svgLines.merge(svgLinesEnter);
      function radialPoint(x, y) {
        return [(y = +y) * Math.cos((x -= Math.PI / 2)), y * Math.sin(x)];
      }

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
        .merge(svgEnter)
        .transition()
        .duration(100)
        .attr("transform", d => {
          return `
  rotate(${(d.x * 180) / Math.PI - 90})
    translate(${d.y},0)
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
  };
  componentDidMount() {
    var svg = initSvg(this._rootNode);

    appendGlowFilter(svg);
    var tip = appendToolTip(svg);
    var labelGroup = svg.append("g").classed("jiraLabelGroup", true);
    this.setState({
      mainSvg: svg,
      tip: tip,
      labelGroup: labelGroup
    });
  }

  _setRef(componentNode) {
    this._rootNode = componentNode;
  }
  render() {
    const { hasBeenUpdated } = this.state;
    const { isLoading, analyses } = this.props;
    if (analyses && !isLoading) {
      this.graphChart(analyses, hasBeenUpdated);
    }

    return (
      <Grid
        container
        direction="row"
        justify="left"
        alignItems="left"
        key={"circles-container"}
      >
        <GraphContainer
          id="circles"
          ref={this._setRef.bind(this)}
          key={"circles-div"}
        />{" "}
      </Grid>
    );
  }
}

const GraphContainer = styled("div")`
  display: inline-block;
  position: relative;
  width: 80vw;
  padding-bottom: 100%;
  vertical-align: top;
  overflow: hidden;
`;

export default PackingCircles;
