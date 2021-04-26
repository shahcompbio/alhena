import React, { useEffect } from "react";

import * as d3 from "d3";

import { heatmapConfig } from "./config.js";

const ProfileAxis = ({ genomeYScale }) => {
  function handleCanvas(context, genomeYScale) {
    context.fillStyle = "black";
    context.lineWidth = 1;
    const xPos =
      heatmapConfig.profile.axisWidth -
      heatmapConfig.profile.axisLineWidth -
      10;
    context.moveTo(xPos + 10, genomeYScale(genomeYScale.domain()[0]) + 10);
    context.lineTo(xPos + 10, genomeYScale(genomeYScale.domain()[1]) + 5);
    context.stroke();
    genomeYScale.ticks(genomeYScale.domain()[1]).forEach(tick => {
      context.fillText(tick, xPos - 12, genomeYScale(tick) + 10);

      context.moveTo(xPos, genomeYScale(tick) + 8);
      context.lineTo(xPos + 10, genomeYScale(tick) + 8);
      context.stroke();
    });
    context.fill();
  }

  var observer = new MutationObserver(function(mutations, me) {
    const parentCanvas = d3.select("#genomeAxis").node();

    if (parentCanvas) {
      let scale = window.devicePixelRatio;
      parentCanvas.style.width = heatmapConfig.profile.axisWidth + "px";
      parentCanvas.style.height = heatmapConfig.profile.height + "px";
      parentCanvas.width = heatmapConfig.profile.axisWidth * scale;
      parentCanvas.height = heatmapConfig.profile.height * scale;
      var parentContext = parentCanvas.getContext("2d");
      parentContext.scale(scale, scale);
      handleCanvas(parentContext, genomeYScale);
      me.disconnect(); // stop observing
      return;
    }
  });

  // start observing
  observer.observe(document, {
    childList: true,
    subtree: true
  });
  return null;
};
export default ProfileAxis;
