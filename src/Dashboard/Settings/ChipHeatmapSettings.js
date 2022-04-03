import React, { useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { FormControl, InputLabel, Select } from "@mui/material";
const useStyles = makeStyles(theme => ({
  fieldComponent: {
    margin: theme.spacing(2, 0, 0, 0)
  },
  formControl: {
    width: "100%",
    margin: theme.spacing(0, 0, 2, 0) + " !important"
  },
  dropDownLabel: { backgroundColor: "white", padding: "3px !important;" }
}));

const ChipHeatmapSettings = ({
  axisOptions,
  setAxisOption,
  currentlySelectedAxis,
  isDisabled
}) => {
  const [axisLabel, setAxisLabel] = useState(currentlySelectedAxis.type);
  const classes = useStyles();
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
        key={"formControl-chip"}
        variant="outlined"
        key="chipheatmapAxisFormControl"
        className={classes.formControl}
        disabled={isDisabled}
      >
        <InputLabel
          key={"input-chip"}
          shrink={true}
          htmlFor="chipheatmapAxisSettings"
          className={classes.dropDownLabel}
          id="chipSetttingsLabel"
        >
          Metric
        </InputLabel>
        <Select
          native
          key="selectChipHeatmap"
          value={axisLabel || ""}
          name="chipheatmapAxis"
          onChange={event => handleAxisChange(event)}
          labelwidth={100}
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
