import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import * as d3 from "d3";

import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import Drawer from "@material-ui/core/Drawer";
import Tooltip from "@material-ui/core/Tooltip";

const drawerWidth = 90;
const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: "100px",
    marginTop: "40vh",
    background: "none",
    position: "fixed",
    right: 0,
    float: "right",
    margin: theme.spacing(5)
  },
  activeWhite: {
    cursor: "pointer",
    color: "white !important"
  },
  activeBlack: {
    color: "#1b1919a3 !important"
  },
  activeBold: {
    cursor: "pointer",
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
  isLongAnalysisName: {
    cursor: "pointer"
  },

  drawerLabelTwoLines: {
    cursor: "pointer",
    marginBottom: theme.spacing(15)
  },
  drawerLabelOneLine: {
    cursor: "pointer",
    marginBottom: theme.spacing(20)
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
  return ["Project Select", "Analysis Search", "Dashboard"];
}
const SearchStepper = ({ activeStep, handleBackStep, stepTextValues }) => {
  const classes = useStyles();
  const steps = getSteps();
  const [detailsDrawer, setDetailsDrawer] = useState(
    activeStep === 1 ? true : false
  );
  const [stepperColour, setStepperColour] = useState(classes.activeWhite);

  useEffect(() => {
    activeStep === 2
      ? setStepperColour(classes.activeBlack)
      : setStepperColour(classes.activeWhite);
  }, [activeStep]);

  const handleStep = step => {
    if (activeStep === 1) {
      setDetailsDrawer(true);
    }

    if (step === 0 || step === 1) {
      //  d3.selectAll("#root").style("background", "#20262b");
    } else {
      //  d3.selectAll("#root").style("background", "#f7f7f7");
    }
    if (step < activeStep) {
      handleBackStep(step);
    }
  };
  const moreDetailOpen = () => {
    setDetailsDrawer(true);
  };
  const moreDetailExit = () => {
    if (activeStep !== 1) {
      setDetailsDrawer(false);
    }
  };
  return (
    <div className={classes.root}>
      {steps.map((label, index) => (
        <span key={"span-wrapper" + label}>
          <Tooltip
            key={"tooltip" + label}
            title={label}
            aria-label={label}
            arrow
            placement="left"
          >
            <div
              key={"step-wrapper" + label}
              className={classes.button}
              onMouseEnter={moreDetailOpen}
              onMouseLeave={moreDetailExit}
            >
              {activeStep === index ? (
                <RadioButtonCheckedIcon className={stepperColour} />
              ) : (
                <FiberManualRecordIcon
                  className={
                    index < activeStep ? stepperColour : classes.disabled
                  }
                  onClick={() => handleStep(index)}
                />
              )}
            </div>
          </Tooltip>
          {activeStep > index ? (
            <div
              key={"step-wrapper" + label}
              className={stepperColour}
              style={{
                marginTop: -75,
                marginLeft: 5,
                color: "white",
                fontWeight: "bold"
              }}
            >
              ﹀
            </div>
          ) : (
            <div
              style={{
                marginTop: -75
              }}
            />
          )}
        </span>
      ))}
    </div>
  );
};
export default SearchStepper;
