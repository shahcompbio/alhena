import { heatmapConfig } from "../Heatmap/config.js";
const initialState = {
  quality: heatmapConfig.defaultQuality,
  selectedCells: [],
  chipHeatmapAxis: {
    label: "Total Mapped Reads",
    type: "total_mapped_reads"
  },
  scatterplotAxis: {
    x: { label: "Total Mapped Reads", type: "total_mapped_reads" },
    y: { label: "Mapped Reads", type: "total_reads" },
    popupFacadeIsOpen: false,
    selectedCellsDispatchFrom: null
  },
  violinAxis: {
    y: { label: "Quality", type: "quality" },
    x: { label: "Experimental Condition", type: "experimental_condition" }
  },
  gcBiasAxis: {
    x: { label: "GC Percent" },
    y: { label: "Average" }
  },
  gcBiasIsGrouped: true
};

const statsStateReducer = (state, action) => {
  switch (action.type) {
    case "BRUSH": {
      return {
        ...state,
        selectedCells: action.value,
        selectedCellsDispatchFrom: action.dispatchedFrom
      };
    }
    case "QUALITY_UPDATE": {
      return {
        ...state,
        quality: action.value.quality,
        selectedCells: [],
        categoryState: action.value.choosenCategories
      };
    }
    case "HEATMAP_CATEGORY_UPDATE": {
      return {
        ...state,
        selectedCells: [],
        categoryState: action.value
      };
    }
    case "CHIPHEATMAP_AXIS_UPDATE": {
      return {
        ...state,
        selectedCells: [],
        chipHeatmapAxis: action.value
      };
    }
    case "VIOLIN_AXIS_UPDATE": {
      return {
        ...state,
        selectedCells: [],
        violinAxis: action.value
      };
    }
    case "SCATTERPLOT_AXIS_UPDATE": {
      return {
        ...state,
        selectedCells: [],
        scatterplotAxis: action.value
      };
    }
    case "GCBIAS_IS_GROUPED": {
      return {
        ...state,
        gcBiasIsGrouped: action.value
      };
    }
    case "FACADE_EXISTS_WARNING": {
      return {
        ...state,
        popupFacadeIsOpen: action.value
      };
    }
    case "SIZE_CHANGE": {
      return {
        ...state,
        width: action.width,
        height: action.height
      };
    }
    default:
      return state;
  }
};
export { initialState };
export default statsStateReducer;
