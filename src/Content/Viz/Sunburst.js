import React, { Component } from "react";
import {
  mouseover,
  arcVisible,
  labelTransform,
  mouseleave,
  partition,
  color,
  arc,
  format,
  labelVisible,
  radius
} from "./burst.js";
import * as d3 from "d3";
import { Query } from "react-apollo";
import { analysesBySampleID } from "../../Queries/queries.js";
import { graphql } from "react-apollo";
import styled from "@emotion/styled";
const ipcRenderer = window.ipcRenderer;

class Sunburst extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  sunburst = (node, data) => {
    node.on("mouseleave", mouseleave);

    const root = partition(data);
    root.each(d => (d.current = d));

    var path = node
      .selectAll("path")
      .data(root.descendants())
      .join("path")
      .attr("fill", d => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr("fill-opacity", d =>
        arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attr("d", d => arc(d.current))
      .on("mouseover", mouseover);

    path
      .filter(d => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

    path.append("title").text(
      d =>
        `${d
          .ancestors()
          .map(d => d.data.name)
          .reverse()
          .join("/")}\n${format(d.value)}`
    );

    const label = node
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice())
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", d => +labelVisible(d.current))
      .attr("transform", d => labelTransform(d.current))
      .text(d => d.data.name);

    const parent = node
      .append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);

    function clicked(p) {
      parent.datum(p.parent || root);

      root.each(
        d =>
          (d.target = {
            x0:
              Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
              2 *
              Math.PI,
            x1:
              Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
              2 *
              Math.PI,
            y0: Math.max(0, d.y0 - p.depth),
            y1: Math.max(0, d.y1 - p.depth)
          })
      );

      const t = node.transition().duration(1200);

      path
        .transition(t)
        .tween("data", d => {
          const i = d3.interpolate(d.current, d.target);
          return t => (d.current = i(t));
        })
        .filter(function(d) {
          return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
        .attr("fill-opacity", d =>
          arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
        )
        .attrTween("d", d => () => arc(d.current), this);

      label
        .filter(function(d) {
          return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
        .transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attrTween("transform", d => () => labelTransform(d.current), this);
    }
    return node;
  };
  componentDidMount() {
    var svg = d3
      .select(this._rootNode)
      .append("svg")
      .classed("sunburst", true)
      .attr("width", "70vw")
      .attr("height", "100vh")
      .append("g")
      .attr("transform", "translate(500,500)");
    this.sunburst(svg, {
      name: "root",
      ...this.props.data[0]
    });
  }
  _setRef(componentNode) {
    this._rootNode = componentNode;
  }
  render() {
    return (
      <SunburstWrapper>
        <div id="sunburst" ref={this._setRef.bind(this)} />
      </SunburstWrapper>
    );
  }
}

const SunburstWrapper = styled("div")`
  width: 70vw;
  float: right;
`;
export default Sunburst;
