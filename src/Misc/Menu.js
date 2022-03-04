import React, { useState } from "react";
import { withStyles } from "@material-ui/core/styles";

import { withRouter } from "react-router-dom";

import { useAppState } from "../util/app-state";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import HelpIcon from "@material-ui/icons/Help";
import SearchIcon from "@material-ui/icons/Search";
import ExitToApp from "@material-ui/icons/ExitToApp";
import MenuIcon from "@material-ui/icons/Menu";
import SpeedDial from "@material-ui/lab/SpeedDial";
import InfoIcon from "@material-ui/icons/Info";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import SupervisorAccountIcon from "@material-ui/icons/SupervisorAccount";

const styles = theme => ({
  fab: {
    backgroundColor: "#c7e4e8",
    //backgroundColor: theme.palette.primary.main,
    boxShadow: "none !important",
    borderRadius: "10%",
    "&:hover": {
      backgroundColor: "#c7e4e8"
      //  backgroundColor: theme.palette.primary.main
    }
  },
  menu: {
    color: "black",
    backgroundColor: "#c7e4e8",
    //  backgroundColor: theme.palette.primary.main,
    boxShadow:
      "0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0) !important",

    "&:hover": {
      boxShadow:
        "0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0) !important",

      color: theme.palette.background.default,
      backgroundColor: "#c7e4e8"
      //backgroundColor: theme.palette.primary.main
    }
  },
  root: {
    flexGrow: 1
  },
  wrapper: {
    zIndex: 100,
    float: "left",
    position: "fixed",
    bottom: 15,
    left: 15,
    width: 380
  },
  speedDial: {
    color: theme.palette.primary.dark,
    boxShadow: "none !important",
    zIndex: 101,
    float: "left",
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
  const [{ isSuperUser, authKeyID }, dispatch] = useAppState();
  const [actions] = useState(
    isSuperUser
      ? [...adminActions, ...defaultActions]
      : authKeyID === null
      ? [...unauthenticatedActions]
      : [...defaultActions]
  );

  const [direction] = useState("up");
  const [open, setOpen] = useState(false);

  const handleClose = (event, reason) => {
    if (reason !== "toggle") {
      setOpen(false);
    }
  };

  const handleOpen = (event, reason) => {
    setOpen(true);
  };

  const handleAction = (name, history, dispatch) => {
    switch (name) {
      case "Back":
        return history.goBack();
      case "Logout": {
        dispatch({
          type: "LOGOUT"
        });
        return;
      }
      case "Admin":
        return history.push("/admin");
      case "Search":
        return history.push("/dashboards");
      default:
        return setOpen(false);
    }
  };

  return (
    <div className={classes.root}>
      <div
        className={classes.wrapper}
        style={{ pointerEvents: open ? "all" : "none" }}
      >
        <SpeedDial
          ariaLabel="Alhena Menu"
          classes={{ root: classes.speedDial, fab: classes.fab }}
          icon={<MenuIcon className={classes.menu} />}
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
              onClick={() => {
                return handleAction(action.name, history, dispatch);
              }}
            />
          ))}
        </SpeedDial>
      </div>
    </div>
  );
};
export default withStyles(styles)(withRouter(Menu));
