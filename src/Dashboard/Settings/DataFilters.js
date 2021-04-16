import React, { useState, useEffect } from "react";
import { useDashboardState } from "../../Search/ProjectView/ProjectState/dashboardState";

import gql from "graphql-tag";
import { useQuery } from "react-apollo-hooks";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  Input,
  InputLabel,
  ListItemText,
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
  experimentalConditions,
  numericalDataFilters,
  isDisabled,
  key
}) => {
  const [
    { quality, isContaminated, axisChange, expCondition },
    dispatch
  ] = useStatisticsState();
  const [qualityMenuValue, setQualityMenuValue] = useState(quality);
  const [contaminatedMenuValue, setContaminatedMenuValue] = useState(
    isContaminated
  );

  const [experimentalMenuValue, setExperimentalMenuValue] = useState([]);

  const [paramObj, setParamObj] = useState({});
  useEffect(() => {
    if (axisChange["datafilter"] === false && experimentalMenuValue !== null) {
      setExperimentalMenuValue(null);
    }
  }, [axisChange]);
  useEffect(() => {
    if (
      expCondition &&
      expCondition.split(",").length !== experimentalMenuValue.length
    ) {
      setExperimentalMenuValue([...expCondition.split(",")]);
    }
  }, [expCondition]);
  useEffect(() => {
    if (isContaminated !== contaminatedMenuValue) {
      setContaminatedMenuValue(isContaminated);
    }
  }, [isContaminated]);

  useEffect(() => {
    if (quality !== qualityMenuValue) {
      setQualityMenuValue(quality);
    }
  }, [quality]);
  return [
    <Grid
      container
      direction="column"
      justify="flex-start"
      alignItems="flex-start"
      style={{ width: "100%" }}
      key={key + "grid"}
    >
      <Grid item className={classes.gridSlider} key={key + "gridSlider"}>
        <Typography
          id="discrete-slider"
          gutterBottom
          style={{ marginBottom: 0 }}
          key={key + "qualityTitle"}
        >
          Quality
        </Typography>
        <Slider
          key={key + "qualitySlider"}
          className={classes.slider}
          color={"secondary"}
          value={qualityMenuValue}
          disabled={isDisabled}
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
      <Grid item className={classes.gridSlider} key={key + "filterGrid"}>
        <Typography
          id="discrete-slider"
          gutterBottom
          style={{ marginBottom: 0 }}
          key={key + "filterTitle"}
        >
          Filter Contaminated
        </Typography>
        <FormControl
          disabled={isDisabled}
          variant="outlined"
          key="contaminatedFormControll"
          className={classes.formControl}
          key={key + "filterFormControl"}
        >
          <FormControlLabel
            control={
              <Switch
                checked={contaminatedMenuValue}
                onChange={() => {
                  setContaminatedMenuValue(!contaminatedMenuValue);
                  /*    setParamObj["is_contaminated"] = {
                    param: "is_contaminated",
                    value: contaminatedMenuValue.toString()
                  };*/
                  update(
                    {
                      isContaminated: contaminatedMenuValue
                    },
                    "CONTIMATED_UPDATE"
                  );
                }}
              />
            }
          />
        </FormControl>
      </Grid>
      <Grid
        item
        className={classes.gridSlider}
        key={key + "experimentalCondition"}
      >
        <Typography
          id="discrete-slider"
          key={key + "experimentalConditionTitle"}
          gutterBottom
          style={{ marginBottom: 0 }}
        >
          Experimental Conditions
        </Typography>
        <FormControl
          key={key + "expConditionFormControl"}
          variant="outlined"
          className={classes.formControl}
          disabled={isDisabled}
        >
          <Select
            key={key + "expConditionSelect"}
            value={experimentalMenuValue || []}
            name="experimentalConditionSelection"
            displayEmpty
            input={<Input />}
            multiple
            renderValue={selected =>
              selected.length > 1 ? selected.join(",") : selected
            }
            onChange={event => {
              const value = event.target.value;
              if (value.indexOf("") !== -1) {
                setExperimentalMenuValue([]);
                setParamObj["experimental_condition"] = [];
                update(
                  {
                    expCondition: null
                  },
                  "EXP_CONDITION_UPDATE"
                );
              } else {
                setExperimentalMenuValue(value);
                var expValue = setParamObj["experimental_condition"]
                  ? [...setParamObj["experimental_condition"], ...value]
                  : [...value];

                setParamObj["experimental_condition"] = {
                  param: "experimental_condition",
                  value: [...expValue]
                };

                update(
                  {
                    expCondition:
                      expValue.length > 1
                        ? expValue.join(",")
                        : value.toString()
                  },
                  "EXP_CONDITION_UPDATE"
                );
              }
            }}
          >
            <MenuItem value="" key={"none"}>
              <Checkbox
                checked={
                  experimentalMenuValue === null ||
                  experimentalMenuValue.length === 0
                }
              />
              <ListItemText primary={"None"} />
            </MenuItem>
            {experimentalConditions.length > 0 && experimentalConditions[0]
              ? experimentalConditions[0]["types"].map((option, index) => (
                  <MenuItem key={"expCondition-" + option} value={option}>
                    <Checkbox
                      checked={
                        experimentalMenuValue
                          ? experimentalMenuValue.indexOf(option) > -1
                          : false
                      }
                    />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))
              : null}
          </Select>
        </FormControl>
      </Grid>
      {numericalDataFilters && (
        <NumericalDataFilters
          filters={numericalDataFilters}
          classes={classes}
          isDisabled={isDisabled}
        />
      )}
    </Grid>
  ];
};
const NumericalDataFilters = ({ filters, classes, isDisabled }) => {
  const [
    { axisChange, absoluteMinMaxDataFilters, selectedCells },
    dispatch
  ] = useStatisticsState();
  const [defaultValues, setDefualtValues] = useState(
    filters.reduce((final, curr) => {
      final[curr["name"]] = [curr["localMin"], curr["localMax"]];
      return final;
    }, {})
  );

  const [prevDefaultValues, setPrevDefaultValues] = useState({
    ...defaultValues
  });

  useEffect(() => {
    if (
      axisChange["datafilter"] === false &&
      Object.keys(absoluteMinMaxDataFilters).length
    ) {
      const newDefaultValues = Object.keys(defaultValues).reduce(
        (final, value) => {
          if (absoluteMinMaxDataFilters[value]) {
            final[value] = [...absoluteMinMaxDataFilters[value]];
          } else {
            final[value] = [...defaultValues[value]];
          }
          return final;
        },
        {}
      );
      setDefualtValues({ ...newDefaultValues });
      setPrevDefaultValues({ ...newDefaultValues });
    }
  }, [axisChange]);

  const checkValidCommit = name =>
    prevDefaultValues[name][0] !== defaultValues[name][0] ||
    prevDefaultValues[name][1] !== defaultValues[name][1];

  const numFormatter = num => {
    const absNum = Math.abs(num);
    if (absNum > 999 && absNum < 1000000) {
      return (num / 1000).toFixed(0) + "K";
    } else if (absNum >= 1000000) {
      return (num / 100000).toFixed(0) + "M";
    } else if (absNum < 900 && absNum > 10) {
      return Math.ceil(num);
    } else {
      return num;
    }
  };
  return filters.map(filter => {
    const formattedMin = numFormatter(filter["min"]);
    const formattedMax = numFormatter(filter["max"]);

    return (
      <Grid item key={filter["name"] + "-grid"} style={{ width: "100%" }}>
        <Typography
          id={filter["name"] + "range-slider-title"}
          key={filter["name"] + "range-slider-title"}
          gutterBottom
        >
          {filter["label"]}
        </Typography>
        <Slider
          key={filter["name"] + "-slider"}
          value={defaultValues[filter["name"]]}
          className={classes.slider}
          color={"secondary"}
          disabled={isDisabled}
          marks={[
            {
              value: filter["min"],
              label: formattedMin
            },
            {
              label: formattedMax,
              value: filter["max"]
            }
          ]}
          onChangeCommitted={event => {
            if (checkValidCommit(filter["name"])) {
              dispatch({
                type: "NUMERICAL_DATA_FILTER_UPDATE",
                value: {
                  name: filter["name"],
                  params: [
                    {
                      param: filter["name"],
                      value: defaultValues[filter["name"]][1].toString(),
                      operator: "lte"
                    },
                    {
                      param: filter["name"],
                      value: defaultValues[filter["name"]][0].toString(),
                      operator: "gte"
                    }
                  ],
                  absoluteMinMax: [...prevDefaultValues[filter["name"]]]
                }
              });
              setPrevDefaultValues({ ...defaultValues });
            }
          }}
          onChange={(event, value) => {
            var newValues = defaultValues;
            if (
              value[0] >= filter["localMin"] &&
              value[1] <= filter["localMax"]
            ) {
              newValues[filter["name"]] = value;
              setDefualtValues({ ...newValues });
            }
          }}
          valueLabelFormat={numFormatter}
          step={
            filter["max"] - filter["min"] < 10
              ? (filter["max"] - filter["min"]) / 10
              : 1
          }
          min={filter["min"]}
          max={filter["max"]}
          valueLabelDisplay="auto"
          aria-labelledby="range-slider"
          getAriaValueText={value => value}
          valueLabelDisplay="auto"
          label={filter["name"]}
          getAriaValueText={value => numFormatter(value)}
        />
      </Grid>
    );
  });
};
export default DataFilters;
