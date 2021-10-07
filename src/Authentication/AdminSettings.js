import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import {
  Grid,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Button,
  Paper
} from "@material-ui/core";

import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const useStyles = makeStyles(theme => ({
  root: {}
}));

const AdminSettings = ({ data }) => {
  const classes = useStyles();
  return (
    <Grid
      container
      spacing={2}
      justify="center"
      alignItems="center"
      className={classes.root}
    >
      {data.map(option => (
        <p>{option.type}</p>
      ))}
    </Grid>
  );
};
export default AdminSettings;
