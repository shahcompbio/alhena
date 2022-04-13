import React, { useState, useEffect } from "react";

import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import Tooltip from "@mui/material/Tooltip";
import Grid from "@mui/material/Grid";

function getSteps() {
  return ["Project Selection", "Analysis Search", "Dashboard"];
}

const SearchStepper = ({ activeStep, handleBackStep, stepTextValues }) => {
  const steps = getSteps();
  const [stepperColour, setStepperColour] = useState({
    fontSize: 20,
    cursor: "pointer",
    color: "#e5b150 !important"
  });

  useEffect(() => {
    activeStep === 2
      ? setStepperColour({ fontSize: 40, color: "#e5b150 !important" })
      : setStepperColour({
          fontSize: 40,
          cursor: "pointer",
          color: "#e5b150 !important"
        });
  }, [activeStep]);

  const handleStep = step => {
    if (step < activeStep) {
      handleBackStep(step);
    }
  };

  return (
    <Grid
      sx={{
        maxWidth: "100px",
        marginTop: "40vh !important",
        background: "none",
        position: "fixed",
        right: 0,
        float: "right",
        margin: 2
      }}
    >
      {steps.map((label, index) => (
        <span key={"span-wrapper" + label}>
          <Tooltip
            key={"tooltip" + label}
            title={label}
            aria-label={label}
            arrow
            placement="left"
          >
            <div key={"step-wrapper" + label}>
              {activeStep === index ? (
                <RadioButtonCheckedIcon sx={stepperColour} />
              ) : (
                <FiberManualRecordIcon
                  sx={
                    index < activeStep
                      ? stepperColour
                      : {
                          fontSize: 40,
                          color: "#c3c3c3",
                          pointer: "none !important"
                        }
                  }
                  onClick={() => handleStep(index)}
                />
              )}
            </div>
          </Tooltip>
          {index !== 2 &&
            (activeStep > index ? (
              <span
                key={"step-wrapper" + label}
                className={stepperColour}
                style={{
                  marginLeft: "4px",
                  color: "#e5b150",
                  fontWeight: "bold",
                  fontSize: "30px"
                }}
              >
                ▼
              </span>
            ) : (
              <span
                style={{
                  fontSize: "30px",
                  marginLeft: "4px",
                  color: "#c3c3c3",
                  fontWeight: "bold"
                }}
              >
                ▼
              </span>
            ))}
        </span>
      ))}
    </Grid>
  );
};
export default SearchStepper;
