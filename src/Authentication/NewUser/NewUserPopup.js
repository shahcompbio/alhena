import React, { useState, useEffect } from "react";
import { useAppState } from "../../util/app-state";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";

import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import Chip from "@material-ui/core/Chip";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Select from "@material-ui/core/Select";

import { makeStyles, useTheme } from "@material-ui/core/styles";

import LoadingCircle from "./../ProgressCircle.js";
import IconButton from "@material-ui/core/IconButton";
import CheckIcon from "@material-ui/icons/Check";

import { withRouter } from "react-router";
import { Query } from "react-apollo";
import { getAllDashboards } from "../../Queries/queries.js";

const NewUserPopup = ({ isOpen, handleClose, addUser, client }) => {
  const [{ authKeyID, uid }] = useAppState();
  const [isLoading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
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
            {isLoading ? (
              <DialogContent
                style={{
                  maxWidth: 450,
                  height: 300,
                  paddingTop: isSent && isLoading ? 0 : 20
                }}
              >
                <div
                  style={{
                    height: 200,
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
                <ValidatorForm ref="form" style={{ maxWidth: 450 }}>
                  <DialogTitle id="form-dialog-title">
                    Create New User
                  </DialogTitle>
                  ,
                  <DialogContent>
                    <DialogContentText>
                      To create a new user please enter their name and email and
                      select what dashboards they are allowed to view. A
                      confirmation email will be sent to them.
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
                      onClick={async ev => {
                        setLoading(true);
                        var acceptedEmail = await addUser(
                          ev,
                          client,
                          email,
                          name,
                          selectedRoles
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
                      disabled={isSubmitDisabled}
                    >
                      Send
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
