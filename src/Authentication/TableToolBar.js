import React, { useState } from "react";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Typography from "@material-ui/core/Typography";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import VpnKeyIcon from "@material-ui/icons/VpnKey";

import clsx from "clsx";
import { lighten, makeStyles } from "@material-ui/core/styles";

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    borderRadius: "10px 10px 0px 0px"
  },
  highlight: {
    backgroundColor: "#CFD2D3"
  },
  deleteHighlight: {
    color: theme.palette.secondary.main,
    backgroundColor: lighten(theme.palette.secondary.light, 0.85)
  },
  editHighlight: {
    backgroundColor: "rgb(218, 255, 241)"
  },
  completeHighlight: {
    color: "#03a678",
    backgroundColor: lighten("#03a678", 0.7)
  },
  title: {
    flex: "1 1 100%"
  }
}));

const TableToolbar = ({
  clear,
  name,
  deleteName,
  actionComplete,
  isLoading,
  edit,
  setIsEditing
}) => {
  const classes = useToolbarStyles();
  const [selectedAction, setSelectedAction] = useState(null);

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: selectedAction === null,
        [classes.completeHighlight]: actionComplete,
        [classes.deleteHighlight]: selectedAction === "Delete",
        [classes.editHighlight]: selectedAction === "Edit"
      })}
      dense
    >
      {selectedAction === null ? (
        [
          <Tooltip title="Delete">
            <IconButton
              aria-label="delete"
              onClick={ev => setSelectedAction("Delete")}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>,
          <Tooltip title="Edit">
            <IconButton
              aria-label="edit"
              onClick={ev => {
                setIsEditing();
                setSelectedAction("Edit");
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        ]
      ) : isLoading ? (
        <Typography>Loading</Typography>
      ) : actionComplete ? (
        <CheckIcon />
      ) : (
        [
          <Tooltip title="Clear">
            <IconButton aria-label="clear" onClick={ev => clear(true)}>
              <ClearIcon />
            </IconButton>
          </Tooltip>,
          <Tooltip title="Confirm">
            <IconButton
              aria-label="confirm"
              onClick={ev =>
                selectedAction === "Edit" ? edit(name) : deleteName(name)
              }
            >
              <CheckIcon />
            </IconButton>
          </Tooltip>,
          selectedAction === "Delete" && (
            <Typography
              className={classes.title}
              color="inherit"
              variant="subtitle1"
            >
              Delete {name}?
            </Typography>
          )
        ]
      )}
    </Toolbar>
  );
};

export default TableToolbar;
