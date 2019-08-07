import React, { Component } from "react";

import Filters from "./Filters.js";

import _ from "lodash";
import { graphql } from "react-apollo";
import { getAllFilters } from "../../../Queries/queries.js";
import { withStyles } from "@material-ui/styles";

import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

const style = theme => ({
  root: {
    flexGrow: 1,
    marginTop: "20vh",
    height: "50vh",
    padding: "30px"
  },
  paper: {
    width: "100%"
  },
  header: {
    textAlign: "right",
    paddingRight: "15px",
    marginTop: "40px",
    width: "100%"
  }
});
class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const {
      classes,
      filters,
      handleFilterChange,
      selectedOptions
    } = this.props;
    return (
      <Grid container className={classes.root} spacing={2}>
        <Paper className={classes.paper} elevation={0}>
          <Filters
            selectedOptions={selectedOptions}
            filters={filters}
            handleFilterChange={(selection, type) =>
              handleFilterChange(selection, type)
            }
          />
        </Paper>
      </Grid>
    );
  }
}
export default withStyles(style)(Search);
