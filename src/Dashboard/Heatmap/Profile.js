import { useEffect } from "react";

import * as d3 from "d3";
import { heatmapConfig } from "./config.js";
import {
  getChromPixelMapping,
  getBPRatio,
  colorScale,
  getSegWidth
} from "./utils.js";

const Profile = ({ bins, chromosomes, genomeYScale, cellSegs }) => {
  const bpRatio = getBPRatio(chromosomes);

  useEffect(() => {
    if (bins !== null) {
      var canvas = d3.select("#profileCanvas");

      let context = canvas.node().getContext("2d");

      context.clearRect(
        0,
        0,
        heatmapConfig.width,
        heatmapConfig.profile.height
      );

      const chromMap = getChromPixelMapping(chromosomes);

      bins.forEach(bin => {
        const x = Math.floor(bin.start / bpRatio) + chromMap[bin.chromNumber].x;
        const y = genomeYScale(bin.copy);

        context.fillStyle = colorScale(bin.state);
        context.beginPath();
        context.arc(x, y, 1.5, 0, 2 * Math.PI);
        context.fill();
      });

      cellSegs.segs.forEach(segment => {
        const x =
          Math.floor(segment.start / bpRatio) + chromMap[segment.chromosome].x;
        const y = genomeYScale(segment.state);
        const width = getSegWidth(segment, bpRatio);

        context.fillStyle = heatmapConfig.profile.segmentColor;
        context.fillRect(x, y, width, heatmapConfig.profile.barHeight);
      });
    }
  }, [bins]);

  return null;
};

export default Profile;
