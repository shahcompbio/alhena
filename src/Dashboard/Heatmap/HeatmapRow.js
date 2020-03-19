import React from "react";

import Row from "./Row.js";

import { heatmapConfig } from "./config.js";
import { getBPRatio } from "./utils.js";

const HeatmapRow = ({
  rowData,
  index,
  chromosomes,
  yScale,
  chromMap,
  rowMouseOver,
  categoryWidth
}) => {
  const { segs, id } = rowData;

  const y = yScale(index);

  const bpRatio = getBPRatio(chromosomes);

  return (
    <g
      className={index}
      data-tip
      onMouseEnter={() => rowMouseOver(id, y, index)}
    >
      <Row
        categoryWidth={categoryWidth}
        cellID={id}
        segs={segs}
        y={y}
        bpRatio={bpRatio}
        chromMap={chromMap}
        height={heatmapConfig["rowHeight"]}
      />
    </g>
  );
};

export default HeatmapRow;
