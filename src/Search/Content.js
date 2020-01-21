import React, { useState, useRef, useCallback, useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import Menu from "../Misc/Menu.js";

import DashboardWrapper from "./DashboardWrapper.js";
import ProjectViewContent from "./ProjectView/ProjectViewContent.js";
import Stepper from "./Stepper.js";
import Slide from "@material-ui/core/Slide";
import OverviewContent from "./Overview/OverviewContent.js";
import NoMatch from "./NoMatch.js";

import Backdrop from "@material-ui/core/Backdrop";
import Grid from "@material-ui/core/Grid";

import { withStyles } from "@material-ui/styles";

const styles = ({ theme }) => ({
  root: { flexGrow: 1, height: "100vh" },
  hide: {
    display: "none"
  },
  sliderContent: { position: "absolute", width: "95%" }
});

const Content = ({ classes, history }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [sliderContent, setSliderContent] = useState(
    <OverviewContent activeStep={activeStep} setActiveStep={setActiveStep} />
  );
  const [isBackwards, setIsBackwards] = useState(false);
  const handleBackStep = index => {
    setIsBackwards(true);
    setActiveStep(index);
  };
  const handleForwardStep = index => {
    setIsBackwards(false);
    setActiveStep(index);
  };
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
        timeout={1500}
        direction={getDirection(0)}
        in={activeStep === 0}
        mountOnEnter
        unmountOnExit
      >
        <div className={classes.sliderContent}>
          <OverviewContent
            activeStep={activeStep}
            setActiveStep={handleForwardStep}
          />
        </div>
      </Slide>
      <Slide
        direction={getDirection(1)}
        in={activeStep === 1}
        mountOnEnter
        unmountOnExit
        timeout={1500}
      >
        <div className={classes.sliderContent}>
          <ProjectViewContent
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />
        </div>
      </Slide>
      <Slide
        direction={activeStep === 2 ? "up" : "down"}
        in={activeStep === 2}
        mountOnEnter
        unmountOnExit
        timeout={1500}
      >
        <div className={classes.sliderContent}>hello</div>
      </Slide>
      <Slide
        direction={activeStep !== 2 ? "up" : "down"}
        in={activeStep !== 2}
        mountOnEnter
        unmountOnExit
        timeout={100}
      >
        <Backdrop open={true}></Backdrop>
      </Slide>
      <Stepper activeStep={activeStep} setActiveStep={handleBackStep} />
    </Grid>
  );
};

export default withStyles(styles)(Content);
