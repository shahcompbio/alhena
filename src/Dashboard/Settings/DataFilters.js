import React, { useState, useEffect } from "react";

import _ from "lodash";
import { styled } from "@mui/system";

import {
  Checkbox,
  FormControl,
  Grid,
  Input,
  ListItemText,
  MenuItem,
  Select,
  Slider,
  Switch,
  Typography
} from "@mui/material";

import { useStatisticsState } from "../DashboardState/statsState";
import { heatmapConfig } from "../Heatmap/config";
const secondary = "#f1c023";

const StyledSlider = styled(Slider)(({ theme }) => ({
  color: "#f1c023 !important",
  width: "100%"
}));

const StyledTitles = styled(Typography)(({ theme }) => ({
  marginBottom: 0,
  marginLeft: "-20px !important"
}));

const DataFilters = ({
  update,
  analysis,
  experimentalConditions,
  numericalDataFilters,
  isDisabled,
  key
}) => {
  const [
    { quality, isContaminated, axisChange, expCondition }
  ] = useStatisticsState();
  const [qualityMenuValue, setQualityMenuValue] = useState(quality);
  const [contaminatedMenuValue, setContaminatedMenuValue] = useState(
    isContaminated
  );

  const [experimentalMenuValue, setExperimentalMenuValue] = useState([]);

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
      justifyContent="flex-start"
      alignItems="flex-start"
      style={{ width: "100%", margin: "10px !important" }}
      key={key + "grid"}
    >
      <Grid
        item
        sx={{ width: "100%", marginBottom: "35px !important" }}
        key={key + "gridSlider"}
      >
        <StyledTitles
          id="discrete-slider"
          gutterBottom
          key={key + "qualityTitle"}
        >
          Quality
        </StyledTitles>
        <StyledSlider
          key={key + "qualitySlider"}
          sx={{ color: "#f1c023 !important", width: "100%" }}
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
      <Grid
        item
        sx={{ width: "100%", marginBottom: "35px !important" }}
        key={key + "experimentalCondition"}
      >
        <StyledTitles
          id="discrete-slider"
          key={key + "experimentalConditionTitle"}
          gutterBottom
        >
          Experimental Conditions
        </StyledTitles>
        <FormControl
          key={key + "expConditionFormControl"}
          variant="outlined"
          sx={{ width: "100%" }}
          disabled={isDisabled}
        >
          <Select
            key={key + "expConditionSelect"}
            sx={{
              width: "100%",
              color: "black",
              "& .Mui-checked": {
                color: "secondary.main !important"
              },
              "&:before": {
                borderColor: "secondary.main !important"
              },
              "&:after": {
                borderColor: "secondary.main !important",
                borderBottom: "2px solid secondary.main !important"
              },

              ":before": { borderBottomColor: "2px solid #f1c023" },
              ":after": { borderBottomColor: "#f1c023" }
            }}
            value={experimentalMenuValue || []}
            name="experimentalConditionSelection"
            displayEmpty
            input={<Input />}
            multiple
            renderValue={selected =>
              selected.length > 1
                ? selected.join(",")
                : selected.length == 1
                ? selected
                : "None Selected"
            }
            onChange={event => {
              const value = event.target.value;
              if (value.indexOf("") !== -1) {
                setExperimentalMenuValue([]);
                update(
                  {
                    expCondition: null
                  },
                  "EXP_CONDITION_UPDATE"
                );
              } else {
                setExperimentalMenuValue(value);

                update(
                  {
                    expCondition:
                      value.length > 1 ? value.join(",") : value.toString()
                  },
                  "EXP_CONDITION_UPDATE"
                );
              }
            }}
          >
            <MenuItem value="" key={"none"}>
              <Checkbox
                sx={{
                  color: secondary,
                  "&.Mui-checked": {
                    color: secondary
                  }
                }}
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
                      sx={{
                        color: secondary,
                        "&.Mui-checked": {
                          color: secondary
                        }
                      }}
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
          isDisabled={isDisabled}
        />
      )}
    </Grid>
  ];
};
/*      <Grid item className={classes.gridSlider} key={key + "filterGrid"}>
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
          className={classes.formControl}
          key={key + "filterFormControl"}
        >
          <FormControlLabel
            control={
              <Switch
                checked={contaminatedMenuValue}
                onChange={() => {
                  setContaminatedMenuValue(!contaminatedMenuValue);
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
      </Grid>*/
const NumericalDataFilters = ({ filters, isDisabled }) => {
  const [
    { axisChange, absoluteMinMaxDataFilters },
    dispatch
  ] = useStatisticsState();

  const [defaultValues, setDefualtValues] = useState({});
  const [prevDefaultValues, setPrevDefaultValues] = useState({});
  const originalDefaultValues = filters.reduce((final, curr) => {
    final[curr["name"]] = [curr["min"], curr["max"]];
    return final;
  }, {});

  useEffect(() => {
    if (_.isEmpty(defaultValues)) {
      setDefualtValues({ ...originalDefaultValues });
      setPrevDefaultValues({ ...originalDefaultValues });
    }
  }, [filters]);

  useEffect(() => {
    if (
      !_.isEmpty(defaultValues) &&
      _.isEmpty(absoluteMinMaxDataFilters) &&
      axisChange["datafilter"] === false
    ) {
      setDefualtValues({ ...originalDefaultValues });
      setPrevDefaultValues({ ...originalDefaultValues });
    }
  }, [axisChange, absoluteMinMaxDataFilters]);
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
    } else if (absNum < 10) {
      var absString = absNum.toString();
      absString = absString.slice(0, absString.indexOf(".") + 3);
      return parseFloat(absString);
    } else {
      return num;
    }
  };

  return filters.length > 0 && Object.keys(defaultValues).length > 0
    ? filters.map(filter => {
        const formattedLocalMax = numFormatter(filter["localMax"]);
        const formattedLocalMin = numFormatter(filter["localMin"]);

        const formattedMin = numFormatter(defaultValues[filter["name"]][0]);
        const formattedMax = numFormatter(defaultValues[filter["name"]][1]);

        return (
          <Grid
            item
            key={filter["name"] + "-grid"}
            sx={{ width: "100%", marginBottom: "35px !important" }}
          >
            <StyledTitles
              id={filter["name"] + "range-slider-title"}
              key={filter["name"] + "range-slider-title"}
              gutterBottom
            >
              {filter["label"]}
            </StyledTitles>
            <Typography
              id="breath-local-slider"
              gutterBottom
              style={{ fontSize: 12, marginBottom: 0 }}
            >
              Local Max/Min
            </Typography>
            <Slider
              disabled
              defaultValue={[filter["localMin"], filter["localMax"]]}
              aria-labelledby="breath-local-slider"
              min={originalDefaultValues[filter["name"]][0]}
              max={originalDefaultValues[filter["name"]][1]}
              style={{ marginBottom: 0 }}
              marks={[
                {
                  value: filter["localMin"],
                  label: formattedLocalMin
                },
                {
                  value: filter["localMax"],
                  label: formattedLocalMax
                }
              ]}
            />
            <Typography
              id="breath-overall-slider"
              gutterBottom
              style={{ fontSize: 12, marginBottom: 0, marginTop: 10 }}
            >
              Range Controls
            </Typography>
            <StyledSlider
              key={filter["name"] + "-slider"}
              value={defaultValues[filter["name"]]}
              //className={classes.slider}
              color={"secondary"}
              disabled={isDisabled}
              marks={[
                {
                  value: defaultValues[filter["name"]][0],
                  label: formattedMin
                },
                {
                  value: defaultValues[filter["name"]][1],
                  label: formattedMax
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
                if (value[0] >= filter["min"] && value[1] <= filter["max"]) {
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
              label={filter["name"]}
              getAriaValueText={value => numFormatter(value)}
            />
          </Grid>
        );
      })
    : null;
};
export default DataFilters;
