import _ from "lodash";
import React from "react";
import Select from "react-select";
import * as d3 from "d3";

import { withStyles } from "@material-ui/styles";
import InputLabel from "@material-ui/core/InputLabel";
import Grid from "@material-ui/core/Grid";
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
    fontWeight: "normal",
    paddingBottom: "10px"
  },
  item: {
    paddingLeft: "25px !important",
    width: "100%"
  },
  filterDots: {
    position: "absolute"
  }
});
const reactSelectStyles = {
  multiValue: (base, state) => {
    return { ...base, backgroundColor: "#bdc3c7" };
  },
  multiValueLabel: (base, state) => {
    return { ...base, fontWeight: "bold", color: "white", paddingRight: 6 };
  },
  multiValueRemove: (base, state) => {
    return { ...base, display: "none" };
  }
};

const Filters = ({
  filters,
  handleFilterChange,
  classes,
  selectedOptions,
  handleForwardStep
}) => {
  const [{ selectedDashboard }, dispatch] = useDashboardState();

  const onChange = (value, action, type, handleForwardStep) => {
    const filter = value ? { value: value.label, label: value.value } : type;
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
    var collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base"
    });

    var panels = _.times(filterTypes.length, i => {
      return filterTypes[i] !== "project"
        ? {
            key: `panel-${i}`,
            content: (
              <Select
                key={`panel-${i}select`}
                value={getSelectValue(selectedOptions, filterTypes[i], filters)}
                styles={reactSelectStyles}
                isMulti={isDisabledOption(selectedOptions, filterTypes[i])}
                isClearable={
                  isUserSelectedOption(selectedOptions, filterTypes[i]) ||
                  !isDisabledOption(selectedOptions, filterTypes[i])
                }
                onChange={(option, { action }) => {
                  if (filterTypes[i] === "jira_id") {
                    dispatch({
                      type: "ANALYSIS_SELECT",
                      value: { selectedAnalysis: option.label }
                    });

                    handleForwardStep();
                  } else {
                    onChange(option, action, filterTypes[i], handleForwardStep);
                  }
                }}
                closeMenuOnSelect={false}
                options={filters[i].values.sort(collator.compare).map(value => {
                  return {
                    value: filterTypes[i],
                    label: value,
                    disabled: selectedOptions[filterTypes[i]] === value
                  };
                })}
              />
            ),
            title: (
              <InputLabel className={classes.label} key={`panel-${i}label`}>
                {filters[i].label + " (" + filters[i].values.length + ")"}
              </InputLabel>
            )
          }
        : "";
    });
  } else {
    panels = [];
  }

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

      {panels.map((panel, index) => (
        <Grid
          item
          className={classes.item}
          key={"panel" + filters[index].label}
        >
          {panel.title}
          {panel.content}
        </Grid>
      ))}
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
      .attr("y2", 240)
      .attr("class", "filterDotsLines")
  );

  [30, 30, 87, 87, 165, 165, 240, 240].map((position, index) =>
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
