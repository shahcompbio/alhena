import React from "react";

import { withStyles } from "@material-ui/core/styles";
import clsx from "clsx";

import IconButton from "@material-ui/core/IconButton";
import Toolbar from "@material-ui/core/Toolbar";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import SideToolBar from "./SideToolBar.js";

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
  }
});

const DashboardContent = ({ classes, history }) => {
  //const [{ authKeyID, uid }] = useAppState();

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
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Typography paragraph>heatmap</Typography>
      </main>
    </div>
  );
};

export default withStyles(styles)(DashboardContent);
