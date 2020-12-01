import React, { useState, useEffect } from "react";

import { FormControl, InputLabel, Select } from "@material-ui/core";

import { useStatisticsState } from "../DashboardState/statsState";
const ViolinSettings = ({
  classes,
  axisOptions,
  setAxisOption,
  isDisabled
}) => {
  const [{ quality, violinAxis }, dispatch] = useStatisticsState();
  const [xAxisLabel, setXAxisLabel] = useState(violinAxis.x.type);
  const [yAxisLabel, setYAxisLabel] = useState(violinAxis.y.type);

  useEffect(() => {
    if (violinAxis) {
      if (violinAxis.x.type !== xAxisLabel) {
        setXAxisLabel(violinAxis.x.type);
      }
      if (violinAxis.y.type !== yAxisLabel) {
        setYAxisLabel(violinAxis.y.type);
      }
    }
  }, [violinAxis]);

  const handleAxisChange = name => event => {
    var axisObjext = violinAxis;
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
        key="xAxisViolinFormControl"
        className={classes.formControl}
        disabled={isDisabled}
      >
        <InputLabel
          shrink={true}
          htmlFor="xAxisViolinSettings"
          className={classes.dropDownLabel}
          key="xAxisViolin violinInput"
        >
          X Axis
        </InputLabel>
        <Select
          native
          key="xAxisViolin"
          value={xAxisLabel}
          name="xViolinAxisAxis"
          onChange={handleAxisChange("x")}
          labelWidth={100}
        >
          {axisOptions
            ? axisOptions["xAxis"].map((option, index) => (
                <option
                  key={"xAxisViolin" + option.type + "_" + index}
                  value={option.type}
                >
                  {option.label}
                </option>
              ))
            : []}
        </Select>
      </FormControl>
      <FormControl
        variant="outlined"
        key="yAxis FormControl"
        className={classes.formControl}
        disabled={isDisabled}
      >
        <InputLabel
          shrink={true}
          margin="dense"
          key="yAxisViolinSettings"
          htmlFor="yAxisViolinSettings"
          className={classes.dropDownLabel}
        >
          Y Axis
        </InputLabel>
        <Select
          native
          key="yAxisViolin"
          value={yAxisLabel}
          onChange={handleAxisChange("y")}
          labelWidth={100}
        >
          {axisOptions
            ? axisOptions["yAxis"].map((option, index) => (
                <option
                  key={"yAxisViolin" + option.type + "_" + index}
                  value={option.type}
                >
                  {option.label}
                </option>
              ))
            : []}
        </Select>
      </FormControl>
    </div>
  );
};

export default ViolinSettings;
