import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import { withRouter } from "react-router-dom";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Switch from "@material-ui/core/Switch";
import SpeedDial from "@material-ui/lab/SpeedDial";
import MenuIcon from "@material-ui/icons/Menu";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";

import HelpIcon from "@material-ui/icons/Help";
import ShareIcon from "@material-ui/icons/Share";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

const useStyles = makeStyles(theme => ({
  root: {
    transform: "translateZ(0px)",
    flexGrow: 1
  },
  exampleWrapper: {
    position: "relative",
    float: "left",
    bottom: 100,
    left: 25,
    width: 380
  },
  speedDial: {
    color: "white",
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
}));

const actions = [
  { icon: <ArrowBackIcon />, name: "Back" },
  {
    icon: <HelpIcon />,
    name: "Help"
  },
  { icon: <ExitToAppIcon />, name: "Logout" }
];

const Menu = ({ history }) => {
  const classes = useStyles();
  const [direction, setDirection] = React.useState("right");
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleAction = (name, history) => {
    switch (name) {
      case "Back":
        history.goBack();
      case "Logout":
        history.push("/login");
      default:
        setOpen(false);
    }
  };
  return (
    <div className={classes.root}>
      <div className={classes.exampleWrapper}>
        <SpeedDial
          ariaLabel="Alhena Menu"
          className={classes.speedDial}
          icon={<MenuIcon />}
          FabProps={{ color: "white" }}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
          direction={direction}
        >
          {actions.map(action => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              tooltipPlacement={"top"}
              onClick={() => handleAction(action.name, history)}
            />
          ))}
        </SpeedDial>
      </div>
    </div>
  );
};
export default withRouter(Menu);
