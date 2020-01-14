import React from "react";

import { withStyles } from "@material-ui/core/styles";
import clsx from "clsx";

import QCDashboard from "./QCDashboard.js";
import SideToolBar from "./SideToolBar.js";

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
  root: {
    display: "flex"
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: 36,
    marginLeft: 1
  },
  hide: {
    display: "none"
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap"
  },
  content: {
    marginTop: 100,
    marginLeft: 50
  },
  paperContent: {
    padding: 15,
    height: 1000,
    width: 1150
  }
});

const DashboardContent = ({ classes, history }) => {
  const [open, setOpen] = React.useState(false);
  const handleDrawerChange = () => setOpen(!open);

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Open drawer"
            onClick={handleDrawerChange}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open
            })}
          ></IconButton>
          <Typography variant="h6" noWrap>
            Alhena
          </Typography>
        </Toolbar>
      </AppBar>
      <SideToolBar open={open} handleDrawerChange={handleDrawerChange} />
      <Grid container spacing={1} className={classes.content}>
        <Grid container item xs={12} spacing={3}>
          <Paper className={classes.paperContent}>
            <StatsProvider
              initialState={initialState}
              reducer={statsStateReducer}
            >
              <QCDashboard analysis={"sc-884"} />
            </StatsProvider>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default withStyles(styles)(DashboardContent);
