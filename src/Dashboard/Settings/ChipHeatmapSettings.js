import React, { useState } from "react";
import { FormControl, InputLabel, Select } from "@material-ui/core";

const ChipHeatmapSettings = ({
  classes,
  axisOptions,
  setAxisOption,
  currentlySelectedAxis
}) => {
  const [axisLabel, setAxisLabel] = useState(currentlySelectedAxis.type);
  const handleAxisChange = event => {
    const axisObject = {
      type: event.target.value,
      label: event.target.selectedOptions[0].label
    };
    setAxisLabel(event.target.value);
    setAxisOption(axisObject);
  };

  return (
    <div className={classes.fieldComponent}>
      <FormControl
        variant="outlined"
        key="chipheatmapAxisFormControl"
        className={classes.formControl}
      >
        <InputLabel
          shrink={true}
          htmlFor="chipheatmapAxisSettings"
          className={classes.dropDownLabel}
          key="chipheatmapAxis chipHeatmapInput"
        >
          Metric
        </InputLabel>
        <Select
          native
          key="axisChipHeatmap"
          value={axisLabel || ""}
          name="chipheatmapAxis"
          onChange={event => handleAxisChange(event)}
          labelWidth={100}
        >
          {axisOptions &&
            axisOptions.map((option, index) => (
              <option
                key={"chipheatmapAxis_" + option.type + "_" + index}
                value={option.type}
              >
                {option.label}
              </option>
            ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default ChipHeatmapSettings;
