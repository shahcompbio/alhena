import React, { useState } from "react";
import { useAppState } from "../../util/app-state";
import { Formik } from "formik";
import * as yup from "yup";
import styled from "styled-components";

import {
  InputLabel,
  MenuItem,
  FormControl,
  Input,
  Chip,
  Button,
  Dialog,
  DialogActions,
  FormControlLabel,
  Switch,
  TextField
} from "@mui/material";

import FilledInput from "@mui/material/FilledInput";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";

import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Select from "@mui/material/Select";

import { useTheme } from "@mui/material/styles";

import { Typography } from "@mui/material";

import { gql, useLazyQuery, useQuery } from "@apollo/client";

import { withRouter } from "react-router";
const copy = require("clipboard-copy");

const getAllDashboards = gql`
  query getAllDashboards($user: ApiUser!) {
    getAllDashboards(auth: $user) {
      name
      count
    }
  }
`;
const DOESUSEREXIST = gql`
  query doesUserExist($email: String!) {
    doesUserExist(email: $email) {
      userAlreadyExists
    }
  }
`;
const NEWUSERLINK = gql`
  query generateNewUserLink($newUser: NewUserLink!) {
    newUserLink(newUser: $newUser) {
      newUserLink
    }
  }
`;

const StyledTextField = styled(TextField)`
  margin-bottom: 10;
  & label.Mui-focused {
    color: #5981b7;
  }
  & .MuiOutlinedInput-root {
    &.Mui-focused fieldset {
      border-color: #5981b7;
    }
  }
`;

const NewUserPopup = ({ isOpen, handleClose, client }) => {
  const [{ authKeyID, uid }] = useAppState();
  const [isAdmin, setIsAdmin] = useState(false);

  const [
    doesUserExist,
    {
      data: doesUserExistData,
      loading: doesUserExistLoading,
      error: doesUserExistError
    }
  ] = useLazyQuery(DOESUSEREXIST);

  const [
    createNewUserLink,
    {
      data: newUserLinkData,
      loading: newUserLinkLoading,
      error: newUserLinkError
    }
  ] = useLazyQuery(NEWUSERLINK);

  const handleRoleDelete = (roles, value) =>
    roles.filter(role => role !== value);

  const { loading, error, data } = useQuery(getAllDashboards, {
    variables: {
      user: { authKeyID: authKeyID, uid: uid }
    }
  });

  if (loading) return null;
  if (error) return null;

  const allDashboards = data.getAllDashboards.map(dashboard => dashboard.name);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth={"lg"}
      aria-labelledby="form-dialog-title"
      sx={{
        "& .MuiFormHelperText-root": { color: "red" }
      }}
    >
      {newUserLinkData && newUserLinkData.newUserLink ? (
        <span style={{ margin: 10 }}>
          <Typography variant="body">
            Please send this link to the user you are trying to create.
          </Typography>
          <DialogContent
            sx={{
              width: "700px",
              display: "flex",
              textAlign: "center"
            }}
          >
            <FilledInput
              style={{ width: "75%", width: 500 }}
              id="copyUrl"
              value={newUserLinkData.newUserLink.newUserLink}
              readonly
            />
            <Button
              variant="contained"
              sx={{
                marginTop: "7px !important",
                right: "107px",
                position: "absolute !important",
                backgroundColor: "#5981b7 !important",
                color: "white !important",
                ":hover": {
                  backgroundColor: "#2f4461 !important"
                }
              }}
              onClick={copy(newUserLinkData.newUserLink.newUserLink)}
            >
              Copy
            </Button>
            <Button
              variant="outlined"
              sx={{
                marginTop: "7px !important",
                right: "14px",
                position: "absolute !important",
                backgroundColor: "white !important",
                color: "#4882bb !important"
              }}
              onClick={handleClose}
            >
              Close
            </Button>
          </DialogContent>
        </span>
      ) : (
        <div style={{ maxWidth: 550, padding: 15 }}>
          <DialogTitle id="form-dialog-title">Create New User</DialogTitle>
          <DialogContentText style={{ padding: 10 }}>
            To create a new user please enter their name and email and select
            what dashboards they are allowed to view.
          </DialogContentText>
          <Formik
            validationSchema={yup.object({
              name: yup
                .string()
                .min(2, "Must be at least 2 characters")
                .required("Name is required")
                .matches(
                  /^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/gi,
                  "Cannot contain special characters"
                ),
              email: yup
                .string("Enter your email")
                .email("Enter a valid email")
                .required("Email is required"),
              roles: yup.array().min(1, "Select atleast one")
            })}
            initialValues={{
              name: "",
              email: "",
              roles: []
            }}
            onSubmit={values =>
              createNewUserLink({
                variables: {
                  newUser: {
                    email: values.email,
                    name: values.name,
                    roles: values.roles.join(","),
                    isAdmin: isAdmin
                  }
                }
              })
            }
            style={{ maxWidth: 450 }}
            //  className={classes.root}
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
              <div>
                <DialogContent>
                  <div>
                    <StyledTextField
                      autoFocus
                      margin="dense"
                      key="name"
                      label="Name"
                      type="text"
                      onChange={event =>
                        setFieldValue("name", event.target.value)
                      }
                      value={values.name}
                      error={touched.name && Boolean(errors.name)}
                      helperText={errors.name}
                      fullWidth
                    />
                    <StyledTextField
                      margin="dense"
                      key="email"
                      label="Email Address"
                      fullWidth
                      type={"text"}
                      value={values.email}
                      onChange={event =>
                        setFieldValue("email", event.target.value)
                      }
                      error={touched.email && Boolean(errors.email)}
                      helperText={errors.email}
                    />
                    <DropDownSelect
                      value={values.roles}
                      onChange={event => {
                        setFieldValue("roles", event.target.value);
                      }}
                      error={errors.roles}
                      helperText={errors.roles}
                      selectedRoles={values.roles}
                      handleRoleDelete={value =>
                        setFieldValue(
                          "roles",
                          handleRoleDelete(values.roles, value)
                        )
                      }
                      roleNames={[...allDashboards]}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isAdmin}
                          onChange={() => setIsAdmin(!isAdmin)}
                          name="admin"
                          sx={{
                            "& .Mui-checked": {
                              color: "#2f4461",
                              transform: "translateX(25px) !important",
                              "& .MuiSwitch-thumb": { color: "#2f4461" },
                              "& .MuiSwitch-track": {
                                backgroundColor: "#2f4461"
                              }
                            },
                            "& .MuiSwitch-track": {
                              backgroundColor: "#5981b7"
                            }
                          }}
                        />
                      }
                      style={{ marginBottom: 10, marginTop: 10 }}
                      label="Is Admin"
                    />
                  </div>
                </DialogContent>

                <DialogActions>
                  <Button onClick={handleClose} variant="outlined">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!isValid}
                    sx={{
                      backgroundColor: "#5981b7 !important",
                      color: "white !important",
                      ":hover": {
                        backgroundColor: "#2f4461 !important"
                      }
                    }}
                  >
                    Next
                  </Button>
                </DialogActions>
              </div>
            )}
          </Formik>
        </div>
      )}
    </Dialog>
  );
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
};

const DropDownSelect = ({
  roleNames,
  handleRoleDelete,
  selectedRoles,
  onChange
}) => {
  const theme = useTheme();

  function getStyles(name, roles, theme) {
    return {
      fontWeight:
        roles.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium
    };
  }
  return (
    <FormControl
      required
      sx={{ margin: 1, width: "100%", marginBottom: "10px" }}
    >
      <InputLabel htmlFor="select-multiple-checkbox">
        Viewable Dashboards
      </InputLabel>
      <Select
        multiple
        value={selectedRoles}
        onChange={onChange}
        input={
          <Input
            id="select-multiple-chip"
            sx={{
              ":before": { borderBottomColor: "#5981b7" },
              ":after": { borderBottomColor: "#5981b7" }
            }}
          />
        }
        renderValue={selected => (
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {selected.map(value => (
              <Chip
                onMouseDown={event => {
                  event.stopPropagation();
                }}
                onDelete={event => {
                  handleRoleDelete(value);
                }}
                key={value}
                label={value}
                sx={{ display: "flex", flexWrap: "wrap", marginRight: "5px" }}
              />
            ))}
          </div>
        )}
        MenuProps={
          (MenuProps,
          {
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left"
            },
            getContentAnchorEl: null
          })
        }
      >
        {roleNames.map(name => (
          <MenuItem
            key={name}
            value={name}
            style={getStyles(name, selectedRoles, theme)}
          >
            <Checkbox
              checked={selectedRoles.indexOf(name) > -1}
              sx={{
                "&.Mui-checked": {
                  color: "#5981b7"
                }
              }}
            />
            <ListItemText primary={name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default withRouter(NewUserPopup);
