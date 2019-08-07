import React, { Component } from "react";
import { config } from "../../../config/config.js";
import {
  mouseover,
  arcVisible,
  labelTransform,
  color,
  labelVisible
} from "./burst.js";
import * as d3 from "d3";
import { Query } from "react-apollo";
import { analysesBySampleID } from "../../../Queries/queries.js";
import { graphql } from "react-apollo";
import styled from "@emotion/styled";
import { mouseleave, partition, arc, format, radius, x, y } from "./burst.js";

import Grid from "@material-ui/core/Grid";
const displayConfig = config.DisplayConfig;

class Sunburst extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasBeenUpdated: false,
      previousDataTree: null,
      previousLargestFilter: null,
      stages: null
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    var state,
      stages = null,
      hasBeenUpdated = false;
    console.log(nextProps);
    if (nextProps.analyses && !nextProps.isLoading) {
      if (prevState.previousDataTree) {
        nextProps.analyses.forEach(function(d) {
          merge(d, 4);
        });
        console.log(nextProps.analyses);
        var root = partition({
          parent: null,
          children: nextProps.analyses
        });

        //root.children.forEach(collapse);

        console.log(root);
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

        function merge(d, level) {
          console.log(d);

          if (level > 1) {
            d._children = d.children;
            d.children = [
              d.children.reduce(
                (final, child) => {
                  if (child.hasOwnProperty("children")) {
                    final["children"] = final["children"]
                      ? [...final["children"], ...child["children"]]
                      : [...child["children"]];
                  } else {
                    final["value"] = 1;
                  }
                  final["parent"] = level === 4 ? child.parent : level + 1;
                  console.log(final);
                  return final;
                },
                { name: level }
              )
            ];
            d.children.forEach(function(d) {
              merge(d, level - 1);
            });
          }
        }
        function collapse(d) {
          if (d.children.length > 50) {
            d._children = d.children;
            d.children.forEach(collapse);

            console.log(d.children);
            d.children = 1;
          }
        }
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
              "translate(" + arc.centroid(b) + ")rotate(" + b.textAngle + ")"
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
      hasBeenUpdated = true;
    }
    return {
      previousDataTree: nextProps.analyses,
      hasBeenUpdated: hasBeenUpdated
    };
  }
  componentDidMount() {
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

    this.setState({
      voronoiSvg: voronoiSvg,
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
        <div
          id="circles"
          ref={this._setRef.bind(this)}
          key={"packing-circles-div"}
        />{" "}
      </Grid>
    );
  }
}

const SunburstWrapper = styled("div")`
  width: 70vw;
  float: right;
`;
export default Sunburst;
