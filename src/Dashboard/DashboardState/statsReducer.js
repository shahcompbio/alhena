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
  }
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
    case "SCATTERPLOT_AXIS_UPDATE": {
      return {
        ...state,
        selectedCells: [],
        scatterplotAxis: action.value
      };
    }
    case "FACADE_EXISTS_WARNING": {
      return {
        ...state,
        popupFacadeIsOpen: action.value
      };
    }
    default:
      return state;
  }
};
export { initialState };
export default statsStateReducer;
