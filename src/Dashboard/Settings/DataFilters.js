import React, { useState, useEffect } from "react";
import { useDashboardState } from "../../Search/ProjectView/ProjectState/dashboardState";

import gql from "graphql-tag";
import { useQuery } from "react-apollo-hooks";
import {
  Grid,
  FormControl,
  FormControlLabel,
  Slider,
  Switch,
  Typography
} from "@material-ui/core";

import { useStatisticsState } from "../DashboardState/statsState";
import { heatmapConfig } from "../Heatmap/config";
const orderFromParamsQuary = gql`
  query heatmapOrderFromParameter(
    $analysis: String!
    $quality: String!
    $params: [InputParams]
  ) {
    heatmapOrderFromParameter(
      analysis: $analysis
      quality: $quality
      params: $params
    ) {
      order
    }
  }
`;

const DataFilters = ({ classes, update, analysis }) => {
  const [{ quality, isContaminated }, dispatch] = useStatisticsState();
  const [qualityMenuValue, setQualityMenuValue] = useState(quality);
  const [contaminatedMenuValue, setContaminatedMenuValue] = useState(
    isContaminated
  );

  const sendQuery = () => {
    const { loading, data } = useQuery(orderFromParamsQuary, {
      variables: {
        analysis: analysis,
        quality: quality,
        params: [{ param: "is_contaminated", value: contaminatedMenuValue }]
      }
    });
    console.log(data);
  };

  return [
    <Grid
      container
      direction="column"
      justify="flex-start"
      alignItems="flex-start"
      style={{ width: "100%" }}
    >
      <Grid item style={{ width: "100%", marginBottom: 10 }}>
        <Typography
          id="discrete-slider"
          gutterBottom
          style={{ marginBottom: 0 }}
        >
          Quality
        </Typography>
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
          label="Quality"
          min={0}
          max={1.0}
        />
      </Grid>
      <Grid item>
        <Typography
          id="discrete-slider"
          gutterBottom
          style={{ marginBottom: 0 }}
        >
          Filter Contaminated
        </Typography>
        <FormControl
          variant="outlined"
          key="contaminatedFormControll"
          className={classes.formControl}
        >
          <FormControlLabel
            control={
              <Switch
                checked={contaminatedMenuValue}
                onChange={() => {
                  setContaminatedMenuValue(!contaminatedMenuValue);
                  sendQuery();
                }}
              />
            }
          />
        </FormControl>
      </Grid>
    </Grid>
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
