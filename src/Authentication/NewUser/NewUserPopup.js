import React, { useState, useEffect } from "react";
import { useAppState } from "../../util/app-state";
import { Formik, Form, useFormik, useFormikContext } from "formik";
import * as yup from "yup";

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
} from "@material-ui/core";

import FilledInput from "@material-ui/core/FilledInput";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";

import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Select from "@material-ui/core/Select";

import { withStyles, makeStyles, useTheme } from "@material-ui/core/styles";

import { Typography } from "@material-ui/core";

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

/*const doesUserExistQuery = async (client, email) => {
  var data = await client.query({
    query: doesUserExist,
    variables: {
      email: email
    }
  });
  return data.data.doesUserExist.userAlreadyExists;
};*/
const styles = theme => ({
  dialogContent: {
    width: "700px",
    display: "flex",
    textAlign: "center"
  },
  dialogGrid: { width: "80%" },
  shareButton: {
    marginTop: 7,
    right: 100,
    position: "absolute",
    backgroundColor: "#67b798",
    color: "black"
    //  marginTop: "25px"
  },
  button: {
    //backgroundColor: "#e5f3f3",
    //color: "#2b5d65"
    color: "black"
  },
  generateButton: {
    backgroundColor: "#67b798",
    boxShadow: "none !important",
    color: "black"
  },
  closeButton: {
    marginTop: 7,
    right: 20,
    position: "absolute",
    color: "#350800",
    backgroundColor: "#efcfc5"
  },
  dialog: {
    padding: 10
  },
  urlInput: {
    width: 500,
    paddingTop: 20
  }
});

const NewUserPopup = ({ isOpen, handleClose, client, classes }) => {
  const [{ authKeyID, uid }] = useAppState();
  const [newUserLink, setNewUserLink] = useState(null);
  const [isSubmitDisabled, setIsDisabled] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);

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
    >
      {newUserLinkData && newUserLinkData.newUserLink ? (
        <span style={{ margin: 10 }}>
          <Typography variant="body">
            Please send this link to the user you are trying to create.
          </Typography>
          <DialogContent className={classes.dialogContent}>
            <FilledInput
              style={{ width: "75%" }}
              classes={{ input: classes.urlInput }}
              id="copyUrl"
              value={newUserLinkData.newUserLink.newUserLink}
              readonly
            />
            <Button
              variant="outlined"
              color="#67b798"
              className={classes.shareButton}
              onClick={copy(newUserLinkData.newUserLink.newUserLink)}
            >
              Copy
            </Button>
            <Button
              variant="outlined"
              color="#67b798"
              className={classes.closeButton}
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
                  /^[a-zA-Z0-9]+$/,
                  "Cannot contain special characters or spaces"
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
                    roles: selectedRoles.join(","),
                    isAdmin: isAdmin
                  }
                }
              })
            }
            style={{ maxWidth: 450 }}
            className={classes.root}
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
                    <TextField
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
                      style={{ marginBottom: 10 }}
                    />
                    <TextField
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
                      style={{ marginBottom: 10 }}
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
                        />
                      }
                      style={{ marginBottom: 10 }}
                      label="Is Admin"
                    />
                  </div>
                </DialogContent>

                <DialogActions>
                  <Button
                    onClick={handleClose}
                    variant="outlined"
                    color="#67b798"
                    className={classes.button}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!isValid}
                    className={classes.generateButton}
                  >
                    Generate
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
const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  formControl: {
    margin: theme.spacing(1),
    width: "100%",
    marginBottom: 10
  },
  chips: {
    display: "flex",
    flexWrap: "wrap"
  },
  chip: {
    margin: 2
  },
  noLabel: {
    marginTop: theme.spacing(3)
  }
}));

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
  const classes = useStyles();
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
    <FormControl required className={classes.formControl}>
      <InputLabel htmlFor="select-multiple-checkbox">
        Viewable Dashboards
      </InputLabel>
      <Select
        multiple
        value={selectedRoles}
        onChange={onChange}
        input={<Input id="select-multiple-chip" />}
        renderValue={selected => (
          <div className={classes.chips}>
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
                className={classes.chip}
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
            <Checkbox checked={selectedRoles.indexOf(name) > -1} />
            <ListItemText primary={name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default withStyles(styles)(withRouter(NewUserPopup));
