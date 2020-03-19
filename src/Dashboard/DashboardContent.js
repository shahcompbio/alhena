import React from "react";

import { withStyles } from "@material-ui/core/styles";
import clsx from "clsx";

import QCDashboard from "./QCDashboard.js";

import {
  AppBar,
  Grid,
  IconButton,
  Paper,
  Toolbar,
  Typography
} from "@material-ui/core";

import statsStateReducer, { initialState } from "./DashboardState/statsReducer";
import { StatsProvider } from "./DashboardState/statsState";

const drawerWidth = 300;
const styles = theme => ({
  content: {
    overflowX: "scroll"
  },
  dashboard: {
    //  margin: 40
  }
});

const DashboardContent = ({ classes, history }) => {
  const [open, setOpen] = React.useState(false);
  const handleDrawerChange = () => setOpen(!open);

  return (
    <StatsProvider initialState={initialState} reducer={statsStateReducer}>
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        className={classes.content}
      >
        <Grid item className={classes.dashboard}>
          <QCDashboard analysis={"sc-856"} item xs={8} />
        </Grid>
      </Grid>
    </StatsProvider>
  );
};

export default withStyles(styles)(DashboardContent);
