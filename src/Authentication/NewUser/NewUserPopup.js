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
  DialogActions
} from "@material-ui/core";

import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Select from "@material-ui/core/Select";

import { makeStyles, useTheme } from "@material-ui/core/styles";

import { Typography } from "@material-ui/core";

import gql from "graphql-tag";

import { withRouter } from "react-router";
import { Query } from "react-apollo";
import { getAllDashboards } from "../../Queries/queries.js";
const copy = require("clipboard-copy");
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
  selectedRoles
) => {
  var data = await client.query({
    query: createNewUserLink,
    variables: {
      newUser: { email: email, name, roles: selectedRoles.join(",") }
    }
  });
  return data.data.newUserLink.newUserLink;
};

const NewUserPopup = ({ isOpen, handleClose, client }) => {
  const [{ authKeyID, uid }] = useAppState();
  const [newUserLink, setNewUserLink] = useState(null);
  const [isSubmitDisabled, setIsDisabled] = useState(true);

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [email, setEmail] = useState(null);
  const [name, setName] = useState(null);

  useEffect(() => {
    if (email && selectedRoles.length > 0 && name) {
      setIsDisabled(false);
    }
  }, [email, selectedRoles, name]);

  const handleNameChange = event => {
    setName(event.target.value);
  };
  const handleEmailChange = event => {
    setEmail(event.target.value);
  };
  const handleRoleChange = event => {
    setSelectedRoles(event.target.value);
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

        return (
          <Dialog
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
          >
            {newUserLink ? (
              <DialogContent
                style={{
                  width: 450,
                  height: 150,
                  textAlign: "center"
                }}
              >
                <Typography variant="body">
                  Please send this link to the user you are trying to create.
                </Typography>
                <div style={{ marginTop: "10" }}>
                  <Typography variant="h7">
                    <b>{newUserLink}</b>
                  </Typography>
                </div>
                <div
                  style={{
                    marginTop: "25px"
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      copy(newUserLink);
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </DialogContent>
            ) : (
              <ValidatorForm ref="form" style={{ maxWidth: 450 }}>
                <DialogTitle id="form-dialog-title">
                  Create New User
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    To create a new user please enter their name and email and
                    select what dashboards they are allowed to view.
                  </DialogContentText>
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
                  />
                  <TextValidator
                    margin="dense"
                    id="name"
                    label="Email Address"
                    required
                    fullWidth
                    value={email}
                    onChange={handleEmailChange}
                    validators={["required", "isEmail"]}
                    errorMessages={[
                      "This field is required",
                      "Email is not valid"
                    ]}
                  />
                  <DropDownSelect
                    selectedRoles={selectedRoles}
                    handleRoleChange={handleRoleChange}
                    handleRoleDelete={(event, value) =>
                      handleRoleDelete(event, value)
                    }
                    roleNames={data.getAllDashboards.map(
                      dashboard => dashboard.name
                    )}
                  />
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handleClose}
                    color="secondary"
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async ev => {
                      var link = await generateNewUserLink(
                        ev,
                        client,
                        email,
                        name,
                        selectedRoles
                      );
                      setNewUserLink(link);
                    }}
                    color="primary"
                    variant="contained"
                    disabled={isSubmitDisabled}
                  >
                    Generate
                  </Button>
                </DialogActions>
              </ValidatorForm>
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
    width: "100%"
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
        User Privileges
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
                onDelete={event => handleRoleDelete(event, value)}
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
            {name}
          </MenuItem>
        ))}
      </Select>{" "}
    </FormControl>
  );
};

export default withRouter(NewUserPopup);
