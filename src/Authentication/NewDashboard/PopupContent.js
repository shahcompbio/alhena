import React, { useState, useEffect } from "react";

import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { makeStyles } from "@material-ui/core/styles";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import Input from "@material-ui/core/Input";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Typography from "@material-ui/core/Typography";
import Slide from "@material-ui/core/Slide";
import Grid from "@material-ui/core/Grid";

import LoadingCircle from "../ProgressCircle.js";
import IconButton from "@material-ui/core/IconButton";
import CheckIcon from "@material-ui/icons/Check";

import TransferList from "../TransferList.js";

const useStylesStepper = makeStyles(theme => ({
  root: {
    width: "100%",
    minHeight: 400
  },
  backButton: {
    marginLeft: theme.spacing(1)
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  dialogButtons: {
    float: "right"
  },
  footer: {}
}));
const useStyles = makeStyles(theme => ({
  button: { color: "black", backgroundColor: theme.palette.secondary.main },
  dialogContent: { padding: "0px 10px" },
  dialogTitle: { paddinBottom: 0, marginLeft: "50px" },
  dialogWrapper: {
    height: 200,
    width: 250,
    margin: "auto",
    left: "25%",
    position: "absolute"
  },
  icon: { fontSize: "6em", position: "absolute" },
  iconButton: { top: "65%", left: "45%" },
  textField: {
    width: 350,
    left: 10,
    marginBottom: 10,
    "&$.MuiOutlinedInput-input": { padding: "15px 12px" }
  },
  searchInput: {
    padding: "15px 12px"
  },
  textValidator: { paddingBottom: 20, width: "80%", marginLeft: 50 }
}));
function getSteps() {
  return ["Dashboard Name", "Add Indices", "Choose Columns"];
}

function getStepContent(stepIndex) {
  switch (stepIndex) {
    case 0:
      return "Select a dashboard name";
    case 1:
      return "Add Indices";
    case 2:
      return "Choose dashboard selection columns";
    default:
      return "Unknown stepIndex";
  }
}
const slideTimeOut = 800;
const PopUpContent = ({
  isOpen,
  handleClose,
  isEdit,
  dashboardAction,
  dashboardName,
  allIndices,
  alreadySelectedIndices
}) => {
  const classes = useStylesStepper();

  const [selectedIndices, setSelectedIndices] = useState([]);
  const [name, setName] = useState(dashboardName);
  const [isLoading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(null);
  const [isActionDisabled, setIsDisabled] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
    setIsDisabled(true);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
    setIsDisabled(false);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleNameChange = event => {
    setName(event.target.value);
  };

  useEffect(() => {
    if (activeStep === 0 && name) {
      setIsDisabled(false);
    }
    if (activeStep === 1 && selectedIndices.length > 0) {
      setIsDisabled(false);
    }
  }, [name, selectedIndices]);

  const getDirection = index => (index === 0 ? "right" : "left");

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      maxWidth={"md"}
      PaperProps={{ style: { padding: 20, minHeight: 400, width: 888 } }}
    >
      {isLoading ? (
        <DialogContent
          style={{
            width: 500,
            height: 300,
            paddingTop: isSent && isLoading ? 0 : 20
          }}
        >
          <LoadingContent classes={classes} isSent={isSent} />
        </DialogContent>
      ) : (
        <Grid
          container
          direction="column"
          justify="space-between"
          alignItems="stretch"
          className={classes.root}
        >
          <Grid item style={{ height: "50%" }}>
            {activeStep === 0 && (
              <NameContent
                isEdit={isEdit}
                name={name}
                handleNameChange={handleNameChange}
              />
            )}
            {activeStep === 1 && (
              <TransferListContent
                isEdit={isEdit}
                setSearchValue={setSearchValue}
                setSelectedIndices={setSelectedIndices}
                searchValue={searchValue}
                allIndices={allIndices}
                alreadySelectedIndices={alreadySelectedIndices}
              />
            )}
          </Grid>
          <Grid item>
            <div className={classes.footer}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map(label => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <div className={classes.dialogButtons}>
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className={classes.backButton}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={isActionDisabled}
                    onClick={handleNext}
                  >
                    {activeStep === steps.length - 1 ? "Finish" : "Next"}
                  </Button>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
      )}
    </Dialog>
  );
};
const NameContent = ({ isEdit, name, handleNameChange }) => {
  const classes = useStyles();
  return (
    <ValidatorForm key={"validForm"} onSubmit={() => {}}>
      <DialogTitle
        id="form-dialog-title"
        className={classes.dialogTitle}
        key={"dialogTitle"}
      >
        {isEdit ? "Edit Dashboard" : "Create New Dashboard"}
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <TextValidator
          key={"dialogName"}
          autoFocus
          disabled={isEdit}
          margin="dense"
          id="name"
          label="Name"
          type="text"
          value={name}
          onChange={handleNameChange}
          validators={["required"]}
          errorMessages={["This field is required"]}
          required
          className={classes.textValidator}
        />
      </DialogContent>
    </ValidatorForm>
  );
};
const TransferListContent = ({
  isEdit,
  setSearchValue,
  setSelectedIndices,
  searchValue,
  allIndices,
  alreadySelectedIndices
}) => {
  const classes = useStyles();
  return (
    <ValidatorForm key={"validForm"} onSubmit={() => {}}>
      <DialogTitle
        id="form-dialog-title"
        className={classes.dialogTitle}
        key={"dialogTitle"}
      >
        {isEdit ? "Edit Dashboard" : "Create New Dashboard"}
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <TextField
          id="outlined-search"
          label="Search Analyses"
          type="search"
          variant="outlined"
          value={searchValue}
          className={classes.textField}
          InputProps={{ classes: { input: classes.searchInput } }}
          onChange={event => setSearchValue(event.target.value)}
        />
        <TransferList
          key={"transferList"}
          allIndices={allIndices}
          searchValue={searchValue}
          setSelectedIndices={indices => setSelectedIndices(indices)}
          alreadyChoosen={alreadySelectedIndices}
        />
      </DialogContent>
    </ValidatorForm>
  );
};
const LoadingContent = ({ classes, isSent }) => (
  <div className={classes.dialogWrapper}>
    {isSent && (
      <IconButton className={classes.iconButton}>
        <CheckIcon className={classes.icon} />
      </IconButton>
    )}
    <LoadingCircle overRideStroke={6} />
  </div>
);
export default PopUpContent;
