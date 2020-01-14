import { heatmapConfig } from "../Heatmap/config.js";
const initialState = { quality: heatmapConfig.defaultQuality };

const statsStateReducer = (state, action) => {
  switch (action.type) {
    case "QUALITY_UPDATE": {
      return {
        ...state,
        quality: action.value.quality,
        categoryState: action.value.choosenCategories
      };
    }
    case "HEATMAP_CATEGORY_UPDATE": {
      return {
        ...state,
        categoryState: action.value
      };
    }
    default:
      return state;
  }
};
export { initialState };
export default statsStateReducer;
