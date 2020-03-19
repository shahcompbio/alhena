export const appendGlowFilter = svg => {
  createFilter(svg, "glow", "55", 0.2);
  createFilter(svg, "innerRingGlow", "55", 0.5);
  createFilter(svg, "textGlow", "2", 0.9);
};
const createFilter = (svg, id, stDeviation, floodOpacity, colour) => {
  var defs = svg.append("defs");

  var filter = defs.append("filter").attr("id", id);
  filter
    .append("feFlood")
    .attr("flood-color", colour ? colour : "rgb(255, 249, 222)")
    .attr("flood-opacity", floodOpacity)
    .attr("in", "SourceGraphic");
  filter
    .append("feComposite")
    .attr("operator", "in")
    .attr("in2", "SourceGraphic");
  filter
    .append("feGaussianBlur")
    .attr("stdDeviation", stDeviation)
    .attr("result", "coloredBlur");

  var feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");
};
