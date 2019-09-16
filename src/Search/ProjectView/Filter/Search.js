import React from "react";

import Filters from "./Filters.js";

import { withStyles } from "@material-ui/styles";

import Paper from "@material-ui/core/Paper";
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
const Search = ({ classes, filters, handleFilterChange, selectedOptions }) => {
  return (
    <Grid container className={classes.root} spacing={2}>
      <Paper
        className={classes.paper}
        elevation={0}
        style={{ backgroundColor: "#2b2a2a" }}
      >
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
};
export default withStyles(style)(Search);
