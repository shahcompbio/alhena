/**
 * Configuration defaults for views
 */

/**
 * Overall config
 */

const COLORS = [
  "#2e7aab",
  "#9ECAE1",
  "#CCCCCC",
  "#FDCC8A",
  "#FC8D59",
  "#E34A33",
  "#B30000",
  "#980043",
  "#DD1C77",
  "#DF65B0",
  "#C994C7",
  "#D4B9DA"
];

const CONSTANTS = {
  copyNumberLabels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  copyNumberColors: COLORS
};

export const config = {
  ...CONSTANTS
};

/**
 * Component dimensions
 */
const COMPONENTS = {
  width: 1100,
  height: 539,

  legendWidth: 100,
  legendX: 0,

  miniMapWidth: 100,
  minimapHeight: 400,

  heatmapChromHeight: 12
};

export const componentConfig = {
  ...COMPONENTS,
  legendHeight: COMPONENTS.height,

  heatmapWidth:
    COMPONENTS.width - COMPONENTS.miniMapWidth - COMPONENTS.legendWidth,
  heatmapHeight: COMPONENTS.height,

  heatmapX: COMPONENTS.legendX + COMPONENTS.legendWidth
};

/**
 * Colors
 */

/**
 * Legend
 */

const LEGEND_CONSTANTS = {
  width: componentConfig.legendWidth,
  x: componentConfig.legendX,
  height: componentConfig.legendHeight
};

export const legendConfig = {
  ...LEGEND_CONSTANTS,
  copyNumberLabels: CONSTANTS.copyNumberLabels,
  copyNumberColors: CONSTANTS.copyNumberColors
};

/**
 * Heatmap-related config
 */

const HEATMAP_CONSTANTS = {
  ...CONSTANTS,
  wrapperWidth: componentConfig.miniMapWidth + componentConfig.heatmapWidth,
  width: componentConfig.heatmapWidth,
  height: componentConfig.heatmapHeight,
  x: componentConfig.heatmapX,
  paddingLeft: 3,
  rowHeight: 7,
  indicatorWidth: 10,
  defaultQuality: "0.75",

  minimap: {
    rowHeight: 2,
    width: componentConfig.miniMapWidth,
    brushWidth: componentConfig.miniMapWidth - 4,
    miniMapQueryRangeOffset: 2
  },

  profile: {
    y: componentConfig.heatmapHeight + componentConfig.heatmapChromHeight,
    x: 0,
    chromBoxHeight: 10,
    axisWidth: 25,
    axisTextYOffset: 5,
    axisLineWidth: 1,
    scaleDomain: [-0.5, 8],
    axisDomain: [0, 1, 2, 3, 4, 5, 6, 7],
    segmentColor: "#000000",
    barHeight: 2,
    backgroundColors: ["#fefefe", "#eee"],
    height: 300
  },

  chromosome: {
    height: componentConfig.heatmapChromHeight,
    color: ["#faf9f9", "#e6e6e6"]
  },

  indicator: {
    width: 15
  },

  legend: {
    height: 35,
    width: 300,
    squareSize: 10,
    squareSpacing: 5,
    textOffset: 5,
    titleWidth: 100,
    titleHeight: 10
  },
  categories: {
    legendWidth: 250,
    legendHeight: 55,
    lengendLineHeight: 15,
    squareSize: 6,
    lineSize: 2,
    squareSpacing: 2,
    colours: {
      0: ["#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#005a32"],
      1: [
        "#d9d9d9",
        "#bdbdbd",
        "#969696",
        "#737373",
        "#525252",
        "#252525",
        "#000000"
      ],
      2: ["#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#8c2d04"]
    }
  },
  qualitySliderMarks: [
    { value: 0, label: "0" },
    {
      value: 0.25,
      label: "0.25"
    },
    {
      value: 0.5,
      label: "0.5"
    },
    {
      value: 0.75,
      label: "0.75"
    },
    {
      value: 1.0,
      label: "1.0"
    }
  ]
};

export const heatmapConfig = {
  ...HEATMAP_CONSTANTS,
  contentWidth: HEATMAP_CONSTANTS.width - HEATMAP_CONSTANTS.indicatorWidth,
  contentHeight: HEATMAP_CONSTANTS.height + 200
};
