import React, { useState, useEffect } from "react";
import { useDashboardState } from "../../Search/ProjectView/ProjectState/dashboardState";

import gql from "graphql-tag";
import { useQuery } from "react-apollo-hooks";
import {
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
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

const DataFilters = ({
  classes,
  update,
  analysis,
  client,
  experimentalConditions
}) => {
  const [{ quality, isContaminated }, dispatch] = useStatisticsState();
  const [qualityMenuValue, setQualityMenuValue] = useState(quality);
  const [contaminatedMenuValue, setContaminatedMenuValue] = useState(
    isContaminated
  );
  const [experimentalMenuValue, setExperimentalMenuValue] = useState(null);

  const [paramObj, setParamObj] = useState({});

  const sendQuery = async (client, dispatch, params) => {
    const { loading, data } = await client.query({
      query: orderFromParamsQuary,
      variables: {
        analysis: analysis,
        quality: quality,
        params: Object.values(params)
      }
    });
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
                  setParamObj["is_contaminated"] = {
                    param: "is_contaminated",
                    value: contaminatedMenuValue.toString()
                  };
                  sendQuery(client, dispatch, setParamObj);
                }}
              />
            }
          />
        </FormControl>
      </Grid>
      <Grid item>
        <Typography
          id="discrete-slider"
          gutterBottom
          style={{ marginBottom: 0 }}
        >
          Experimental Conditions
        </Typography>
        <FormControl
          variant="outlined"
          key="xAxisFormControl"
          className={classes.formControl}
        >
          <Select
            key="experimentalCondition"
            value={experimentalMenuValue || ""}
            name="experimentalConditionSelection"
            displayEmpty
            onChange={event => {
              const value = event.target.value;
              setExperimentalMenuValue(value);
              if (value === "None") {
                delete setParamObj["experimental_condition"];
              } else {
                setParamObj["experimental_condition"] = {
                  param: "experimental_condition",
                  value: value
                };
              }
              sendQuery(client, dispatch, setParamObj);
            }}
          >
            <MenuItem value="">None</MenuItem>
            {experimentalConditions.length > 0
              ? experimentalConditions[0]["types"].map((option, index) => (
                  <MenuItem
                    key={"expCondition" + option + "_" + index}
                    value={option}
                  >
                    {option}
                  </MenuItem>
                ))
              : null}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  ];
};

export default DataFilters;
