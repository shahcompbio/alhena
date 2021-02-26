import React, {
  useState,
  useEffect,
  useWindowSize,
  useLayoutEffect
} from "react";
import Menu from "../Misc/Menu.js";
import ProjectViewContent from "./ProjectView/ProjectViewContent.js";
import Publications from "./ProjectView/Publications/Publications.js";

import Stepper from "./Stepper.js";
import Slide from "@material-ui/core/Slide";
import DashboardContent from "../Dashboard/DashboardContent.js";
import OverviewContent from "./Overview/OverviewContent.js";

import Backdrop from "@material-ui/core/Backdrop";
import Grid from "@material-ui/core/Grid";

import { useHistory } from "react-router-dom";
import { useDashboardState } from "./ProjectView/ProjectState/dashboardState";

import { withStyles } from "@material-ui/styles";

const styles = ({ theme }) => ({
  root: { flexGrow: 1, height: "100vh" },
  hide: {
    display: "none"
  },
  sliderContent: { position: "absolute", width: "95%", height: "100%" }
});
const defaultStepperText = ["Analysis Selection", "View Dashboard"];
const dashboardPathname = "/dashboards";
const slideTimeOut = 1500;
const Content = ({ classes }) => {
  let history = useHistory();

  const [
    { selectedDashboard, selectedAnalysis },
    dispatch
  ] = useDashboardState();
  const [width, height] = useWindowSize();

  useEffect(() => {
    if (height && width) {
      dispatch({
        type: "SIZE_CHANGE",
        width: width,
        height: height
      });
    }
  }, [height, width]);

  function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
      function updateSize() {
        if (
          selectedAnalysis === null &&
          (size[0] !== window.innerWidth || size[1] !== window.innerHeight)
        ) {
          setSize([window.innerWidth, window.innerHeight]);
        }
      }
      window.addEventListener("resize", updateSize);
      updateSize();

      return () => window.removeEventListener("resize", updateSize);
    }, [selectedAnalysis, size]);
    return size;
  }
  if (
    history.location.pathname !== dashboardPathname &&
    selectedAnalysis === null
  ) {
    history.replace(dashboardPathname);
  }

  const [activeStep, setActiveStep] = useState(selectedAnalysis ? 1 : 0);
  const [stepTextValues, setStepTextValues] = useState(defaultStepperText);
  const [isBackwards, setIsBackwards] = useState(false);

  const handleBackStep = index => {
    setIsBackwards(true);
    setActiveStep(index);
    /*  if (index === 0) {
      dispatch({
        type: "DASHBOARD_SELECT",
        value: { selectedDashboard: null }
      });
    }*/
    if (index === 0) {
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
      if (selectedAnalysis && i === 1) {
        return selectedAnalysis;
      } else {
        return defaultStepperText[i];
      }
    });
    setStepTextValues([...newStepperTextValues]);
  }, [selectedAnalysis]);

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
  /*      <Slide
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
      </Slide>*/
  return (
    <Grid className={classes.root}>
      <Slide
        direction={getDirection(0)}
        in={activeStep === 0}
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
        direction={getDirection(1)}
        in={activeStep === 1}
        mountOnEnter
        unmountOnExit
        timeout={400}
        key={"slideDashboard"}
      >
        <div className={classes.sliderContent}>
          <DashboardContent />
        </div>
      </Slide>
      <Slide
        direction={activeStep !== 1 ? "up" : "down"}
        in={activeStep !== 1}
        mountOnEnter
        unmountOnExit
        timeout={activeStep !== 1 ? 100 : 1000}
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
