import React from "react";
import OrdinalFrame from "semiotic/lib/OrdinalFrame";
const legendHeight = 300;

const legendProps = (max, maxColour) => {
  return {
    /* --- Data --- */
    data: [{ max: max, legend: "Legend" }],

    /* --- Size --- */
    size: [60, legendHeight],

    /* --- Layout --- */
    oAccessor: "legend",
    rAccessor: "max",

    /* --- Layout --- */
    type: {
      type: "point",
      customMark: d => {
        return (
          <rect
            height={legendHeight}
            width={20}
            x={-20}
            fill="url(#gradient)"
          />
        );
      }
    },
    axes: [{ basline: false, orient: "right", ticks: 2 }],
    additionalDefs: [
      <linearGradient key="gradient" x1="0" x2="0" y1="0" y2="1" id="gradient">
        <stop stopColor={maxColour} offset="0%" />
        <stop stopColor={"white"} offset="100%" />
      </linearGradient>
    ],
    rExtent: [0, max],

    /* --- Annotate --- */
    oLabel: false
  };
};
export default ({ max, maxColour }) => {
  const frameProps = legendProps(max, maxColour);
  return <OrdinalFrame {...frameProps} />;
};
