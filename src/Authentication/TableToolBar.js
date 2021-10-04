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
import Grid from "@material-ui/core/Grid";

import clsx from "clsx";
import { lighten, makeStyles } from "@material-ui/core/styles";

const useToolbarStyles = makeStyles(theme => ({
  arrow: {
    "&:before": {
      border: "1px solid #E6E8ED"
    },
    color: "black"
  },
  actionsWrapper: { position: "absolute", right: 3, top: 5 },
  completeHighlight: {
    color: "#03a678",
    backgroundColor: lighten("#03a678", 0.7)
  },
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    borderRadius: "10px 10px 0px 0px"
  },
  fontSelected: { fontSize: 20, paddingLeft: 5 },
  highlight: {
    backgroundColor: "#e5e5e5"
  },
  deleteHighlight: {
    color: "black",
    fontWeight: "bold",
    backgroundColor: "#f1a9a0"
  },
  editHighlight: {
    backgroundColor: "#c9e2ea"
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    flex: "1 1 100%"
  },
  toolbarWrapper: { padding: "0 !important" },
  tooltipTitle: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 4
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
      key={name + "Toolbar"}
    >
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={3}
      >
        <Grid item xs={9} className={classes.toolbarWrapper}>
          <p className={classes.fontSelected}> 1 selected</p>
        </Grid>
        <Grid className={classes.actionsWrapper}>
          {selectedAction === null ? (
            [
              <Tooltip
                arrow
                className={classes.tooltipTitle}
                title={<Typography variant="h5">Delete</Typography>}
                key={name + "ToolbarDelete"}
              >
                <IconButton
                  aria-label="delete"
                  onClick={ev => setSelectedAction("Delete")}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>,
              <Tooltip
                arrow
                className={classes.tooltipTitle}
                title={<Typography variant="h5">Edit</Typography>}
                key={name + "ToolbarEdit"}
              >
                <IconButton
                  aria-label="edit"
                  onClick={ev => {
                    setIsEditing();
                    setSelectedAction("Edit");
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>,
              <Tooltip
                arrow
                className={classes.tooltipTitle}
                title={<Typography variant="h5">Cancel</Typography>}
                style={{ float: "right" }}
              >
                <IconButton aria-label="Cancel" onClick={ev => clear(true)}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            ]
          ) : isLoading ? (
            <Typography variant="h5"> Loading</Typography>
          ) : actionComplete ? (
            <CheckIcon />
          ) : (
            [
              <Tooltip
                arrow
                className={classes.tooltipTitle}
                title={<Typography variant="h5">Clear</Typography>}
              >
                <IconButton aria-label="clear" onClick={ev => clear(true)}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>,
              <Tooltip
                arrow
                className={classes.tooltipTitle}
                title={<Typography variant="h5">Confirm</Typography>}
              >
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
        </Grid>
      </Grid>
    </Toolbar>
  );
};

export default TableToolbar;
