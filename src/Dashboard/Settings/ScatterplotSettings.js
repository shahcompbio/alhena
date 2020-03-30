import React, { useState, useEffect } from "react";
import { FormControl, InputLabel, Select } from "@material-ui/core";

const ScatterplotSettings = ({
  classes,
  axisOptions,
  setAxisOption,
  currentlySelectedAxis
}) => {
  const [xAxisLabel, setXAxisLabel] = useState(currentlySelectedAxis.x.type);
  const [yAxisLabel, setYAxisLabel] = useState(currentlySelectedAxis.y.type);

  const handleAxisChange = name => event => {
    var axisObjext = currentlySelectedAxis;
    axisObjext[name] = {
      type: event.target.value,
      label: event.target.selectedOptions[0].label
    };
    if (name === "x") {
      setXAxisLabel(event.target.value);
    } else {
      setYAxisLabel(event.target.value);
    }
    setAxisOption(axisObjext);
  };

  return (
    <div className={classes.fieldComponent}>
      <FormControl
        variant="outlined"
        key="xAxisFormControl"
        className={classes.formControl}
      >
        <InputLabel
          shrink={true}
          htmlFor="xAxisSettings"
          className={classes.dropDownLabel}
          key="xAxis ScatterplotInput"
        >
          X Axis
        </InputLabel>
        <Select
          native
          key="xAxisScatterplot"
          value={xAxisLabel || ""}
          name="xAxis"
          onChange={handleAxisChange("x")}
          labelWidth={100}
        >
          {axisOptions.map((option, index) => (
            <option
              key={"xAxis" + option.type + "_" + index}
              value={option.type}
            >
              {option.label}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl
        variant="outlined"
        key="yAxis FormControl"
        className={classes.formControl}
      >
        <InputLabel
          shrink={true}
          margin="dense"
          key="yAxis SettingsLabel"
          htmlFor="yAxisSettings"
          className={classes.dropDownLabel}
        >
          Y Axis
        </InputLabel>
        <Select
          native
          key="yAxisScatterplot"
          value={yAxisLabel || ""}
          onChange={handleAxisChange("y")}
          labelWidth={100}
        >
          {axisOptions.map((option, index) => (
            <option
              key={"yAxis" + option.type + "_" + index}
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
export default ScatterplotSettings;
