import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import * as yup from "yup";

//import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import makeStyles from "@mui/styles/makeStyles";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Input from "@mui/material/Input";

import LoadingCircle from "./ProgressCircle.js";
import IconButton from "@mui/material/IconButton";
import CheckIcon from "@mui/icons-material/Check";

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
  //const [name, setName] = useState(dashboardName);
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
        <span>
          <DialogTitle
            id="form-dialog-title"
            sx={{ paddingBottom: 0 }}
            key={"dialogTitle"}
          >
            {isEdit ? "Edit Dashboard" : "Create New Dashboard"}
          </DialogTitle>
          <Formik
            validationSchema={yup.object({
              name: yup
                .string()
                .min(2, "Must be at least 2 characters")
                .required("Name is required")
            })}
            initialValues={{
              name: dashboardName
            }}
            autoComplete="off"
          >
            {({
              values,
              errors,
              touched,
              handleSubmit,
              handleChange,
              setFieldValue,
              isValid
            }) => (
              <span>
                <DialogContent sx={{ padding: "0px 24px", fontSize: 16 }}>
                  <TextValidator
                    key={"dialogName"}
                    autoFocus
                    disabled={isEdit}
                    margin="dense"
                    id="name"
                    label="Name"
                    type="text"
                    value={values.name}
                    onChange={event =>
                      setFieldValue("name", event.target.value)
                    }
                    error={touched.name && Boolean(errors.name)}
                    helperText={errors.name}
                    required
                    fullWidth
                    sx={{ paddingBottom: "20px" }}
                  />

                  <TextField
                    id="outlined-search"
                    label="Search Analyses"
                    type="search"
                    variant="outlined"
                    value={searchValue}
                    sx={{
                      width: 350,
                      left: 10,
                      marginBottom: 10,
                      "&$.MuiOutlinedInput-input": { padding: "15px 12px" }
                    }}
                    InputProps={{
                      classes: { input: { padding: "15px 12px" } }
                    }}
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
                    //className={classes.button}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async ev => {
                      setLoading(true);
                      await dashboardAction(values.name, selectedIndices);
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
              </span>
            )}
          </Formik>
        </span>
      )}
    </Dialog>
  );
};
const LoadingContent = ({ classes, isSent }) => (
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
      <IconButton sx={{ top: "65%", left: "45%" }} size="large">
        <CheckIcon sx={{ fontSize: "6em", position: "absolute" }} />
      </IconButton>
    )}
    <LoadingCircle overRideStroke={6} />
  </div>
);
export default PopUpContent;
