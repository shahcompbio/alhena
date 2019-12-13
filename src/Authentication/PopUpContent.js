import React, { useState, useEffect } from "react";

import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

import LoadingCircle from "./ProgressCircle.js";
import IconButton from "@material-ui/core/IconButton";
import CheckIcon from "@material-ui/icons/Check";

import TransferList from "./TransferList.js";

const PopUpContent = ({
  isOpen,
  handleClose,
  isEdit,
  dashboardAction,
  dashboardName,
  allIndices,
  alreadySelectedIndices
}) => {
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [name, setName] = useState(dashboardName);
  const [isLoading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(null);
  const [isActionDisabled, setIsDisabled] = useState(true);

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
    >
      {isLoading ? (
        <DialogContent
          style={{
            width: 500,
            height: 300,
            paddingTop: isSent && isLoading ? 0 : 20
          }}
        >
          <div
            style={{
              height: 200,
              width: 250,
              margin: "auto",
              left: "25%",
              position: "absolute"
            }}
          >
            {isSent && (
              <IconButton style={{ top: "65%", left: "45%" }}>
                <CheckIcon style={{ fontSize: "6em", position: "absolute" }} />
              </IconButton>
            )}
            <LoadingCircle overRideStroke={6} />
          </div>
        </DialogContent>
      ) : (
        <ValidatorForm key={"validForm"}>
          <DialogTitle
            id="form-dialog-title"
            style={{ paddinBottom: 0 }}
            key={"dialogTitle"}
          >
            {isEdit ? "Edit Dashboard" : "Create New Dashboard"}
          </DialogTitle>
          <DialogContent>
            <TextValidator
              key={"dialogName"}
              autoFocus
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
              style={{ paddingBottom: 20 }}
            />
            <TransferList
              key={"transferList"}
              allIndices={allIndices}
              setSelectedIndices={indices => setSelectedIndices(indices)}
              alreadyChoosen={alreadySelectedIndices}
            />
          </DialogContent>
          ,
          <DialogActions>
            <Button onClick={handleClose} color="secondary" variant="outlined">
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
              color="primary"
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
export default PopUpContent;
