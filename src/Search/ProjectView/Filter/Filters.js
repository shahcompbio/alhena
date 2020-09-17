import _ from "lodash";
import React, { useState } from "react";

import * as d3 from "d3";

import { withStyles } from "@material-ui/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";

import {
  Chip,
  InputLabel,
  FormControl,
  Grid,
  TextField,
  MenuItem,
  Select
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { hierarchyColouring } from "../Graph/appendUtils.js";
import { useDashboardState } from "../ProjectState/dashboardState";

import { config } from "../config.js";

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: "45px",
    paddingRight: "0px"
  },
  label: {
    color: "white",
    minWidth: 200,
    fontWeight: "normal",
    paddingBottom: "10px"
  },
  item: {
    paddingLeft: "25px !important",
    width: "100%"
  },
  filterDots: {
    position: "absolute"
  },
  input: { background: "white", borderRadius: 5, opacity: "80%" },
  formControl: { minWidth: 300 },
  dropdownStyle: {
    maxHeight: 100,
    overflowY: "scroll",
    backgroundColor: "lightgrey"
  },

  whiteBorder: {
    "& .MuiInputBase-root": {
      color: "white"
    },
    "& .MuiIconButton-label": {
      color: "white"
    },
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: "white"
    },
    "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: "white"
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "white"
    },
    color: "white"
  },
  whiteText: { color: "white" }
});
var collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base"
});
const Filters = ({
  filters,
  handleFilterChange,
  classes,
  selectedOptions,
  handleForwardStep
}) => {
  const [{ selectedDashboard }, dispatch] = useDashboardState();
  const [selectedValues, setSelectedValues] = useState({});

  const onChange = (value, type, handleForwardStep) => {
    const filter = value ? { label: type, value: value["value"] } : type;
    const action = value ? "add" : "clear";

    handleFilterChange(filter, action);
  };

  const getSelectValue = (selectedOptions, filterType, filters) => {
    if (isUserSelectedOption(selectedOptions, filterType)) {
      return selectedOptions[filterType];
    } else {
      if (Object.keys(selectedOptions).length !== 0) {
        const largestFilterIndex = getLargestFilterIndex(selectedOptions);
        var currFilterType = filters.filter(
          filter => filter.type.localeCompare(filterType) === 0
        )[0];
        if (
          isFilterSmallerThanLargestChoosen(
            currFilterType.type,
            largestFilterIndex
          )
        ) {
          return currFilterType.values.map(value => {
            return { label: value, value: currFilterType.type };
          });
        }
      }
    }
    return null;
  };

  const isFilterSmallerThanLargestChoosen = (type, largestFilterIndex) =>
    config.filterHeirarchy.indexOf(type) < largestFilterIndex;

  const getLargestFilterIndex = selectedOptions =>
    Object.keys(selectedOptions).map(optionName =>
      config.filterHeirarchy.indexOf(optionName)
    );

  const isUserSelectedOption = (selectedOptions, filterType) =>
    selectedOptions[filterType];

  const isDisabledOption = (selectedOptions, filterType) => {
    var largestFilterIndex = getLargestFilterIndex(selectedOptions);
    return isFilterSmallerThanLargestChoosen(filterType, largestFilterIndex);
  };

  if (filters) {
    const filterTypes = filters.map(filter => filter.type);

    var panels = _.times(filterTypes.length, i => {
      return filterTypes[i] !== "project"
        ? {
            key: `panel-${i}`,
            content: (
              <Autocomplete
                key={`panel-${filterTypes[i]}select`}
                value={selectedOptions[filterTypes[i]]}
                multiple={isDisabledOption(selectedOptions, filterTypes[i])}
                disableClearable={
                  selectedOptions[filterTypes[i]] ? false : true
                }
                renderTags={(value, getTagProps) => {
                  return value.length > 0
                    ? value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          className={classes.whiteText}
                          {...getTagProps({ index })}
                        />
                      ))
                    : null;
                }}
                onChange={(event, value) => {
                  if (filterTypes[i] === "jira_id") {
                    dispatch({
                      type: "ANALYSIS_SELECT",
                      value: { selectedAnalysis: value }
                    });

                    handleForwardStep();
                  } else {
                    onChange(value, filterTypes[i], handleForwardStep);
                  }
                }}
                renderInput={(params, index) => (
                  <TextField
                    {...params}
                    label={
                      filters[i].label + " (" + filters[i].values.length + ")"
                    }
                    InputLabelProps={{
                      shrink: true,
                      className: classes.whiteText
                    }}
                    className={classes.label}
                    variant="outlined"
                  />
                )}
                className={classes.whiteBorder}
                options={filters[i].values
                  .sort(collator.compare)
                  .reduce((final, value) => {
                    final = [...final, { label: value, value: value }];
                    return final;
                  }, [])}
                getOptionLabel={value => value["label"]}
              />
            )
          }
        : "";
    });
  } else {
    panels = [];
  }
  //  disabled: selectedOptions[filterTypes[i]] === value
  return (
    <Grid
      container
      direction="column"
      justify="flex-start"
      alignItems="flex-start"
      spacing={3}
      className={classes.root}
      key={"filterGrid"}
    >
      <Grid item className={classes.item} key={"filterMainTitle"}>
        <Typography className={classes.label} variant="h4">
          {selectedDashboard}
        </Typography>
      </Grid>

      <svg
        id="filterDots"
        width="20px"
        height="300px"
        className={classes.filterDots}
      >
        <FilterDots />
      </svg>

      {panels.length > 0
        ? panels
            .filter(panel => panel !== "")
            .map((panel, index) => (
              <Grid
                item
                className={classes.item}
                key={"panel" + filters[index].label}
              >
                <FormControl variant="outlined" className={classes.formControl}>
                  {panel.content}
                </FormControl>
              </Grid>
            ))
        : []}
    </Grid>
  );
};

const FilterDots = () => {
  var svg = d3.select("#filterDots");

  [1].map((colour, index) =>
    svg
      .append("line")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("x1", 10)
      .attr("y1", 30)
      .attr("x2", 10)
      .attr("y2", 270)
      .attr("class", "filterDotsLines")
  );

  [30, 30, 115, 115, 190, 190, 270, 270].map((position, index) =>
    svg
      .append("g")
      .append("circle")
      .attr("fill", d =>
        index % 2 !== 0 ? hierarchyColouring[3 - (index - 1) / 2] : "none"
      )
      .attr("r", d => (index % 2 === 0 ? 7 : 5))
      .attr("cx", 10)
      .attr("cy", position)
      .attr("class", d =>
        index % 2 === 0 ? "filterDotsOutterCircles" : "filterDotsCircles"
      )
  );
  return null;
};
export default withStyles(styles)(Filters);
