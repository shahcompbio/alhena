import React, { useState, useRef, useCallback, useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import Menu from "../Misc/Menu.js";

import DashboardWrapper from "./DashboardWrapper.js";
import ProjectViewContent from "./ProjectView/ProjectViewContent.js";
import Stepper from "./Stepper.js";
import Slide from "@material-ui/core/Slide";
import DashboardContent from "../Dashboard/DashboardContent.js";
import OverviewContent from "./Overview/OverviewContent.js";
import NoMatch from "./NoMatch.js";

import Backdrop from "@material-ui/core/Backdrop";
import Grid from "@material-ui/core/Grid";

import { useDashboardState } from "./ProjectView/ProjectState/dashboardState";

import { withStyles } from "@material-ui/styles";

const styles = ({ theme }) => ({
  root: { flexGrow: 1, height: "100vh" },
  hide: {
    display: "none"
  },
  sliderContent: { position: "absolute", width: "95%" }
});
const defaultStepperText = [
  "Dashboard Selection",
  "Analysis Selection",
  "View Dashbaord"
];
const slideTimeOut = 1500;
const Content = ({ classes, history }) => {
  const [
    { selectedDashboard, selectedAnalysis },
    dispatch
  ] = useDashboardState();
  const [activeStep, setActiveStep] = useState(0);
  const [stepTextValues, setStepTextValues] = useState(defaultStepperText);
  const [hasBackdrop, setHasBackDrop] = useState(true);
  const [isBackwards, setIsBackwards] = useState(false);

  const handleBackStep = index => {
    setIsBackwards(true);
    setActiveStep(index);
    if (index === 0) {
      dispatch({
        type: "DASHBOARD_SELECT",
        value: { selectedDashboard: null }
      });
    }
    if (index === 1) {
      dispatch({
        type: "ANALYSIS_SELECT",
        value: { selectedAnalysis: null }
      });
    }
    const newStepperTextValues = stepTextValues.map((text, i) => {
      return i < index ? defaultStepperText[i] : text;
    });
    setStepTextValues([...newStepperTextValues]);
  };

  useEffect(() => {
    const newStepperTextValues = stepTextValues.map((text, i) => {
      if (selectedDashboard && i == 0) {
        return selectedDashboard;
      } else if (selectedAnalysis && i === 1) {
        return "SC-123";
      } else {
        return defaultStepperText[i];
      }
    });
    setStepTextValues([...newStepperTextValues]);
  }, [selectedDashboard, selectedAnalysis]);

  const handleForwardStep = index => {
    setIsBackwards(false);
    setActiveStep(index);
  };

  useEffect(() => {
    if (activeStep === 2) {
      setHasBackDrop(false);
    } else {
      setHasBackDrop(true);
    }
  }, [activeStep]);

  const getDirection = index =>
    activeStep === index
      ? isBackwards
        ? "down"
        : "up"
      : isBackwards
      ? "up"
      : "down";

  return (
    <Grid className={classes.root}>
      <Menu />

      <Slide
        timeout={slideTimeOut}
        direction={getDirection(0)}
        in={activeStep === 0}
        mountOnEnter
        unmountOnExit
        key={"slideOverviewContent"}
      >
        <div className={classes.sliderContent}>
          <OverviewContent
            handleForwardStep={() => handleForwardStep(activeStep + 1)}
          />
        </div>
      </Slide>
      <Slide
        direction={getDirection(1)}
        in={activeStep === 1}
        mountOnEnter
        unmountOnExit
        timeout={slideTimeOut}
        key={"slideProjectViewContent"}
      >
        <div className={classes.sliderContent}>
          <ProjectViewContent
            handleForwardStep={() => handleForwardStep(activeStep + 1)}
          />
        </div>
      </Slide>
      <Slide
        direction={getDirection(2)}
        in={activeStep === 2}
        mountOnEnter
        unmountOnExit
        timeout={slideTimeOut}
        key={"slideDashboard"}
      >
        <div className={classes.sliderContent}>
          <DashboardContent />
        </div>
      </Slide>
      <Slide
        direction={activeStep !== 2 ? "up" : "down"}
        in={activeStep !== 2}
        mountOnEnter
        unmountOnExit
        timeout={activeStep !== 2 ? 100 : 1000}
        key={"slideBackdrop"}
      >
        <Backdrop open={true}></Backdrop>
      </Slide>
      <Stepper
        activeStep={activeStep}
        handleBackStep={handleBackStep}
        stepTextValues={stepTextValues}
      />
    </Grid>
  );
};

export default withStyles(styles)(Content);
