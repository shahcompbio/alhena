import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import Typography from "@material-ui/core/Typography";

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
  active: {
    color: "white !important"
  },
  disabled: {
    color: "#1b1919a3"
  },
  line: {
    minHeight: 80
  },
  button: {
    marginBottom: theme.spacing(15)
  },
  vertical: {
    right: 0
  }
}));

function getSteps() {
  return ["Project Selection", "Analysis Search", "Dashboard"];
}

const SearchStepper = ({ activeStep, setActiveStep }) => {
  const classes = useStyles();
  const steps = getSteps();

  const handleStep = step => {
    if (step < activeStep) {
      setActiveStep(step);
    }
  };

  return (
    <div className={classes.root}>
      {steps.map((label, index) => (
        <div key={index} className={classes.button}>
          {activeStep === index ? (
            <RadioButtonCheckedIcon className={classes.active} />
          ) : (
            <FiberManualRecordIcon
              className={index < activeStep ? classes.active : classes.disabled}
              onClick={() => handleStep(index)}
            />
          )}
        </div>
      ))}
    </div>
  );
};
export default SearchStepper;
