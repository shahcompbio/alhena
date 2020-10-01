import React, { useEffect } from "react";

import d3Tip from "d3-tip";

import * as d3 from "d3";
import { heatmapConfig } from "./config.js";
import { cleanUpPreviousContent } from "./utils.js";

const getXOffset = categoryLength =>
  categoryLength === 1 ? 4 : categoryLength === 2 ? 2 : 4;

const CategoriesLegend = ({ choosenStats }) => {
  const spacing = heatmapConfig.categories.squareSpacing;
  const squareSize = heatmapConfig.categories.squareSize;
  const config = heatmapConfig.categories;
  const categoryWidth =
    squareSize * choosenStats.length + choosenStats.length * spacing;

  var tooltip = d3Tip()
    .attr("class", "d3-tip n")
    .attr("id", "chipTip");

  useEffect(() => {
    if (choosenStats) {
      const xOffset = getXOffset(choosenStats.length);

      const categoryLegend = d3.select("#categoryLegend");
      categoryLegend.call(tooltip);
      cleanUpPreviousContent(categoryLegend);

      choosenStats.forEach((category, index) => {
        const colouredCategories = heatmapConfig.categories.colours[index];
        const categoryName = category.category;

        // Title
        categoryLegend
          .append("text")
          .attr("x", categoryWidth + squareSize + 10)
          .attr("y", config.legendHeight - config.lengendLineHeight * index - 5)
          .attr("class", "cat-legend category-" + categoryName)
          .attr("text-anchor", "start")
          .text(categoryName);

        var horizLineDim = index * squareSize + index * spacing;

        //Horizontal line
        categoryLegend
          .append("rect")
          .attr("class", "cat-legend category-" + categoryName)
          .attr("x", categoryWidth - horizLineDim - xOffset)
          .attr("y", config.legendHeight - config.lengendLineHeight * index - 9)
          .attr("height", config.lineSize)
          .attr("width", horizLineDim + 10)
          .attr("fill", colouredCategories[2]);

        //Vertical line
        categoryLegend
          .append("rect")
          .attr("class", "cat-legend category-" + categoryName)
          .attr("x", categoryWidth - horizLineDim - xOffset)
          .attr("y", config.legendHeight - config.lengendLineHeight * index - 7)
          .attr(
            "height",
            config.legendHeight -
              config.lengendLineHeight * index +
              config.lengendLineHeight +
              15
          )
          .attr("width", heatmapConfig.categories.lineSize)
          .attr("fill", colouredCategories[2]);

        //Rect
        categoryLegend
          .append("rect")
          .attr("class", "cat-legend category-" + categoryName)
          .attr("x", categoryWidth + squareSize)
          .attr(
            "y",
            config.legendHeight - config.lengendLineHeight * index - 11
          )
          .attr("width", squareSize)
          .attr("height", squareSize)
          .attr("fill", colouredCategories[4])
          .on("mousemove", function(d) {
            var coordinates = d3.mouse(this);

            d3.select("#chipTip")
              .style("visibility", "visible")
              .style("opacity", 1)
              .style("left", d3.event.pageX + -92 + "px")
              .style("top", d3.event.pageY - 60 + "px")
              .classed("hidden", false)
              .html(function(d) {
                return "<strong>" + categoryName + "</strong>";
              });
          })
          .on("mouseout", tooltip.hide);
      });
    }
  }, [choosenStats]);

  return (
    <svg
      width={heatmapConfig.categories.legendWidth}
      height={heatmapConfig.categories.legendHeight}
      style={{ display: "block" }}
    >
      <g id="categoryLegend" />
    </svg>
  );
};
export default CategoriesLegend;
