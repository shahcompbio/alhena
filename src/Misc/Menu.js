import React, { useState, useEffect } from "react";
import { withStyles, useTheme } from "@material-ui/core/styles";

import { withRouter } from "react-router-dom";

import { useAppState } from "../util/app-state";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import { shadows } from "@material-ui/system";
import Fab from "@material-ui/core/Fab";
import Backdrop from "@material-ui/core/Backdrop";
import HelpIcon from "@material-ui/icons/Help";
import SearchIcon from "@material-ui/icons/Search";
import ExitToApp from "@material-ui/icons/ExitToApp";
import MenuIcon from "@material-ui/icons/Menu";
import Tooltip from "@material-ui/core/Tooltip";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import InfoIcon from "@material-ui/icons/Info";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import Button from "@material-ui/core/Button";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";

const styles = theme => ({
  fab: {
    backgroundColor: theme.palette.primary.main,
    boxShadow: "none !important",
    borderRadius: "10%",
    "&:hover": {
      backgroundColor: theme.palette.primary.main
    }
  },
  menu: {
    color: "black",
    backgroundColor: theme.palette.primary.main,
    boxShadow:
      "0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0) !important",

    "&:hover": {
      boxShadow:
        "0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0) !important",

      color: theme.palette.background.default,
      backgroundColor: theme.palette.primary.main
    }
  },
  root: {
    flexGrow: 1
  },
  wrapper: {
    zIndex: 100,
    float: "left",
    position: "fixed",
    top: 15,
    left: 15,
    width: 380
  },
  speedDial: {
    boxShadow: "none",
    color: theme.palette.primary.dark,
    boxShadow: "none !important",
    zIndex: 101,
    position: "absolute",
    "&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft": {
      bottom: theme.spacing(2),
      right: theme.spacing(2)
    },
    "&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight": {
      top: theme.spacing(2),
      left: theme.spacing(2)
    }
  }
});
const unauthenticatedActions = [
  {
    icon: <AccountCircleIcon />,
    name: "Login"
  },
  {
    icon: <InfoIcon />,
    name: "About"
  }
];
const defaultActions = [
  {
    icon: <SearchIcon />,
    name: "Search"
  },
  {
    icon: <HelpIcon />,
    name: "Help"
  },
  { icon: <ExitToApp />, name: "Logout" }
];
const adminActions = [{ icon: <SupervisorAccountIcon />, name: "Admin" }];

const Menu = ({ history, classes }) => {
  const [{ isSuperUser, authKeyID }] = useAppState();
  const [actions] = useState(
    isSuperUser
      ? [...adminActions, ...defaultActions]
      : authKeyID === null
      ? [...unauthenticatedActions]
      : [...defaultActions]
  );
  const theme = useTheme();
  const [direction] = useState("down");
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleAction = (name, history) => {
    switch (name) {
      case "Back":
        return history.goBack();
      case "Logout":
        return history.push("/login");
      case "Admin":
        return history.push("/admin");
      case "Search":
        return history.push("/dashboards");
      default:
        return setOpen(false);
    }
  };
  // <Backdrop open={open} />
  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <SpeedDial
          enableMouseActions
          ariaLabel="Alhena Menu"
          classes={{ root: classes.speedDial, fab: classes.fab }}
          icon={
            <Fab classes={{ root: classes.fab }} boxShadow={0} elevation={0}>
              <MenuIcon className={classes.menu} />
            </Fab>
          }
          onClose={handleClose}
          transitionDuration={{ exit: 100 }}
          onOpen={handleOpen}
          open={open}
          direction={direction}
        >
          {actions.map(action => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              tooltipPlacement={"right"}
              onClick={() => handleAction(action.name, history)}
            />
          ))}
        </SpeedDial>
      </div>
    </div>
  );
};
export default withStyles(styles)(withRouter(Menu));
