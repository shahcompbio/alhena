import _ from "lodash";
import React, { Component } from "react";
import Select from "react-select";

import { withStyles } from "@material-ui/styles";
import InputLabel from "@material-ui/core/InputLabel";
import Grid from "@material-ui/core/Grid";

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: "15px"
  },
  item: {
    width: "100%"
  }
});
class Filters extends Component {
  constructor(props) {
    super(props);

    this.state = { activeIndex: 0 };
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
  render() {
    const {
      filters,
      handleFilterChange,
      classes,
      selectedOptions
    } = this.props;

    const filterTypes = filters.map(filter => filter.type);
    const panels = _.times(filterTypes.length, i => {
      return {
        key: `panel-${i}`,
        content: (
          <Select
            value={selectedOptions[filterTypes[i]]}
            isClearable
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
