import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import Typography from "@material-ui/core/Typography";
import Drawer from "@material-ui/core/Drawer";
const drawerWidth = 90;
const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: "100px",
    marginTop: "40vh",
    background: "none",
    position: "absolute",
    right: 0,
    float: "right",
    margin: theme.spacing(5)
  },
  activeWhite: {
    color: "white !important"
  },
  activeBlack: {
    color: "#1b1919a3 !important"
  },
  activeBold: {
    fontWeight: "bold"
  },
  disabled: {
    color: "#1b1919a3"
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: "hidden",
    width: 0,
    borderLeft: 0,
    background: "none"
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    borderLeft: 0,
    background: "none"
  },
  drawerContent: {
    zIndex: -10,
    maxWidth: "100px",
    marginTop: "40vh",
    background: "none",
    position: "absolute",
    right: 0,
    float: "right",
    marginLeft: theme.spacing(2)
  },
  drawerLabelTwoLines: {
    marginBottom: theme.spacing(15)
  },
  drawerLabelOneLine: {
    marginBottom: theme.spacing(22)
  },
  line: {
    minHeight: 80
  },
  button: {
    marginBottom: theme.spacing(20)
  },
  vertical: {
    right: 0
  }
}));

function getSteps() {
  return ["Project Selection", "Analysis Search", "Dashboard"];
}

const SearchStepper = ({ activeStep, handleBackStep, stepTextValues }) => {
  const classes = useStyles();
  const steps = getSteps();
  const [detailsDrawer, setDetailsDrawer] = useState(false);
  const [stepperColour, setStepperColour] = useState(classes.activeWhite);

  useEffect(() => {
    activeStep === 2
      ? setStepperColour(classes.activeBlack)
      : setStepperColour(classes.activeWhite);
  }, [activeStep]);

  const handleStep = step => {
    if (step < activeStep) {
      handleBackStep(step);
    }
  };
  const moreDetailOpen = () => {
    setDetailsDrawer(true);
  };
  const moreDetailExit = () => {
    setDetailsDrawer(false);
  };
  return (
    <div className={classes.root}>
      {steps.map((label, index) => (
        <div
          key={index}
          className={classes.button}
          onMouseEnter={moreDetailOpen}
          onMouseLeave={moreDetailExit}
        >
          {activeStep === index ? (
            <RadioButtonCheckedIcon className={stepperColour} />
          ) : (
            <FiberManualRecordIcon
              className={index < activeStep ? stepperColour : classes.disabled}
              onClick={() => handleStep(index)}
            />
          )}
        </div>
      ))}
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: detailsDrawer,
          [classes.drawerClose]: !detailsDrawer
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: detailsDrawer,
            [classes.drawerClose]: !detailsDrawer
          })
        }}
        anchor={"right"}
        open={detailsDrawer}
        onMouseEnter={moreDetailOpen}
        onMouseLeave={moreDetailExit}
        onClose={() => setDetailsDrawer(false)}
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
      >
        <div className={classes.drawerContent}>
          {stepTextValues.map((value, index) => {
            return (
              <div
                className={clsx(
                  value.length >= 10
                    ? classes.drawerLabelTwoLines
                    : classes.drawerLabelOneLine,
                  index <= activeStep ? stepperColour : classes.disabled,
                  index === activeStep ? classes.activeBold : ""
                )}
              >
                {value}
              </div>
            );
          })}
        </div>
      </Drawer>
    </div>
  );
};
export default SearchStepper;
