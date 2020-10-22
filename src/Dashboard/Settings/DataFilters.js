import React, { useState, useEffect } from "react";
import { useDashboardState } from "../../Search/ProjectView/ProjectState/dashboardState";
import { Slider } from "@material-ui/core";
import { useStatisticsState } from "../DashboardState/statsState";
import { heatmapConfig } from "../Heatmap/config";

const DataFilters = ({ classes, update }) => {
  const [{ quality }, dispatch] = useStatisticsState();
  const [qualityMenuValue, setQualityMenuValue] = useState(quality);

  return [
    <Slider
      className={classes.slider}
      color={"secondary"}
      defaultValue={qualityMenuValue}
      onChange={(event, newValue) => setQualityMenuValue(newValue)}
      onChangeCommitted={() =>
        update(
          {
            quality: qualityMenuValue.toString()
          },
          "QUALITY_UPDATE"
        )
      }
      getAriaValueText={value => value}
      aria-labelledby="discrete-slider"
      step={0.05}
      marks={heatmapConfig.qualitySliderMarks}
      valueLabelDisplay="on"
      min={0}
      max={1.0}
    />
    /*  <FormControl
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
          <option key={"xAxis" + option.type + "_" + index} value={option.type}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormControl>*/
  ];
};
export default DataFilters;
