import * as d3 from "d3";
import textures from "textures";
export const voronoiFormat = (data, offset) =>
  data.map(node => {
    return {
      x: node.x + offset,
      y: node.y + window.innerHeight / 4 + offset,
      parent: node.data.parent,
      name: node.data.name
    };
  });

export var textureLine = textures
  .lines()
  .orientation("vertical", "horizontal")
  .size(4)
  .strokeWidth(1)
  .shapeRendering("crispEdges");
export const insertLinebreaks = function(d) {
  var element = d3.select(this);
  if (d.data.name.length > 13) {
    element.text(d.data.name.substring(0, 8) + "-");
    for (var i = 8; i < d.data.name.length; i++) {
      var xVar = ((d.data.name.length > 15 ? 8 : 7) - (i % 8)) * 9 - 40;
      var tspan = element
        .append("tspan")
        .attr("y", parseFloat(element.attr("dy")) + Math.floor(i / 8) * 12)
        .attr("x", parseFloat(element.attr("dx")) - xVar)
        .text(d.data.name[i]);
    }
  }
};

export const nestedNotation = data =>
  d3
    .hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => a.value - b.value);

export const color = d3.scaleOrdinal(d3.range(3), [
  "#c8f7c5",
  "#59abe3",
  "#fcd670"
]);
export const projectCenterScale = d3
  .scalePoint()
  .padding(0.3)
  .range([window.innerWidth * 0.3, window.innerWidth * 0.5]);

export const centerScale = d3
  .scalePoint()
  .padding(0.5)
  .range([window.innerWidth * 0.3, window.innerWidth * 0.7]);

const pack = d3.pack().size([window.innerWidth * 0.7, window.innerHeight]);
const projectPack = d3
  .pack()
  .size([window.innerWidth * 0.5, window.innerHeight]);
export const packNodes = (nodes, depth, isPerProjectView) =>
  isPerProjectView
    ? projectPack(nodes)
        .descendants()
        .filter(d => d.depth === depth)
        .sort((a, b) => a.value - b.value)
    : pack(nodes)
        .descendants()
        .filter(d => d.depth === depth)
        .sort((a, b) => a.value - b.value);

export const getClusters = data => {
  const clusters = new Array(data.length);

  data.map(project => {
    const i = data.indexOf(project);
    if (!clusters[i] || project.r > clusters[i].r) {
      clusters[i] = project;
    }
  });
  return clusters;
};
export const voronoi = d3
  .voronoi()
  .x(d => d.x)
  .y(d => d.y)
  .extent([[0, 0], [window.innerWidth * 0.6, window.innerHeight]]);

export const unSelectedType = (name, type) =>
  d3.selectAll("circle").filter(function() {
    return !this.classList.contains(name + type);
  });
export const selectedType = (name, type) =>
  d3.selectAll("circle").filter(function() {
    return this.classList.contains(name + type);
  });

export const unhighlightAll = () => {
  d3.selectAll("circle").attr("opacity", 1);
  d3.selectAll(".parentText").style("fill", "#616163ab");
};

export const appendProjectLabels = clusters => {
  var text = d3
    .select(".bubbles")
    .append("g")
    .attr("class", "projectLabels");
  clusters.children.map(child => {
    text
      .append("text")
      .attr("class", child.data.name + "-parentText parentText")
      .style("text-anchor", "middle")
      .attr("x", child.x)
      .attr("y", child.y)
      .text(child.data.name)
      .style("font-size", "24px")
      .style("font-weight", "500")
      .style("fill", "#616163ab");
  });
};
export const highlightProjectName = projectName =>
  d3.select("." + projectName + "-parentText").style("fill", "black");

export const highlightType = (name, type) =>
  unSelectedType(name, type).attr("opacity", 0.1);
export const highlightProject = (name, project) =>
  unSelectedType(name, project).attr("opacity", 0.4);
export const highlightSample = (name, project) =>
  selectedType(name, project).attr("opacity", 1);

export const clustering = (data, alpha, clusters) => {
  return data.map(node => {
    const cluster = clusters[data.indexOf(node)];
    var k = 0.1 * Math.sqrt(node.r);
    if (cluster === node) return;
    var x = node.x - cluster.x,
      y = node.y - cluster.y,
      l = Math.sqrt(x * x + y * y),
      r = node.r + cluster.r;
    if (l !== r) {
      l = ((l - r) / l) * alpha * k;
      node.x -= x *= l;
      node.y -= y *= l;
      cluster.x += x;
      cluster.y += y;
    }
  });
};
//color(d.parent.data.name)
export const ticked = (data, node, tickedChart) => {
  tickedChart
    .attr("r", d => d.r)
    .attr("cx", d => Math.max(d.r, Math.min(window.innerWidth - d.r, d.x)))
    .attr("cy", d => d.y);

  tickedChart.exit().remove();
};
