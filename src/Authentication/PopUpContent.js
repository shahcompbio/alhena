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

import LoadingCircle from "./ProgressCircle.js";
import IconButton from "@material-ui/core/IconButton";
import CheckIcon from "@material-ui/icons/Check";

import TransferList from "./TransferList.js";

const useStyles = makeStyles(theme => ({
  button: { color: "black", backgroundColor: theme.palette.secondary.main },
  dialogContent: { padding: "0px 24px", fontSize: 16 },
  dialogTitle: { paddinBottom: 0 },
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
  textValidator: { paddingBottom: 20 }
}));

const PopUpContent = ({
  isOpen,
  handleClose,
  isEdit,
  dashboardAction,
  dashboardName,
  allIndices,
  alreadySelectedIndices
}) => {
  const classes = useStyles();
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [name, setName] = useState(dashboardName);
  const [isLoading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(null);
  const [isActionDisabled, setIsDisabled] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  const handleNameChange = event => {
    setName(event.target.value);
  };

  useEffect(() => {
    if (name && selectedIndices.length > 0) {
      setIsDisabled(false);
    }
    if (!name || selectedIndices.length === 0) {
      setIsDisabled(true);
    }
  }, [name, selectedIndices]);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      maxWidth={"md"}
      PaperProps={{ style: { padding: 20 } }}
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
              fullWidth
              className={classes.textValidator}
            />

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
          <DialogActions>
            <Button
              onClick={handleClose}
              color="secondary"
              variant="outlined"
              className={classes.button}
            >
              Cancel
            </Button>
            <Button
              onClick={async ev => {
                setLoading(true);
                await dashboardAction(name, selectedIndices);
                setIsSent(true);
                setTimeout(() => {
                  setIsSent(false);
                  setLoading(false);
                  handleClose();
                }, 2000);
              }}
              style={{ backgroundColor: "#4e89bb" }}
              variant="contained"
              disabled={isActionDisabled}
            >
              {isEdit ? "Submit" : "Create"}
            </Button>
          </DialogActions>
        </ValidatorForm>
      )}
    </Dialog>
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
