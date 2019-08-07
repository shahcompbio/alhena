import _ from "lodash";
import React, { Component } from "react";
import Select from "react-select";

import { withStyles } from "@material-ui/styles";
import InputLabel from "@material-ui/core/InputLabel";
import Grid from "@material-ui/core/Grid";

import { config } from "../../../config/config.js";
const filterConfig = config.FilterConfig;
const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: "15px"
  },
  item: {
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
class Filters extends Component {
  constructor(props) {
    super(props);
  }
  onChange = (value, action, type) => {
    if (value) {
      this.props.handleFilterChange(
        { value: value.label, label: value.value },
        action
      );
    } else {
      this.props.handleFilterChange(type, action);
    }
  };
  getSelectValue = (selectedOptions, filterType, filters) => {
    if (this.isUserSelectedOption(selectedOptions, filterType)) {
      return selectedOptions[filterType];
    } else {
      if (Object.keys(selectedOptions).length !== 0) {
        const largestFilterIndex = this.getLargestFilterIndex(selectedOptions);
        var currFilterType = filters.filter(
          filter => filter.type.localeCompare(filterType) === 0
        )[0];
        if (
          this.isFilterSmallerThanLargestChoosen(
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
  isFilterSmallerThanLargestChoosen = (type, largestFilterIndex) =>
    filterConfig.filterHeirarchy.indexOf(type) < largestFilterIndex;

  getLargestFilterIndex = selectedOptions =>
    Object.keys(selectedOptions).map(optionName =>
      filterConfig.filterHeirarchy.indexOf(optionName)
    );

  isUserSelectedOption = (selectedOptions, filterType) =>
    selectedOptions[filterType];

  isDisabledOption = (selectedOptions, filterType) => {
    var largestFilterIndex = this.getLargestFilterIndex(selectedOptions);
    return this.isFilterSmallerThanLargestChoosen(
      filterType,
      largestFilterIndex
    );
  };
  render() {
    const {
      filters,
      handleFilterChange,
      classes,
      selectedOptions
    } = this.props;
    if (filters) {
      const filterTypes = filters.map(filter => filter.type);

      var panels = _.times(filterTypes.length, i => {
        return {
          key: `panel-${i}`,
          content: (
            <Select
              value={this.getSelectValue(
                selectedOptions,
                filterTypes[i],
                filters
              )}
              styles={reactSelectStyles}
              isMulti={this.isDisabledOption(selectedOptions, filterTypes[i])}
              isClearable={
                this.isUserSelectedOption(selectedOptions, filterTypes[i]) ||
                !this.isDisabledOption(selectedOptions, filterTypes[i])
              }
              onChange={(option, { action }) =>
                this.onChange(option, action, filterTypes[i])
              }
              options={filters[i].values.map(value => {
                return {
                  value: filterTypes[i],
                  label: value,
                  disabled: selectedOptions[filterTypes[i]] === value
                };
              })}
            />
          ),
          title: <InputLabel>{filters[i].label}</InputLabel>
        };
      });
    } else {
      var panels = [];
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
  }
}
export default withStyles(styles)(Filters);
