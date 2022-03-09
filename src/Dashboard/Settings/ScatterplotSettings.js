import React, { useState, useEffect } from "react";

import { FormControl, InputLabel, Select } from "@mui/material";

import { useStatisticsState } from "../DashboardState/statsState";
import { gql, useQuery } from "@apollo/client";
const SCATTERPLOT_OPTIONS = gql`
  query scatterplotAxisOptions {
    scatterplotAxisOptions {
      type
      label
    }
  }
`;
const ScatterplotSettings = ({
  analysis,
  classes,
  setAxisOption,
  isDisabled
}) => {
  const [{ quality, scatterplotAxis }] = useStatisticsState();
  const [xAxisLabel, setXAxisLabel] = useState(scatterplotAxis.x.type);
  const [yAxisLabel, setYAxisLabel] = useState(scatterplotAxis.y.type);
  const { loading, data } = useQuery(SCATTERPLOT_OPTIONS, {
    variables: {
      analysis: analysis,
      quality: quality
    }
  });
  useEffect(() => {
    if (scatterplotAxis) {
      if (scatterplotAxis.x.type !== xAxisLabel) {
        setXAxisLabel(scatterplotAxis.x.type);
      }
      if (scatterplotAxis.y.type !== yAxisLabel) {
        setYAxisLabel(scatterplotAxis.y.type);
      }
    }
  }, [scatterplotAxis]);

  if (!loading && data) {
    const axisOptions = data.scatterplotAxisOptions;

    const handleAxisChange = name => event => {
      var axisObjext = scatterplotAxis;
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
          key="xAxisFormControlScatter"
          className={classes.formControl}
          disabled={isDisabled}
        >
          <InputLabel
            shrink={true}
            htmlFor="xAxisSettingsScatter"
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
          key="yAxisFormControlScatter"
          className={classes.formControl}
          disabled={isDisabled}
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
  } else {
    return (
      <div className={classes.fieldComponent}>
        <FormControl
          variant="outlined"
          key="xAxisFormControl"
          className={classes.formControl}
          disabled={isDisabled}
        />
      </div>
    );
  }
};
export default ScatterplotSettings;
