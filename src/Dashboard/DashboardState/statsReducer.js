import { heatmapConfig } from "../Heatmap/config.js";
const initialState = {
  quality: heatmapConfig.defaultQuality,
  isContaminated: false,
  expCondition: null,
  axisChange: {
    datafilter: false,
    scatterplot: false,
    chip: false,
    violin: false,
    gcBias: false
  },
  absoluteMinMaxDataFilters: {},
  numericalDataFilters: [],
  experimentalCondition: {
    label: "Experimental Condition",
    type: "experimental_condition"
  },
  selectedCells: [],
  subsetSelection: [],
  chipHeatmapAxis: {
    label: "Total Mapped Reads",
    type: "total_mapped_reads"
  },

  scatterplotAxis: {
    x: { label: "Quality", type: "quality" },
    y: { label: "Total Reads", type: "total_reads" },
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

  isScatterAxisChanged: false,
  isChipAxisChanged: false,
  gcBiasIsGrouped: false,
  isViolinAxisChanged: false
};

const statsStateReducer = (state, action) => {
  switch (action.type) {
    case "BRUSH": {
      return {
        ...state,
        selectedCells:
          action.subsetSelection && action.dispatchedFrom !== "clear"
            ? state.selectedCells
            : action.value,
        selectedCellsDispatchFrom:
          action.dispatchedFrom === "clear" ? null : action.dispatchedFrom,
        subsetSelection: action.subsetSelection ? action.subsetSelection : []
      };
    }
    case "DATA_FILTER_OFF": {
      return {
        ...state,
        axisChange: { ...state.axisChange, datafilter: false },
        quality: heatmapConfig.defaultQuality,
        isContaminated: false,
        numericalDataFilters: [],
        absoluteMinMaxDataFilters: {},
        selectedCells: [],
        selectedCellsDispatchFrom: null,
        subsetSelection: []
      };
    }
    case "CONTIMATED_UPDATE": {
      return {
        ...state,
        axisChange: { ...state.axisChange, datafilter: true },
        isContaminated: true
      };
    }
    case "EXP_CONDITION_UPDATE": {
      const isBackToDefault =
        action.value.expCondition === null &&
        state.quality === heatmapConfig.defaultQuality &&
        state.isContaminated === false;
      return {
        ...state,
        axisChange: {
          ...state.axisChange,
          datafilter: isBackToDefault ? false : true
        },
        selectedCells: isBackToDefault ? [] : state.selectedCells,
        expCondition: action.value.expCondition
      };
    }
    case "QUALITY_UPDATE": {
      return {
        ...state,
        quality: action.value.quality,
        selectedCells: [],
        axisChange: { ...state.axisChange, datafilter: true },
        categoryState: action.value.choosenCategories
      };
    }
    case "NUMERICAL_DATA_FILTER_UPDATE": {
      const existingFilters = state.numericalDataFilters.reduce(
        (final, curr, index) => {
          final[curr.param] = true;
          return final;
        },
        {}
      );
      if (existingFilters[action.value["name"]]) {
        //update existing
        var newDataFilters = state.numericalDataFilters.filter(
          filter => filter["name"] !== action.value["name"]
        );
        return {
          ...state,
          numericalDataFilters: [...newDataFilters, ...action.value.params]
        };
      } else {
        return {
          ...state,
          axisChange: { ...state.axisChange, datafilter: true },
          numericalDataFilters: [
            ...state.numericalDataFilters,
            ...action.value.params
          ],
          absoluteMinMaxDataFilters: {
            ...state.absoluteMinMax,
            [action.value["name"]]: [...action.value["absoluteMinMax"]]
          }
        };
      }
    }
    case "HEATMAP_CATEGORY_UPDATE": {
      return {
        ...state,
        selectedCells: [],
        categoryState: action.value
      };
    }
    case "CHIPHEATMAP_AXIS_UPDATE": {
      console.log("change again");
      return {
        ...state,
        selectedCells: [],
        axisChange: { ...state.axisChange, chip: true },
        chipHeatmapAxis: action.value
      };
    }
    case "CHIP_AXIS_RESET": {
      console.log("reset done");
      return {
        ...state,
        axisChange: { ...state.axisChange, chip: false },
        selectedCells: [],
        selectedCellsDispatchFrom: null,
        subsetSelection: [],
        chipHeatmapAxis: {
          label: "Total Mapped Reads",
          type: "total_mapped_reads"
        }
      };
    }
    case "VIOLIN_AXIS_RESET": {
      return {
        ...state,
        axisChange: { ...state.axisChange, violin: false },
        selectedCells: [],
        selectedCellsDispatchFrom: null,
        subsetSelection: [],
        violinAxis: {
          y: { label: "Quality", type: "quality" },
          x: { label: "Experimental Condition", type: "experimental_condition" }
        }
      };
    }
    case "VIOLIN_AXIS_UPDATE": {
      return {
        ...state,
        selectedCells: [],
        axisChange: { ...state.axisChange, violin: true },
        violinAxis: action.value
      };
    }
    case "SCATTERPLOT_AXIS_UPDATE": {
      return {
        ...state,
        selectedCells: [],
        axisChange: { ...state.axisChange, scatterplot: true },
        scatterplotAxis: action.value
      };
    }
    case "SCATTERPLOT_AXIS_RESET": {
      return {
        ...state,
        axisChange: { ...state.axisChange, scatterplot: false },
        selectedCells: [],
        selectedCellsDispatchFrom: null,
        subsetSelection: [],
        scatterplotAxis: {
          x: { label: "Quality", type: "quality" },
          y: { label: "Total Reads", type: "total_reads" },
          popupFacadeIsOpen: false,
          selectedCellsDispatchFrom: null
        }
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
