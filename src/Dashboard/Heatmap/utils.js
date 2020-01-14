import { config, heatmapConfig } from "./config.js";
import { scalePoint, scaleLinear } from "d3";

export const cleanUpPreviousContent = wrapper =>
  wrapper.selectAll("*").remove();
/**
 * Returns segment starting x position
 * @param {object} seg
 * @param {object} chromMap
 * @param {number} bpRatio
 * @param {number}
 */
export const getSegX = (seg, chromMap, bpRatio, isMinimap, categoryWidth) =>
  isMinimap
    ? Math.floor(seg.start / bpRatio) + chromMap[seg.chromosome].miniX
    : Math.floor(seg.start / bpRatio) +
      chromMap[seg.chromosome].x +
      categoryWidth;

/**
 * Returns segment width in pixels
 * @param {object} seg
 * @param {number} bpRatio
 */
export const getSegWidth = (seg, bpRatio) =>
  Math.floor((seg.end - seg.start + 1) / bpRatio);

export const getChromPixelMapping = chromosomes => {
  const bpRatio = getBPRatio(chromosomes);
  const miniBpRatio = getMinimapBPRatio(chromosomes);

  let xShift = 0;
  let miniXShift = 0;

  return chromosomes.reduce((map, chrom) => {
    const chromWidth = getChromWidth(chrom, bpRatio);
    const miniWidth = getChromWidth(chrom, miniBpRatio);

    const mapEntry = {
      chrom: chrom,
      x: xShift,
      miniX: miniXShift,
      miniWidth: miniWidth,
      width: chromWidth
    };

    miniXShift += miniWidth;
    xShift += chromWidth;

    return {
      ...map,
      [chrom.id]: mapEntry
    };
  }, {});
};
export const getGenomeYScale = maxState =>
  scaleLinear()
    .domain([0.5, maxState])
    .range([heatmapConfig.profile.height, 0]);

export const getMinimapBPRatio = chromosomes => {
  const totalBP = getTotalBP(chromosomes);
  return Math.ceil(totalBP / heatmapConfig.minimap.width);
};
/**
 * Gets base pair to pixel ratio
 */
export const getBPRatio = chromosomes => {
  const totalBP = getTotalBP(chromosomes);
  return Math.ceil(totalBP / heatmapConfig["contentWidth"]);
};

/**
 * Gets number of indices that can fit per heatmap row
 */
export const getIndicesPerRow = Math.ceil(config["rowHeight"]);

/**
 * Gets the total number of base pairs in chromosome ranges
 */
export const getTotalBP = chromosomes => {
  const totalBp = chromosomes.reduce(
    (sum, chrom) => sum + chrom.end - chrom.start + 1,
    0
  );
  return totalBp;
};
export const colorScale = scaleLinear()
  .domain(config["copyNumberLabels"])
  .range(config["copyNumberColors"]);
/**
 * Returns the width (in pixels) for chromosome
 * @param {object} chrom - data
 * @param {int} bpRatio
 * @return {int}
 */
const getChromWidth = (chrom, bpRatio) =>
  Math.floor((chrom.end - chrom.start + 1) / bpRatio);

export const getYScale = indicesLength =>
  scalePoint()
    .domain([...Array.from(Array(indicesLength).keys())])
    .range([0, heatmapConfig.rowHeight * indicesLength]);

export const heatmapOrderToCellIndex = (heatmapOrder, cellCount) =>
  scalePoint()
    .domain([...heatmapOrder])
    .range([0, cellCount - 1]);

export const getMinimapYScale = indicesLength => {
  return scalePoint()
    .domain([...Array.from(Array(indicesLength).keys())])
    .range([0, indicesLength * heatmapConfig.minimap.rowHeight]);
};
export const heatmapToMinimapScale = (heatmapCellLength, minimapCellLength) =>
  scaleLinear()
    .domain([0, heatmapCellLength - 1])
    .range([0, heatmapConfig.minimap.rowHeight * minimapCellLength - 1]);

export const getChromosomeEndX = chromosomes => {
  const chromPixelMapping = getChromPixelMapping(chromosomes);
  return chromPixelMapping["Y"]["width"] + chromPixelMapping["Y"]["x"];
};
export const getIndicatorXPosition = chromosomes => {
  const annotationX = getAnnotationsX(chromosomes);
  return annotationX;
};

export const getAnnotationsX = chromosomes => {
  const chromosomeX = getChromosomeEndX(chromosomes);
  const heatmapX = 0;
  return chromosomeX + heatmapX + config["spacing"];
};
