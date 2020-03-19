import React from "react";

import { heatmapConfig } from "./config.js";

const ChromAxis = ({ chromosomes, y, chromMap, categoryWidth }) => {
  const axisText = chromosomes.map((chromosome, i) => (
    <ChromAxisItem
      key={chromosome.id}
      chromosome={chromosome.id}
      data={chromMap[chromosome.id]}
      y={y}
      index={i}
      categoryWidth={categoryWidth}
    />
  ));
  return <g className="chromAxis">{axisText}</g>;
};

const ChromAxisItem = ({ chromosome, data, y, index, categoryWidth }) => (
  <g>
    <rect
      x={data["x"] + categoryWidth}
      y={y + 3}
      width={data["width"]}
      height={heatmapConfig.chromosome["height"]}
      fill={heatmapConfig.chromosome["color"][index % 2]}
    />
    <text
      x={data["x"] + data["width"] / 2 + categoryWidth}
      y={y + heatmapConfig.chromosome["height"]}
      fontSize={"10px"}
      textAnchor={"middle"}
      fill={"#000000"}
    >
      {chromosome}
    </text>
  </g>
);

export default ChromAxis;
