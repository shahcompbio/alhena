import React, { useState, useRef } from "react";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import LoadingCircle from "./../ProgressCircle.js";
import IconButton from "@material-ui/core/IconButton";
import CheckIcon from "@material-ui/icons/Check";

const NewUserPopup = ({ isOpen, handleClose, addUser, client }) => {
  const [isLoading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const emailRef = useRef();
  const nameRef = useRef();
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
        [
          <DialogTitle id="form-dialog-title">Create New User</DialogTitle>,
          <DialogContent>
            <DialogContentText>
              To create a new user please enter their name and email. A
              confirmation email will be sent to them. Please tell the new user
              to also check their spam for an email from admin@shahcomponc.com
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Name"
              type="text"
              inputRef={nameRef}
              required
              fullWidth
            />
            <TextField
              margin="dense"
              id="name"
              label="Email Address"
              type="email"
              inputRef={emailRef}
              required
              fullWidth
            />
          </DialogContent>,
          <DialogActions>
            <Button onClick={handleClose} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={async ev => {
                setLoading(true);
                var acceptedEmail = await addUser(
                  ev,
                  client,
                  emailRef.current.value,
                  nameRef.current.value
                );
                setIsSent(true);
                setTimeout(() => {
                  setIsSent(false);
                  setLoading(false);
                  handleClose();
                }, 2000);
              }}
              color="primary"
              variant="contained"
            >
              Send
            </Button>
          </DialogActions>
        ]
      )}
    </Dialog>
  );
};
export default NewUserPopup;
