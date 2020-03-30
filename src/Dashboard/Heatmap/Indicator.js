import React from "react";

import { heatmapConfig } from "./config.js";

const Indicator = ({ y }) => {
  return (
    <g id="indicator">
      <rect
        width={heatmapConfig.width + heatmapConfig.paddingLeft}
        height={1}
        x={0}
        y={y + heatmapConfig.rowHeight}
        style={{
          fill: "black"
        }}
      />
      <rect
        width={1}
        height={heatmapConfig.rowHeight}
        x={0}
        y={y}
        style={{
          fill: "black"
        }}
      />
    </g>
  );
};

export default Indicator;
