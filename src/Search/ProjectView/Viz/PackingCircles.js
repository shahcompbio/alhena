import React, { PureComponent } from "react";
import { config } from "../../../config/config";
import * as d3 from "d3";
import * as d3Tip from "d3-tip";
import { forceAttract } from "d3-force-attract";
import { forceManyBodyReuse } from "d3-force-reuse";
import styled from "@emotion/styled";
import { mouseleave, partition, arc, format, radius, x, y } from "./burst.js";
import {
  nestedNotation,
  packNodes,
  getClusters,
  centerScale,
  projectCenterScale,
  clustering,
  ticked,
  highlightProject,
  unhighlightAll,
  voronoi,
  voronoiFormat,
  color
} from "./circles.js";
import {
  getSelectionString,
  getCurrentLargestFilter,
  getAnimationStages,
  mergeDataNodes,
  transitionDataNodes,
  updateDataNodes,
  updateSimulation,
  animationStageExist,
  setSunburstPointerEvents,
  setBubblesPointerEvents,
  hideSunburst,
  showSunburst
} from "./utils.js";
import Grid from "@material-ui/core/Grid";
const displayConfig = config.DisplayConfig;

class PackingCircles extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hasBeenUpdated: false,
      previousDataTree: null,
      previousLargestFilter: null,
      stages: null
    };
    this.bubbleChart = this.bubbleChart.bind(this);
    this.forceProjectSimulation = this.forceProjectSimulation.bind(this);
    //this.getCenter = this.getCenter.bind(this);
    //this.expandProject = this.expandProject.bind(this);
    //this.revertLevels = this.revertLevels.bind(this);
  }

  bubbleChart = data => {
    var nested = nestedNotation({ name: "flare", children: data });
    var packedNodes = packNodes(nested, 2, false);
    const clusters = getClusters(packedNodes);
    var simulation = this.forceProjectSimulation(nested, packedNodes, clusters);
    return simulation;
  };

  voronoiTick = data => {
    var tip = d3Tip
      .default()
      .attr("class", "d3-tip")
      .html(function(d) {
        return d;
      });
    //this.state.mainSvg.call(tip);
    this.state.mainSvg
      .selectAll(".sampleWrapper circle")
      .on("mouseover", function(d) {
        //tip.hide();
        //tip.show(d.data.name, this);
        //  highlightType(d.data.name, "-sample");
      })
      .on("mouseleave", function(d) {
        //tip.hide(d.data.name, this);
      });
    var formattedData = voronoiFormat(data, 0);
    const { voronoiSvg } = this.state;
    voronoiSvg.call(tip);
    voronoiSvg
      .selectAll("path")
      .data(voronoi(formattedData).polygons())
      .enter()
      .append("path")
      .attr("class", "voronoi");

    voronoiSvg
      .selectAll("path")
      .attr("d", d => (d ? "M" + d.join("L") + "Z" : null))
      .attr("class", d => {
        return d ? d.data.name + "-voronoi" : "";
      })
      //.style("stroke", "#2074A0")
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function(d) {
        var e = d3.event;
        var prev = this.style.pointerEvents;
        this.style.pointerEvents = "none";

        var el = document.elementFromPoint(d3.event.x, d3.event.y);

        var e2 = document.createEvent("MouseEvent");
        e2.initMouseEvent(
          e.type,
          e.bubbles,
          e.cancelable,
          e.view,
          e.detail,
          e.screenX,
          e.screenY,
          e.clientX,
          e.clientY,
          e.ctrlKey,
          e.altKey,
          e.shiftKey,
          e.metaKey,
          e.button,
          e.relatedTarget
        );

        el.dispatchEvent(e2);

        this.style.pointerEvents = prev;
        highlightProject(d.data.parent.replace(/[^\w\s]/gi, ""), "-parent");
      })
      .on("mouseleave", d => {
        tip.hide();
        unhighlightAll(d);
      })
      .on(
        "mousedown",
        d => {
          this.props.handleVizChange(d.data.parent, "project", "enterProject");
        },
        this
      );
  };

  forceProjectSimulation = (nested, data, clusters) => {
    var isPerProjectView = this.props.filters.length > 0;
    isPerProjectView
      ? projectCenterScale.domain(data.map(d => d.data.parent))
      : centerScale.domain(data.map(d => d.data.parent));
    const simulation = this.state.simulation;

    var tickedChart = this.state.mainSvg
      .selectAll("circle")
      .data(data, function(d) {
        return d.data.name + d.data.parent;
      })
      .enter();

    tickedChart = tickedChart
      .append("circle")
      .attr("class", "circles")
      .attr("class", d => {
        return (
          d.parent.data.name.replace(/[^\w\s]/gi, "") +
          "-parent " +
          d.data.name +
          "-sample"
        );
      })
      .merge(tickedChart)
      .attr("fill", d => {
        return color(d.parent.data.name);
      })
      .style("stroke", function(d, i) {
        return "black";
      })
      .style("stroke-width", "2px")
      .attr("r", d => d.r)
      .attr("cx", d => Math.max(d.r, Math.min(window.innerWidth - d.r, d.x)))
      .attr("cy", d => d.y);

    simulation
      .nodes(data)
      .force("charge", forceManyBodyReuse().strength(0.02))
      .force(
        "collision",
        d3
          .forceCollide()
          .radius(d => d.r + 3)
          .iterations(2)
      )
      .force(
        "x",
        d3
          .forceX()
          .strength(0.05)
          .x(d => {
            return isPerProjectView
              ? projectCenterScale(d.data.parent)
              : centerScale(d.data.parent);
          })
      )
      .force(
        "y",
        d3
          .forceY()
          .strength(0.05)
          .y(d => {
            return d.parent.data.name.localeCompare("DLP") === 0
              ? d.y / 10 - displayConfig.yOffset
              : d.y / 10;
          })
      )
      .alphaDecay(0.1)
      .alphaTarget(0.008)
      .force("cluster", function() {
        clustering(data, 0.2, clusters);
      })
      .force(
        "center",
        d3
          .forceCenter()
          .x(window.innerWidth / 3.5)
          .y(window.innerHeight / 4)
      )
      .force(
        "attract",
        forceAttract()
          .target([window.innerWidth / 2, window.innerHeight / 2])
          .strength(0.05)
      )
      .force("charge", d3.forceManyBody().strength(1));

    simulation.on(
      "tick",
      d => {
        ticked(data, this.state.mainSvg, tickedChart);
        this.voronoiTick(data);
      },
      this
    );
    return simulation;
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    var state,
      stages = null,
      hasBeenUpdated = false;

    if (nextProps.analyses && !nextProps.isLoading) {
      if (prevState.simulation && prevState.previousDataTree) {
        var currLargestFilter = getCurrentLargestFilter(nextProps.filters);
        var previousLargestFilter = prevState.previousLargestFilter
          ? prevState.previousLargestFilter
          : "none";

        stages = getAnimationStages(currLargestFilter, previousLargestFilter);
        var nested = nestedNotation({
          name: "flare",
          children: nextProps.analyses
        });
        var packedNodes = packNodes(nested, 2, true);
        const clusters = getClusters(packedNodes);
        var simulation = prevState.simulation;

        simulation.stop();
        if (animationStageExist(stages, 0)) {
          //if the second stage does not exist remove the sunburst
          if (!animationStageExist(stages, 2)) {
            setBubblesPointerEvents();
            hideSunburst();
            var sunburst = prevState.sunburstSvg;
            sunburst.selectAll("path").data(null);
            prevState.sunburstSvg.selectAll("g > *").remove();
          }
          //update
          var circles = updateDataNodes(prevState, packedNodes);
          prevState.voronoiSvg.selectAll("*").remove();
          setTimeout(() => {
            circles = mergeDataNodes(circles);
            transitionDataNodes(circles, stages, prevState.mainSvg);
            updateSimulation(
              simulation,
              packedNodes,
              circles,
              prevState,
              stages
            );

            if (animationStageExist(stages, 1)) {
              setSunburstPointerEvents();
              var selection = prevState.mainSvg.selectAll("circle");
              selection.transition().attr("r", radius / 5);
              showSunburst();
              selection
                .transition(1000)
                .delay(500)
                .ease(d3.easeBounce)
                .attr("cx", displayConfig.sunburstXOffset)
                .attr("r", radius)
                .delay(800)
                .transition()
                .duration(500)
                .style("opacity", 0.0);

              /*  selection
                .transition()
                .attr("stroke-width", 20)
                .attr("r", radius)
                .transition()
                .duration(1000)
                .attr("stroke-width", 0.1)
                .attr("r", 200)
                .attr("fill", "none")
                .ease(d3.easeSinInOut);*/
              //SVG filter for the gooey effect
              //Code from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
            }
            if (animationStageExist(stages, 2)) {
              var root = partition({
                parent: null,
                children: nextProps.analyses
              });
              var node = prevState.sunburstSvg;

              if (prevState.hasBeenUpdated) {
                var node = node
                  .selectAll("path")
                  .data(root.descendants())
                  .enter();
                var newNode = node
                  .append("path")
                  .attr("fill", d => {
                    var colour;
                    if (d.parent) {
                      colour = d;
                      [...Array(d.depth)].forEach(depth => {
                        colour = colour.parent;
                      });
                      colour = color(colour.data.children[0].name);
                    } else {
                      colour = "white";
                    }
                    return colour;
                  })
                  .merge(node)
                  .on("click", clicked);

                newNode
                  .selectAll("path")
                  .transition()
                  .duration(1000)
                  .attrTween("d", arcTweenData);
                newNode
                  .append("g")
                  .selectAll("text")
                  .data(root.descendants())
                  .join("text")
                  .attr("dy", "0.35em")
                  .attr("stroke", "black")
                  .attr("stroke-width", 0.2);

                newNode
                  .selectAll("text")
                  .transition()
                  .duration(1000)
                  .attrTween("transform", arcTweenText)
                  .text(d => {
                    console.log("text");
                    return d.data.name;
                  })
                  .attr("opacity", function(d) {
                    return d.x1 - d.x0 > 0.01 ? 1 : 0;
                  });
              } else {
                node.on("mouseleave", mouseleave);
                node.attr("stroke", "white");

                node
                  .selectAll("path")
                  .data(root.descendants())
                  .join("path")
                  .attr("fill", d => {
                    var colour;
                    if (d.parent) {
                      colour = d;
                      [...Array(d.depth)].forEach(depth => {
                        colour = colour.parent;
                      });
                      colour = color(colour.data.children[0].name);
                    } else {
                      colour = "white";
                    }
                    return colour;
                  })
                  .on("click", clicked);
                /*.append("title")
                  .text(
                    d =>
                      `${d
                        .ancestors()
                        .map(d => d.data.name)
                        .reverse()
                        .join("/")}\n${format(d.value)}`
                  );*/
              }

              node
                .append("g")
                .selectAll("text")
                .data(root.descendants())
                .join("text")
                .attr("dy", "0.35em")
                .attr("stroke", "black")
                .attr("stroke-width", 0.2);

              node
                .selectAll("text")
                .transition()
                .duration(1000)
                .attrTween("transform", arcTweenText)
                .text(d => d.data.name)
                .attr("opacity", function(d) {
                  return d.x1 - d.x0 > 0.01 ? 1 : 0;
                });

              node
                .selectAll("path")
                .transition()
                .duration(1000)
                .attrTween("d", arcTweenData);

              function arcTweenText(a, i) {
                var oi = d3.interpolate(
                  {
                    x0: a.x0s ? a.x0s : 0,
                    x1: a.x1s ? a.x1s : 0,
                    y0: a.y0s ? a.y0s : 0,
                    y1: a.y1s ? a.y1s : 0
                  },
                  a
                );
                function tween(t) {
                  var b = oi(t);
                  var ang = (x((b.x0 + b.x1) / 2) - Math.PI / 2) / Math.PI;
                  b.textAngle = ang > 90 ? 180 + ang : ang;
                  a.centroid = arc.centroid(b);
                  return (
                    "translate(" +
                    arc.centroid(b) +
                    ")rotate(" +
                    b.textAngle +
                    ")"
                  );
                }
                return tween;
              }
              function arcTweenData(a, i) {
                var oi = d3.interpolate(
                  { x0: a.x0s ? a.x0s : 0, x1: a.x1s ? a.x1s : 0 },
                  a
                );
                function tween(t) {
                  var b = oi(t);
                  a.x0s = b.x0;
                  a.x1s = b.x1;
                  return arc(b);
                }
                if (i === 0) {
                  var xd = d3.interpolate(x.domain(), [root.x0, root.x1]);
                  return function(t) {
                    x.domain(xd(t));
                    return tween(t);
                  };
                } else {
                  return tween;
                }
              }

              function clicked(d) {
                node
                  .selectAll("text")
                  .transition()
                  .duration(1200)
                  .attrTween("transform", function(d, i) {
                    return arcTweenText(d, i);
                  })
                  .text(d => d.data.name)
                  .attr("opacity", function(e) {
                    return e.depth >= d.depth ? 1 : 0;
                  });
                node
                  .selectAll("path")
                  .transition()
                  .duration(1200)
                  .attrTween(
                    "d",
                    (function(d) {
                      var xd = d3.interpolate(x.domain(), [d.x0s, d.x1s]),
                        yd = d3.interpolate(y.domain(), [d.y0, 1]),
                        yr = d3.interpolate(y.range(), [d.y0 ? 40 : 0, radius]);
                      return function(d, i) {
                        return i
                          ? function(t) {
                              var arcs = arc(d);
                              return arcs;
                            }
                          : function(t) {
                              x.domain(xd(t));
                              y.domain(yd(t)).range(yr(t));
                              return arc(d);
                            };
                      };
                    })(d)
                  );
              }
            }
            simulation.alpha(1).restart();
          }, 550);
        }
        //going from jira/library id to sample/project or none
        if (animationStageExist(stages, 3)) {
        }
        hasBeenUpdated = true;
      }
      state = {
        previousDataTree: nextProps.analyses,
        hasBeenUpdated: hasBeenUpdated,
        previousLargestFilter: currLargestFilter
      };
    }
    return state;
  }

  componentDidMount() {
    var svg = d3
      .select(this._rootNode)
      .append("svg")
      .classed("bubbles", true)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr(
        "viewBox",
        "0 0 " + displayConfig.viewBoxX + " " + displayConfig.viewBoxY + " "
      )
      .attr("width", "100%")
      .attr("height", "100vh")
      .append("g")
      .attr("transform", "translate(0," + displayConfig.yOffset + ")");
    //  var defs = svg.append("defs");
    /*  var filter = defs.append("filter").attr("id", "gooey");
    filter
      .append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", "10")
      .attr("result", "blur");
    filter
      .append("feColorMatrix")
      .attr("in", "blur")
      .attr("mode", "matrix")
      .attr("values", "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7")
      .attr("result", "gooey");
    filter
      .append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "gooey")
      .attr("operator", "atop");*/

    var voronoiSvg = d3
      .select(".bubbles")
      .append("g")
      .attr("class", "voronoi");

    var sunburstSvg = d3
      .select(this._rootNode)
      .append("svg")
      .style("position", "absolute")
      .classed("sunburst", true)
      .attr(
        "viewBox",
        "0 0 " + displayConfig.viewBoxX + " " + displayConfig.viewBoxY + " "
      )
      .attr("width", "100%")
      .attr("height", "100vh")
      .append("g")
      .attr(
        "transform",
        "translate(" +
          displayConfig.sunburstXOffset +
          "," +
          displayConfig.sunburstYOffset +
          ")"
      );

    var simulation = d3.forceSimulation([]);

    this.setState({
      mainSvg: svg,
      voronoiSvg: voronoiSvg,
      simulation: simulation,
      sunburstSvg: sunburstSvg
    });
  }

  _setRef(componentNode) {
    this._rootNode = componentNode;
  }
  render() {
    const { hasBeenUpdated } = this.state;
    const { isLoading, analyses } = this.props;
    if (analyses && !isLoading && !hasBeenUpdated) {
      this.bubbleChart(analyses);
    }
    return (
      <Grid
        container
        direction="row"
        justify="left"
        alignItems="left"
        key={"packing-circles-container"}
      >
        <CircleContainer
          id="circles"
          ref={this._setRef.bind(this)}
          key={"packing-circles-div"}
        />{" "}
      </Grid>
    );
  }
}

const CircleContainer = styled("div")`
  display: inline-block;
  position: relative;
  width: 60vw;
  padding-bottom: 100%; /* aspect ratio */
  vertical-align: top;
  overflow: hidden;
`;

export default PackingCircles;
