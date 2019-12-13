import _ from "lodash";
import React from "react";
import Select from "react-select";

import { withStyles } from "@material-ui/styles";
import InputLabel from "@material-ui/core/InputLabel";
import Grid from "@material-ui/core/Grid";

import { config } from "../../../config/config.js";
const filterConfig = config.FilterConfig;
const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: "55px",
    paddingRight: "0px",
    background: "#2b2a2a"
  },
  label: {
    color: "white",
    fontWeight: "normal",
    paddingBottom: "10px"
  },
  item: {
    padding: "15px",
    paddingRight: "0px",
    width: "100%"
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
const Filters = ({ filters, handleFilterChange, classes, selectedOptions }) => {
  const onChange = (value, action, type) => {
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
    filterConfig.filterHeirarchy.indexOf(type) < largestFilterIndex;

  const getLargestFilterIndex = selectedOptions =>
    Object.keys(selectedOptions).map(optionName =>
      filterConfig.filterHeirarchy.indexOf(optionName)
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
                value={getSelectValue(selectedOptions, filterTypes[i], filters)}
                styles={reactSelectStyles}
                isMulti={isDisabledOption(selectedOptions, filterTypes[i])}
                isClearable={
                  isUserSelectedOption(selectedOptions, filterTypes[i]) ||
                  !isDisabledOption(selectedOptions, filterTypes[i])
                }
                onChange={(option, { action }) =>
                  onChange(option, action, filterTypes[i])
                }
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
              <InputLabel className={classes.label}>
                {filters[i].label}
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
    >
      {panels.map(panel => (
        <Grid item className={classes.item}>
          {panel.title}
          {panel.content}
        </Grid>
      ))}
    </Grid>
  );
};
export default withStyles(styles)(Filters);
