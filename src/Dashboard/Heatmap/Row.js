import React from "react";
import { getSegWidth, getSegX, colorScale } from "./utils.js";

const Row = ({ cellID, segs, y, bpRatio, height, chromMap, categoryWidth }) =>
  segs.map(seg => (
    <rect
      key={`${cellID}-${seg["chromosome"]}-${seg["start"]}`}
      width={getSegWidth(seg, bpRatio)}
      height={height}
      x={getSegX(seg, chromMap, bpRatio, false, categoryWidth)}
      y={y}
      fill={colorScale(seg["state"])}
    />
  ));

export default Row;
