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
import { withRouter } from "react-router";
import { Query } from "react-apollo";
import { GETALLDASHBOARDOPTIONS } from "../Queries/queries.js";

const NewDashboardPopup = ({ isOpen, handleClose, addUser, client }) => {
  const [isLoading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(null);
  const [isCreateDisabled, setIsDisabled] = useState(true);

  const [selectedIndices, setSelectedIndices] = useState([]);
  const [name, setName] = useState(null);

  const handleNameChange = event => {
    setName(event.target.value);
  };
  useEffect(() => {
    if (name && selectedIndices && !isCreateDisabled) {
      setIsDisabled(false);
    }
  }, [name, selectedIndices]);

  return (
    <Query query={GETALLDASHBOARDOPTIONS}>
      {({ loading, error, data }) => {
        if (loading) return null;
        if (error) return null;
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
                      <CheckIcon
                        style={{ fontSize: "6em", position: "absolute" }}
                      />
                    </IconButton>
                  )}
                  <LoadingCircle overRideStroke={6} />
                </div>
              </DialogContent>
            ) : (
              [
                <ValidatorForm ref="form">
                  <DialogTitle
                    id="form-dialog-title"
                    style={{ paddinBottom: 0 }}
                  >
                    Create New Dashboard
                  </DialogTitle>
                  <DialogContent>
                    <TextValidator
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
                      options={data.getAllIndices.map(option => option.name)}
                      setSelectedIndices={indices =>
                        setSelectedIndices(indices)
                      }
                    />
                  </DialogContent>
                  ,
                  <DialogActions>
                    <Button
                      onClick={handleClose}
                      color="secondary"
                      variant="outlined"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async ev => {}}
                      color="primary"
                      variant="contained"
                      disabled={isCreateDisabled}
                    >
                      Create
                    </Button>
                  </DialogActions>
                </ValidatorForm>
              ]
            )}
          </Dialog>
        );
      }}
    </Query>
  );
};

export default withRouter(NewDashboardPopup);
