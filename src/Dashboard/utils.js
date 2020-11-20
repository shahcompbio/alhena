export const initContext = (canvasSelection, width, height) => {
  const canvas = canvasSelection.node();

  let scale = window.devicePixelRatio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  canvas.width = width * scale;
  canvas.height = height * scale;
  var context = canvas.getContext("2d");
  context.scale(scale, scale);
  return context;
};
export const isSelectionAllowed = (
  selfType,
  selectedCellsDispatchFrom,
  subsetSelection,
  selectedCells,
  axisChange
) => {
  const dispatch =
    selectedCellsDispatchFrom !== selfType ||
    selectedCellsDispatchFrom === null ||
    selectedCellsDispatchFrom === undefined;

  //if data filter is selected but no subset
  const isDataFilterSelection =
    axisChange["datafilter"] && subsetSelection.length === 0;
  //if data filter is off and no selected cells
  const isEverythingOff =
    axisChange["datafilter"] === false && selectedCells.length === 0;

  return dispatch || isDataFilterSelection || isEverythingOff;
};
