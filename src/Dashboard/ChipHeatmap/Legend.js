import React, { useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
const legendHeight = 300;
const legendWidth = 15;
const lineHeight = 15;

const Legend = ({ max, maxColour, legendTitle }) => {
  const [ref] = useHookWithRefCallback();
  const [legendSvg, saveLegendSvg] = useState(null);
  var yScale = d3
    .scaleLinear()
    .range([0, legendHeight])
    .domain([max, 0]);

  var yAxis = d3
    .axisRight(yScale)
    .tickSize(legendWidth)
    .tickPadding([10])
    .ticks(4);

  useEffect(() => {
    if (legendSvg) {
      const multiLineTitle = legendTitle.split(" ");
      appendTitle(multiLineTitle, legendSvg);

      const tickFormat = max === 1 ? d3.format("0.1f") : d3.format("~s");
      legendSvg
        .select(".chipLegendGradient")
        .attr(
          "transform",
          "translate(" +
            0 +
            ", " +
            (multiLineTitle.length + 1) * lineHeight +
            ")"
        );

      legendSvg
        .select(".chipLegendAxis")
        .call(yAxis.tickFormat(tickFormat))
        .attr(
          "transform",
          "translate(" +
            legendWidth +
            ", " +
            (multiLineTitle.length + 1) * lineHeight +
            ")"
        );
    }
  }, [max]);

  function useHookWithRefCallback() {
    const setRef = useCallback(node => {
      if (node) {
        const legendSvg = d3.select("#chipLegendSvg");

        const linearGradient = legendSvg
          .append("defs")
          .append("svg:linearGradient")
          .attr("id", "chipGradient")
          .attr("x1", "100%")
          .attr("y1", "100%")
          .attr("x2", "100%")
          .attr("y2", "0%")
          .attr("spreadMethod", "pad");

        linearGradient
          .append("stop")
          .attr("offset", "0%")
          .attr("stop-color", "white")
          .attr("stop-opacity", 1);

        linearGradient
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", maxColour)
          .attr("stop-opacity", 1);

        const multiLineTitle = legendTitle.split(" ");
        appendTitle(multiLineTitle, legendSvg);

        const titleOffset = lineHeight * (multiLineTitle.length + 1);
        legendSvg
          .append("rect")
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .attr("class", "chipLegendGradient")
          .style("fill", "url(#chipGradient)")
          .attr("transform", "translate(0, " + titleOffset + ")");

        legendSvg
          .append("g")
          .attr(
            "transform",
            "translate(" + legendWidth + ", " + titleOffset + ")"
          )
          .attr("class", "chipLegendAxis")
          .call(yAxis.tickFormat(d3.format(".2s")))
          .append("text")
          .attr("x", 0)
          .attr("dy", ".71em")
          .style("text-anchor", "end");

        saveLegendSvg(legendSvg);
      }
    }, []);

    return [setRef];
  }
  const appendTitle = (multiLineTitle, legendSvg) => {
    legendSvg.selectAll("text").text("");
    multiLineTitle.map((text, index) => {
      legendSvg
        .append("text")
        .attr("class", "title")
        .attr("x", 0)
        .attr("y", lineHeight * index)
        .attr("dy", "1.3em")
        .attr("fill", "grey")
        .text(text);
      return text;
    });
  };
  return (
    <svg
      ref={ref}
      id="chipLegendSvg"
      height={legendHeight * 2}
      width={legendWidth * 5}
    />
  );
};

export default Legend;
