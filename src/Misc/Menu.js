import React, { useState } from "react";

import { withRouter } from "react-router-dom";

import { useAppState } from "../util/app-state";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import HelpIcon from "@mui/icons-material/Help";
import SearchIcon from "@mui/icons-material/Search";
import ExitToApp from "@mui/icons-material/ExitToApp";
import MenuIcon from "@mui/icons-material/Menu";
import SpeedDial from "@mui/material/SpeedDial";
import InfoIcon from "@mui/icons-material/Info";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";

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
  const [openSpeed, setOpenSpeed] = useState(false);

  const handleClose = (event, reason) => {
    if (reason !== "toggle") {
      setOpenSpeed(false);
    }
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
        return setOpenSpeed(false);
    }
  };

  return (
    <div
      style={{
        flexGrow: 1
      }}
    >
      <div
        style={{
          pointerEvents: openSpeed ? "all" : "none",
          zIndex: 100,
          float: "left",
          position: "fixed",
          bottom: 15,
          left: 15,
          width: 380
        }}
      >
        <SpeedDial
          ariaLabel="Alhena Menu"
          sx={{
            color: "#31506b !important",
            //backgroundColor: "#31506b",
            boxShadow: "none !important",
            zIndex: 101,
            float: "left",
            "& .MuiSpeedDial-fab": {
              backgroundColor: "#31506b !important"
            },
            "&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft": {
              bottom: 2,
              right: 2
            },
            "&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight": {
              top: 2,
              left: 2
            }
          }}
          icon={
            <MenuIcon
              sx={theme => ({
                color: "white",
                backgroundColor: "#31506b !important",
                boxShadow:
                  "0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0) !important",

                "&:hover": {
                  boxShadow:
                    "0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0) !important",

                  color: theme.palette.background.default,
                  backgroundColor: "#31506b"
                }
              })}
            />
          }
          onClose={event => {
            event.persist();
            handleClose(event);
          }}
          transitionDuration={{ exit: 100 }}
          onOpen={event => {
            event.persist();
            setOpenSpeed(true);
          }}
          open={openSpeed}
          direction={direction}
        >
          {actions.map(action => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              tooltipPlacement={"right"}
              onClick={event => {
                event.stopPropagation();
                handleAction(action.name, history, dispatch);
              }}
            />
          ))}
        </SpeedDial>
      </div>
    </div>
  );
};
export default withRouter(Menu);
