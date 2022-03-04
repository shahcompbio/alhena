import * as d3 from "d3";
import { heatmapConfig } from "./config.js";

const ChromAxis = ({ chromosomes, chromMap, categoryWidth }) => {
  function handleCanvas(context, chromosomes, chromMap, categoryWidth) {
    chromosomes.map((chromosome, index) => {
      const data = chromMap[chromosome.id];
      context.fillStyle = heatmapConfig.chromosome["color"][index % 2];
      context.fillRect(
        data["x"] + categoryWidth,
        0,
        data["width"],
        heatmapConfig.chromosome["height"]
      );
      context.fillStyle = "black";
      context.font = context.font.replace(/\d+px/, "8px");
      const textX =
        data["width"] < 26
          ? data["x"] + data["width"] / 3 + categoryWidth
          : data["x"] + data["width"] / 2 + categoryWidth;

      context.fillText(
        chromosome.id,
        textX,
        heatmapConfig.chromosome["height"] - 2
      );
      return chromosome;
    });

    context.fill();
  }

  // set up the mutation observer
  var observer = new MutationObserver(function(mutations, me) {
    const parentCanvas = d3.select("#chromAxis").node();

    if (parentCanvas) {
      let scale = window.devicePixelRatio;
      parentCanvas.style.width = heatmapConfig.wrapperWidth + "px";
      parentCanvas.style.height = heatmapConfig.chromosome["height"] + "px";
      parentCanvas.width = heatmapConfig.wrapperWidth * scale;
      parentCanvas.height = heatmapConfig.chromosome["height"] * scale;
      var parentContext = parentCanvas.getContext("2d");
      parentContext.scale(scale, scale);
      handleCanvas(parentContext, chromosomes, chromMap, categoryWidth);
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
export default ChromAxis;
