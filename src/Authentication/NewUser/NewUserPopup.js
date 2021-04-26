import React, { useState, useEffect } from "react";
import { useAppState } from "../../util/app-state";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";

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
  Switch
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

import gql from "graphql-tag";

import { withRouter } from "react-router";
import { Query } from "react-apollo";
import { getAllDashboards } from "../../Queries/queries.js";
const copy = require("clipboard-copy");

const doesUserExist = gql`
  query doesUserExist($email: String!) {
    doesUserExist(email: $email) {
      userAlreadyExists
    }
  }
`;
const createNewUserLink = gql`
  query generateNewUserLink($newUser: NewUserLink!) {
    newUserLink(newUser: $newUser) {
      newUserLink
    }
  }
`;
const generateNewUserLink = async (
  event,
  client,
  email,
  name,
  selectedRoles,
  isAdmin
) => {
  var data = await client.query({
    query: createNewUserLink,
    variables: {
      newUser: {
        email: email,
        name,
        roles: selectedRoles.join(","),
        isAdmin: isAdmin
      }
    }
  });
  return data.data.newUserLink;
};
const doesUserExistQuery = async (client, email) => {
  var data = await client.query({
    query: doesUserExist,
    variables: {
      email: email
    }
  });
  return data.data.doesUserExist.userAlreadyExists;
};
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
    backgroundColor: "#e5f3f3",
    color: "#2b5d65"
    //  marginTop: "25px"
  },
  button: {
    backgroundColor: "#e5f3f3",
    color: "#2b5d65"
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
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (email && selectedRoles.length > 0 && name) {
      setIsDisabled(false);
    }
  }, [email, selectedRoles, name]);

  useEffect(() => {
    ValidatorForm.addValidationRule("emailFirst", async value => {
      const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      var isValid = false;
      if (regex.test(String(value).toLowerCase())) {
        isValid = true;
        ValidatorForm.removeValidationRule("emailFirst");
      }
      return new Promise(function(resolve, reject) {
        resolve(isValid);
      });
    });
    ValidatorForm.addValidationRule("alreadyExists", async value => {
      if (!ValidatorForm.hasValidationRule("emailFirst")) {
        const response = await doesUserExistQuery(client, email);
        return new Promise(function(resolve, reject) {
          resolve(!response);
        });
      } else {
        return true;
      }
    });
  }, [email, client]);

  const handleRoleChange = (event, allRoles) => {
    const newRoles =
      event.target.value.indexOf("All") !== -1 ? allRoles : event.target.value;
    setSelectedRoles(newRoles);
  };

  const handleRoleDelete = (event, value) =>
    setSelectedRoles(roles => roles.filter(role => role !== value));

  return (
    <Query
      query={getAllDashboards}
      variables={{
        user: { authKeyID: authKeyID, uid: uid }
      }}
    >
      {({ loading, error, data }) => {
        if (loading) return null;
        if (error) return null;
        const allDashboards = data.getAllDashboards.map(
          dashboard => dashboard.name
        );
        return (
          <Dialog
            open={isOpen}
            onClose={handleClose}
            maxWidth={"lg"}
            aria-labelledby="form-dialog-title"
          >
            {newUserLink ? (
              <span style={{ margin: 10 }}>
                <Typography variant="body">
                  Please send this link to the user you are trying to create.
                </Typography>
                <DialogContent className={classes.dialogContent}>
                  <FilledInput
                    style={{ width: "75%" }}
                    classes={{ input: classes.urlInput }}
                    id="copyUrl"
                    value={newUserLink}
                    readonly
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    className={classes.shareButton}
                    onClick={copy(newUserLink)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    className={classes.closeButton}
                    onClick={handleClose}
                  >
                    Close
                  </Button>
                </DialogContent>
              </span>
            ) : (
              <div style={{ maxWidth: 550, padding: 15 }}>
                <DialogTitle id="form-dialog-title">
                  Create New User
                </DialogTitle>
                <DialogContentText style={{ padding: 10 }}>
                  To create a new user please enter their name and email and
                  select what dashboards they are allowed to view.
                </DialogContentText>
                <DialogContent>
                  <ValidatorForm
                    ref="form"
                    style={{ maxWidth: 450 }}
                    onSubmit={() => {}}
                  >
                    <TextValidator
                      autoFocus
                      margin="dense"
                      key="name"
                      label="Name"
                      type="text"
                      value={name}
                      onChange={event => setName(event.target.value)}
                      validators={["required", "minStringLength:3"]}
                      errorMessages={[
                        "This field is required",
                        "Field must be longer than 3 characters long"
                      ]}
                      fullWidth
                      style={{ marginBottom: 10 }}
                    />
                    <TextValidator
                      margin="dense"
                      key="email"
                      label="Email Address"
                      fullWidth
                      value={email}
                      type={"text"}
                      onChange={event => setEmail(event.target.value)}
                      validators={[
                        "required",
                        "minStringLength:1",
                        "emailFirst",
                        "alreadyExists"
                      ]}
                      errorMessages={[
                        "This field is required",
                        "This field is required",
                        "Incorrect email.",
                        "A user with this email already exists"
                      ]}
                      style={{ marginBottom: 10 }}
                    />
                  </ValidatorForm>
                  <DropDownSelect
                    selectedRoles={selectedRoles}
                    handleRoleChange={event =>
                      handleRoleChange(event, allDashboards)
                    }
                    handleRoleDelete={(event, value) =>
                      handleRoleDelete(event, value)
                    }
                    roleNames={["All", ...allDashboards]}
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
                </DialogContent>

                <DialogActions>
                  <Button
                    onClick={async ev => {
                      const response = await generateNewUserLink(
                        ev,
                        client,
                        email,
                        name,
                        selectedRoles,
                        isAdmin
                      );

                      setNewUserLink(response.newUserLink);
                    }}
                    variant="outlined"
                    color="primary"
                    disabled={isSubmitDisabled}
                    className={classes.button}
                  >
                    Generate
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="outlined"
                    color="primary"
                    className={classes.button}
                  >
                    Cancel
                  </Button>
                </DialogActions>
              </div>
            )}
          </Dialog>
        );
      }}
    </Query>
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
  handleRoleChange,
  selectedRoles
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
        onChange={handleRoleChange}
        input={<Input id="select-multiple-chip" />}
        renderValue={selected => (
          <div className={classes.chips}>
            {selected.map(value => (
              <Chip
                onMouseDown={event => {
                  event.stopPropagation();
                }}
                onDelete={event => {
                  handleRoleDelete(event, value);
                }}
                key={value}
                label={value}
                className={classes.chip}
              />
            ))}
          </div>
        )}
        MenuProps={MenuProps}
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
