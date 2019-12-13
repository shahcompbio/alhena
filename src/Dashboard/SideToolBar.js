import React from "react";
import clsx from "clsx";
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";

import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import SettingsIcon from "@material-ui/icons/Settings";
import SearchIcon from "@material-ui/icons/Search";
import HelpIcon from "@material-ui/icons/Help";
const drawerWidth = 300;

const styles = theme => ({
  root: {
    display: "flex"
  },
  menuButton: {
    marginRight: 36
  },
  hide: {
    display: "none"
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap"
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: "hidden",
    width: theme.spacing(10) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(16) + 1
    }
  },
  toolbarSpace: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  },
  bottomDivider: {
    position: "absolute",
    bottom: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  },
  toolbarButtonContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    height: "100%"
  },
  toolbar: {
    minHeight: 40,
    display: "flex",
    background: "#f1f1f1",
    flexDirection: "row",
    justifyContent: "center"
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  }
});
const toolBarIcons = {
  1: { label: "Search", icon: SearchIcon },
  2: { label: "Help", icon: HelpIcon },
  3: { label: "Settings", icon: SettingsIcon }
};
const SideToolBar = ({ open, classes, handleDrawerChange }) => {
  return (
    <Drawer
      variant="permanent"
      className={clsx(classes.drawer, {
        [classes.drawerOpen]: open,
        [classes.drawerClose]: !open
      })}
      classes={{
        paper: clsx({
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open
        })
      }}
      open={open}
    >
      <div className={classes.toolbarSpace}></div>
      <Divider />
      <List>
        {[1, 2, 3].map(x => {
          const Icon = toolBarIcons[x].icon;
          const itemLabel = toolBarIcons[x].label;
          return (
            <ListItem button key={itemLabel}>
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={itemLabel} />
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <div className={classes.toolbarButtonContainer}>
        <Divider style={{}} />
        <div
          onClick={handleDrawerChange}
          className={clsx(classes.toolbar, classes.toolbarSpace, {
            [classes.toolbarShift]: open
          })}
        >
          <IconButton>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
      </div>
    </Drawer>
  );
};

export default withStyles(styles)(SideToolBar);
