import React, { useState, useEffect } from "react";
import _ from "lodash";

import { Formik } from "formik";
import * as yup from "yup";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import MuiAlert from "@mui/material/Alert";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";

import LoadingCircle from "../ProgressCircle.js";

import TransferList from "../TransferList.js";

function getSteps() {
  return ["Dashboard Name", "Add Indices", "Show/Hide Metadata", "Add Users"];
}

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const PopUpContent = ({
  isOpen,
  handleClose,
  isEdit,
  dashboardAction,
  dashboardName,
  allIndices,
  alreadySelectedIndices,
  allDashboardColumns,
  selectedDashboardColumns,
  selectedDashboardUsers,
  allDashboardsUsers
}) => {
  const [selectedIndices, setSelectedIndices] = useState(
    alreadySelectedIndices
  );
  const [selectedColumns, setSelectedColumns] = useState(
    selectedDashboardColumns.length > 0
      ? selectedDashboardColumns.map(col => col.type)
      : ["dashboard_id"]
  );
  const [selectedUsers, setSelectedUsers] = useState(
    selectedDashboardUsers.length > 0
      ? selectedDashboardUsers.map(user => user.username)
      : allDashboardsUsers
          .filter(user => user.isAdmin)
          .map(user => user.username)
  );

  const [name, setName] = useState(dashboardName);
  const [isLoading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(null);
  const [isActionDisabled, setIsDisabled] = useState(isEdit ? false : true);
  const [searchValue, setSearchValue] = useState("");

  const [activeStep, setActiveStep] = useState(isEdit ? 1 : 0);
  const steps = getSteps();

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
    setIsDisabled(false);
  };

  const handleNameChange = event => {
    setName(event.target.value);
  };

  useEffect(() => {
    if (activeStep === 0 && name) {
      setIsDisabled(false);
    } else if (activeStep === 0 && name.length === 0) {
      setIsDisabled(true);
    } else if (activeStep === 1 && selectedIndices.length > 0) {
      setIsDisabled(false);
    } else if (activeStep === 1 && selectedIndices.length === 0) {
      setIsDisabled(true);
    } else if (activeStep === 2 && selectedColumns.length > 0) {
      setIsDisabled(false);
    } else if (activeStep === 2 && selectedColumns.length === 0) {
      setIsDisabled(true);
    } else if (activeStep === 3 && selectedUsers.length > 0) {
      setIsDisabled(false);
    }
  }, [name, selectedIndices, activeStep, selectedColumns, selectedUsers]);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      maxWidth={"md"}
      PaperProps={{ style: { padding: 10, minHeight: 200, width: 888 } }}
    >
      {isLoading ? (
        <DialogContent
          style={{
            paddingTop: isSent && isLoading ? 0 : 20,
            margin: "auto"
          }}
        >
          <LoadingContent isSent={isSent} />
        </DialogContent>
      ) : (
        <Grid
          container
          direction="column"
          alignItems="stretch"
          spacing={0}
          sx={{ marginTop: "50px" }}
        >
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{ padding: "0 !important", iconColor: "primary.main" }}
          >
            {steps.map(label => (
              <Step
                key={label}
                sx={{
                  "& .Mui-completed": {
                    color: "#5981b7 !important"
                  },
                  "& .Mui-active": { color: "#5981b7 !important" }
                }}
              >
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Grid item sx={{ width: "100%" }}>
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
                alreadySelectedIndices={selectedIndices}
              />
            )}
            {activeStep === 2 && (
              <DynamicColumnsContent
                columns={allDashboardColumns}
                selectedColumns={selectedColumns}
                setSelectedColumns={setSelectedColumns}
              />
            )}
            {activeStep === 3 && (
              <UserDashboardContent
                allUsers={allDashboardsUsers}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
              />
            )}
          </Grid>
          <Grid item sx={{ margin: "10px" }}>
            <div>
              <Button
                onClick={handleClose}
                sx={{ color: "primary.main !important" }}
                variant="outlined"
              >
                Cancel
              </Button>
              <div style={{ float: "right" }}>
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={
                      {
                        //  marginTop: 1,
                        //  marginRight: 3
                      }
                    }
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      boxShadow: "none !important",
                      color: "white",
                      backgroundColor: "primary.main !important"
                    }}
                    disabled={isActionDisabled}
                    onClick={async () => {
                      if (activeStep === steps.length - 1) {
                        setLoading(true);
                        const deletedUsers =
                          selectedDashboardUsers.length === 0
                            ? []
                            : _.isEqual(
                                selectedUsers.sort(),
                                selectedDashboardUsers.sort()
                              )
                            ? []
                            : selectedDashboardUsers
                                .filter(
                                  user => !selectedUsers.includes(user.username)
                                )
                                .map(user => user.username);

                        await dashboardAction(
                          name,
                          selectedIndices,
                          selectedColumns,
                          selectedUsers,
                          deletedUsers
                        );
                        setIsSent(true);
                        setTimeout(() => {
                          setIsSent(false);
                          setLoading(false);
                          handleClose();
                        }, 2000);
                      } else {
                        setActiveStep(prevActiveStep => prevActiveStep + 1);
                        setIsDisabled(true);
                      }
                    }}
                  >
                    {activeStep === steps.length - 1 ? "Save" : "Next"}
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
const DynamicColumnsContent = ({
  columns,
  setSelectedColumns,
  selectedColumns
}) => {
  const [checked, setChecked] = useState(
    selectedColumns.length > 0 ? selectedColumns : ["dashboard_id"]
  );

  const handleToggle = value => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setSelectedColumns(newChecked);
    setChecked(newChecked);
  };
  return (
    <Paper
      sx={{ margin: "10px", margin: "auto", width: "50%" }}
      key={"addColumnToDashboardPaper"}
    >
      <Alert severity="info">Select metadata columns for this project</Alert>
      <List
        sx={{
          //  width: "100%",
          margin: 0,
          height: 250,
          overflowY: "scroll",
          backgroundColor: "background.paper"
        }}
        key={"addColumnToDashboardList"}
      >
        {columns.map(value => {
          const labelId = `checkbox-list-label-${value.type}`;

          return (
            <ListItem
              role={undefined}
              dense
              button
              key={"addColumnToDashboardItem-" + value.type}
              onClick={handleToggle(value.type)}
            >
              <ListItemIcon key={"addColumnToDashboardIconCheck-" + value.type}>
                <Checkbox
                  disabled={value.type === "dashboard_id"}
                  edge="start"
                  key={"addColumnToDashboardCheck-" + value.type}
                  checked={checked.indexOf(value.type) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                />
              </ListItemIcon>
              <ListItemText
                key={"addColumnToDashboardText-" + value.type}
                id={labelId.type}
                primary={`${value.label}`}
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};
const NameContent = ({ isEdit, name, handleNameChange }) => {
  return (
    <Formik
      validationSchema={yup.object({
        name: yup.string().required("This field is required")
      })}
      initialValues={{
        name: name
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
        <DialogContent sx={{ padding: "0px 50px" }}>
          <TextField
            key={"dialogName"}
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            value={values.name}
            onChange={event => {
              setFieldValue("name", event.target.value);
              handleNameChange(event);
            }}
            required
            sx={{
              width: "80%",
              marginLeft: "71px !important",
              color: "#5981b7 !important"
            }}
          />
        </DialogContent>
      )}
    </Formik>
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
  return (
    <DialogContent
      sx={{
        padding: "0px 10px",
        paddingTop: "0px !important",
        paddingLeft: "50px",
        width: "100%",
        marginBottom: "15px"
      }}
    >
      <TextField
        id="outlined-search"
        label="Search Analyses"
        type="search"
        variant="outlined"
        value={searchValue}
        sx={{
          width: 350,
          //left: 10,
          marginBottom: "10px",
          marginLeft: "4px",
          "&$.MuiOutlinedInput-input": { padding: "15px 12px" }
        }}
        InputProps={{ classes: { input: { padding: "15px 12px" } } }}
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
  );
};
const UserDashboardContent = ({
  allUsers,
  setSelectedUsers,
  selectedUsers
}) => {
  const [checked, setChecked] = useState(selectedUsers);

  const handleToggle = value => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setSelectedUsers(newChecked);
    setChecked(newChecked);
  };
  return (
    <Paper
      sx={{ width: "50%", margin: "auto" }}
      key={"addUserToDashboardPaper"}
    >
      <Alert severity="info">
        * - Admins are added to all dashboards by default
      </Alert>
      <List
        sx={{
          width: "100%",
          margin: 0,
          height: 250,
          overflowY: "scroll",
          backgroundColor: "background.paper"
        }}
        key={"addUserToDashboardList"}
      >
        {allUsers
          .sort((a, b) => a.full_name.localeCompare(b.full_name))
          .map(value => {
            const labelId = `checkbox-list-label-${value.username}`;

            return (
              <ListItem
                role={undefined}
                dense
                button
                key={"addUserToDashboardItem-" + value.username}
                onClick={handleToggle(value.username)}
              >
                <ListItemIcon
                  key={"addUserToDashboardItemIcon-" + value.username}
                >
                  <Checkbox
                    edge="start"
                    disabled={value.isAdmin}
                    key={"addUserToDashboardCheck-" + value.username}
                    checked={checked.indexOf(value.username) !== -1}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ "aria-labelledby": labelId }}
                  />
                </ListItemIcon>
                <ListItemText
                  key={"addUserToDashboarText-" + value.username}
                  id={labelId}
                  primary={
                    `${value.isAdmin ? "*" : ""}` +
                    `${value.full_name}` +
                    " - (" +
                    `${value.username}` +
                    ")"
                  }
                />
              </ListItem>
            );
          })}
      </List>
    </Paper>
  );
};
const LoadingContent = ({ isSent }) => (
  <div
    style={{
      height: 200,
      width: 250,
      margin: "auto",
      left: "25%",
      position: "absolute"
    }}
  >
    <LoadingCircle overRideStroke={6} />
  </div>
);
export default PopUpContent;
