import * as d3 from "d3";
//sunburst taken from https://observablehq.com/@d3/zoomable-sunburst
//mouse over capabilities reworked from https://observablehq.com/@margretwg/d3-zoomable-sunburst

var width = 400;
var height = 400;
export var radius = Math.min(width, height) / 2;
export var x = d3.scaleLinear().range([0, 2 * Math.PI]);
export var y = d3.scaleLinear().range([0, radius]);
export const color = d3.scaleOrdinal(d3.schemeCategory10);
export const format = d3.format(",d");
export const partition = data => {
  const root = d3.hierarchy(data).sum(d => d.value);
  //.sort((a, b) => b.value - a.value);

  return d3.partition()(root);
  //return d3.partition().padding(2)(root);
};
var rscale = d3
  .scaleLinear()
  .domain([0, 0.2, 1.0])
  .range([0, 0.02, 1.0]);
export const arc = d3
  .arc()
  .startAngle(function(d) {
    return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
  })
  //.padAngle(10)
  //.padRadius(radius * 10)
  .endAngle(function(d) {
    return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
  })
  .innerRadius(function(d) {
    return rscale(Math.max(0, y(d.y0)));
  })
  .outerRadius(function(d) {
    return rscale(Math.max(0, y(d.y1)));
  })
  .cornerRadius(function(d) {
    return 10;
  });
/*  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
  .padRadius(radius * 1.5)
  .cornerRadius(function(d) {
    return 10;
  })
  .innerRadius(d => d.y0 * radius)
  .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));*/

export const arcVisible = d => d.y1 <= 4 && d.y0 >= 0 && d.x1 > d.x0;
export const labelVisible = d =>
  d.y1 <= 4 && d.y0 >= 0 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.04;

export const mouseleave = d => {
  d3.selectAll("path")
    .transition()
    .duration(200)
    .style("opacity", 1)
    .on("end", function() {
      d3.select(this).on("mouseover", mouseover);
    });
};
export const mouseover = d => {
  if (d && d.ancestors) {
    var sequenceArray = d.ancestors().reverse();
    sequenceArray.shift();
    d3.selectAll("path").style("opacity", 0.3);

    d3.selectAll("path")
      .filter(node => sequenceArray.indexOf(node) >= 0)
      .style("opacity", 1);
  }
};

export const labelTransform = d => {
  var angle = (d.x0 + d.x1) / Math.PI; // <-- 1
  angle = angle < 90 || angle > 270 ? angle : angle + 180;
  d.opacity = d.x1 - d.x0 > 0.01 ? 0 : 0;
  return "translate(" + arc.centroid(d) + ")rotate(" + angle + ")";
};
