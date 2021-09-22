import React, { useEffect } from "react";

import d3Tip from "d3-tip";

import * as d3 from "d3";
import { heatmapConfig } from "./config.js";
import { cleanUpPreviousContent, getColourScale } from "./utils.js";

const getXOffset = categoryLength =>
  categoryLength === 1 ? 4 : categoryLength === 2 ? 2 : 4;

const CategoriesLegend = ({ choosenStats }) => {
  const spacing = heatmapConfig.categories.squareSpacing;
  const squareSize = heatmapConfig.categories.squareSize;
  const config = heatmapConfig.categories;
  const categoryWidth =
    squareSize * choosenStats.length + choosenStats.length * spacing;

  var tooltip = d3Tip()
    .attr("class", "d3-tip w")
    .attr("id", "categoryTip");
  const nameMapping = {
    state_mode: "State Mode",
    cell_call: "Cell Call",
    experimental_condition: "Experimental Condition"
  };
  useEffect(() => {
    if (choosenStats) {
      const xOffset = getXOffset(choosenStats.length);

      const categoryLegend = d3.select("#categoryLegend");
      categoryLegend.call(tooltip);
      cleanUpPreviousContent(categoryLegend);

      choosenStats.forEach((category, index) => {
        const colouredCategories = heatmapConfig.categories.colours[index];
        const categoryName = category.category;

        const colourScale = getColourScale(category.types, index);

        // Title
        categoryLegend
          .append("text")
          .attr("x", categoryWidth + squareSize + 10)
          .attr("y", config.legendHeight - config.lengendLineHeight * index - 5)
          .attr("id", "title-" + categoryName)
          .attr("class", "cat-legend category-" + categoryName)
          .attr("text-anchor", "start")
          .on("mouseout", tooltip.hide)
          .text(nameMapping[categoryName]);

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
            const dim = d3
              .select("#title-" + categoryName)
              .node()
              .getBoundingClientRect();

            const typesText = category["types"].reduce((final, curr, index) => {
              final +=
                "<g><rect width='10px' height='10px' x='0' y='" +
                (index * 10 + 1 * index) +
                "' style='fill:" +
                colourScale(curr) +
                ";'/><text x='15' y='" +
                (index * 10 + 1 * index + 1 + 7) +
                "' style='font-size:10px;font-weight:bold;fill:#ffffff;'>" +
                curr +
                "</text></g>";
              return final;
            }, "");

            d3.select("#categoryTip")
              .style("visibility", "visible")
              .style("opacity", 1)
              .style("left", dim.right + 5 + "px")
              .style("top", dim.top - 20 + "px")
              .classed("hidden", false)
              .html(function(d) {
                return (
                  "<svg width='30px' height='" +
                  (category["types"].length * 10 + 3) +
                  "px'>" +
                  typesText +
                  "</svg>"
                );
              });
          })
          .on("mouseout", function(d) {
            d3.select("#categoryTip").style("opacity", 0);
          });
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
