import React, { useEffect } from "react";

import * as d3 from "d3";

import { heatmapConfig } from "./config.js";
//import {}

const ProfileAxis = ({ genomeYScale }) => {
  useEffect(() => {
    const container = d3.select("#genomeAxis");

    var yAxis = d3.axisLeft(genomeYScale);

    container
      .append("g")
      .attr("class", "genome-y-axis")
      .attr(
        "transform",
        "translate(" +
          (heatmapConfig.profile.axisWidth -
            heatmapConfig.profile.axisLineWidth) +
          ", " +
          heatmapConfig.profile.axisTextYOffset +
          ")"
      )
      .call(yAxis);
  }, []);

  return (
    <svg
      id="genomeAxis"
      width={heatmapConfig.profile.axisWidth}
      height={heatmapConfig.profile.height}
    />
  );
};
export default ProfileAxis;
