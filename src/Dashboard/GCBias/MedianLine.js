import React from "react";

import XYFrame from "semiotic/lib/XYFrame";
import DividedLine from "semiotic/lib/DividedLine";
const MedianLine = ({ data, extent, plotDimensions }) => {
  const frameProps = (data, extent) => {
    return {
      lines: data,
      size: [800, 600],

      /* --- Process --- */
      xAccessor: "gcPercent",

      yAccessor: "median",
      yExtent: [...extent],

      customLineMark: ({ d, i, xScale, yScale }) => {
        return (
          <DividedLine
            id="medianLine"
            key={`threshold-${i}`}
            data={[d]}
            parameters={p => ({ stroke: "#9fd0cb", fill: "none" })}
            customAccessors={{
              x: d => xScale(d.gcPercent),
              y: d => yScale(d.median)
            }}
            lineDataAccessor={d => d.data}
          />
        );
      }
    };
  };
  const props = frameProps(data, extent);
  return <XYFrame {...props} />;
};
export default MedianLine;
