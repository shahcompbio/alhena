import React, { useState } from "react";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import Grid from "@mui/material/Grid";

import clsx from "clsx";
import { lighten } from "@mui/material/styles";

import makeStyles from "@mui/styles/makeStyles";

const useToolbarStyles = makeStyles(theme => ({
  arrow: {
    "&:before": {
      border: "1px solid #E6E8ED"
    },
    color: "black"
  },
  actionsWrapper: { position: "absolute", right: 18, top: 5 },
  checkMark: {
    marginTop: 15,
    marginRight: 10
  },
  loadingText: {
    marginTop: 15,
    marginRight: 10
  },
  completeHighlight: {
    color: "#03a678",
    backgroundColor: lighten("#03a678", 0.7)
  },
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    borderRadius: "10px 10px 0px 0px"
  },
  fontSelected: {
    paddingTop: 40,
    paddingBottom: 0,
    fontFamily: "Helvetica",
    fontSize: 18,
    fontWeight: 500,
    color: "#2e334a"
  },
  highlight: {
    backgroundColor: "#e5e5e5"
  },
  deleteHighlight: {
    color: "black",
    fontWeight: "normal",
    backgroundColor: "#f1a9a0"
  },
  editHighlight: {
    backgroundColor: "#ccd6d9"
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    flex: "1 1 100%"
  },
  toolbarWrapper: {
    padding: "0px 20px !important",
    marginTop: "20px !important"
  },
  tooltipTitle: {
    fontSize: 16,
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
  const selectedText =
    selectedAction === "Edit"
      ? "Save " + name + "?"
      : selectedAction === "Delete"
      ? "Delete " + name + "?"
      : "";
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
          <Typography variant="body" className={classes.fontSelected}>
            {selectedText}
          </Typography>
        </Grid>
        <Grid className={classes.actionsWrapper}>
          {selectedAction === null ? (
            [
              <Tooltip
                arrow
                className={classes.tooltipTitle}
                title={<Typography variant="body">Delete</Typography>}
                key={name + "ToolbarDelete"}
              >
                <IconButton
                  aria-label="delete"
                  onClick={ev => setSelectedAction("Delete")}
                  size="large"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>,
              <Tooltip
                arrow
                className={classes.tooltipTitle}
                title={<Typography variant="body">Edit</Typography>}
                key={name + "ToolbarEdit"}
              >
                <IconButton
                  aria-label="edit"
                  onClick={ev => {
                    setIsEditing();
                    setSelectedAction("Edit");
                  }}
                  size="large"
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>,
              <Tooltip
                arrow
                className={classes.tooltipTitle}
                title={<Typography variant="body">Cancel</Typography>}
                style={{ float: "right" }}
              >
                <IconButton
                  aria-label="Cancel"
                  onClick={ev => clear(true)}
                  size="large"
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            ]
          ) : isLoading ? (
            <Typography variant="body" className={classes.loadingText}>
              Loading
            </Typography>
          ) : actionComplete ? (
            <CheckIcon className={classes.checkMark} />
          ) : (
            [
              <Tooltip
                arrow
                className={classes.tooltipTitle}
                title={<Typography variant="body">Cancel</Typography>}
              >
                <IconButton
                  aria-label="Cancel"
                  onClick={ev => clear(true)}
                  size="large"
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>,
              <Tooltip
                arrow
                className={classes.tooltipTitle}
                title={<Typography variant="body">Confirm</Typography>}
              >
                <IconButton
                  aria-label="confirm"
                  onClick={ev =>
                    selectedAction === "Edit" ? edit(name) : deleteName(name)
                  }
                  size="large"
                >
                  <CheckIcon />
                </IconButton>
              </Tooltip>
            ]
          )}
        </Grid>
      </Grid>
    </Toolbar>
  );
};

export default TableToolbar;
