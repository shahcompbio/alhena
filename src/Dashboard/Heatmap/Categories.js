import React, { useEffect } from "react";

import d3Tip from "d3-tip";

import { scaleOrdinal } from "d3";
import * as d3 from "d3";
import { heatmapConfig } from "./config.js";
import { cleanUpPreviousContent } from "./utils.js";

const getColourScale = (types, index) =>
  scaleOrdinal()
    .domain(types)
    .range(heatmapConfig.categories.colours[index]);

const getCategoryWidth = categoriesLength =>
  categoriesLength * heatmapConfig.categories.squareSize;

const Categories = ({ cellStats, yScale, categories }) => {
  const squareSize = heatmapConfig.categories.squareSize;

  var tooltip = d3Tip()
    .attr("class", "d3-tip n")
    .attr("id", "categoryChipTip");

  useEffect(() => {
    if (cellStats) {
      const categoriesWrapper = d3.select("#categories");
      categoriesWrapper.call(tooltip);

      cleanUpPreviousContent(categoriesWrapper);

      const categoryWidth = getCategoryWidth(categories.length);

      categories.forEach((category, index) => {
        const categoryName = category.category;
        const colourScale = getColourScale(category.types, index);

        categoriesWrapper
          .selectAll(".category-" + categoryName)
          .data(cellStats)
          .enter()
          .append("rect")
          .attr("id", function(d) {
            return d.id + categoryName;
          })
          .attr("class", "cat-square category-" + categoryName)
          .attr("x", xCordinate)
          .attr("y", function(d, i) {
            return yScale(i);
          })
          .attr("width", squareSize)
          .attr("height", squareSize)
          .attr("fill", function(d) {
            return colourScale(d[categoryName]);
          })
          .on("mousemove", function(d) {
            var coordinates = d3.mouse(this);
            d3.select(this).attr("class", "hoveredCategorySquare");

            const colour = colourScale(d[categoryName]);
            const name = d[categoryName];
            d3.select("#categoryChipTip")
              .style("visibility", "visible")
              .style("opacity", 1)
              .style("left", d3.event.pageX - 10 + "px")
              .style("top", d3.event.pageY - 40 + "px")
              .classed("hidden", false)
              .html("<strong>" + name + "</strong>");
          })
          .on("mouseout", function() {
            d3.select(this).classed("hoveredCategorySquare", false);

            tooltip.hide();
          });

        function xCordinate(d, i) {
          const defaultSpacing = index * heatmapConfig.categories.squareSize;
          const xOffset = categories.length === 1 ? 4 : 0;

          return index === 0
            ? categoryWidth - defaultSpacing - xOffset
            : categoryWidth -
                (defaultSpacing +
                  index * heatmapConfig.categories.squareSpacing);
        }
      });
    }
  }, [categories, cellStats]);

  return <g id="categories"></g>;
};
export default Categories;
