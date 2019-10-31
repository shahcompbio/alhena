import React, { useState } from "react";
import { Query } from "react-apollo";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import TablePagination from "@material-ui/core/TablePagination";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import Checkbox from "@material-ui/core/Checkbox";
import DeleteIcon from "@material-ui/icons/Delete";
import Typography from "@material-ui/core/Typography";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import FormControl from "@material-ui/core/FormControl";

import { ApolloConsumer } from "react-apollo";
import { getUsers } from "../Queries/queries.js";
import { deleteUserByUsername, updateUserRoles } from "../util/utils.js";

import Grid from "@material-ui/core/Grid";

import clsx from "clsx";
import { lighten, makeStyles } from "@material-ui/core/styles";
import { withStyles } from "@material-ui/styles";
import { withRouter } from "react-router";
import { useAppState } from "../util/app-state";

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: "#62b2bf",
    borderRadius: 20,
    zIndex: 20,
    marginTop: 25
  },
  grid: {
    marginTop: "-60px"
  },
  paper: {
    marginTop: theme.spacing.unit,
    width: "100%",
    overflowX: "auto"
  },
  table: {
    width: "90%",
    margin: "auto",
    minWidth: 650,
    marginTop: 25
  },
  tableRow: {
    backgroundColor: "#62b2bf",
    "&$selected, &$selected:hover": {
      backgroundColor: "rgba(232, 232, 232, 0.43)"
    }
  },
  selected: {},
  tableCell: {
    color: "#ffffff",
    whiteSpace: "normal",
    wordWrap: "break-word",
    maxWidth: "100px",
    "$selected &": {
      color: "#000000"
    }
  },
  tableHeader: {
    fontWeight: "bold"
  },
  checkBox: {
    color: "rgba(255, 255, 255,1)"
  },
  tablePagination: {
    color: "rgb(255, 255, 255)"
  },
  toolbar: {},
  hide: {
    display: "none"
  }
});
const editableRows = { roles: true };
const UserTable = ({ classes, history }) => {
  const [{ authKeyID, uid }, dispatch] = useAppState();
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [actionComplete, setActionComplete] = useState(null);
  const [users, setUsers] = useState([]);

  const [selectedUserRoles, setSelectedUserRoles] = useState([]);
  const [isEditing, setIsEditingUser] = useState(null);

  const rowsPerPage = 10;

  const isSelected = name => selected === name;
  const isSelectedForEditing = (name, row) =>
    selected === name && isEditing && editableRows.hasOwnProperty(row);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const clearAll = () => {
    setIsEditingUser(null);
    setSelectedUserRoles([]);
    setSelected(null);
  };
  const actionCompleteReset = () => {
    setLoading(false);
    setActionComplete(true);
    setIsEditingUser(null);
    setTimeout(() => {
      setActionComplete(null);
      setSelected(null);
    }, 3000);
  };
  const confirmEditUser = async (client, modifiedUsers) => {
    setLoading(true);
    try {
      const confirmed = await updateUserRoles(
        selected,
        selectedUserRoles,
        client
      );
      if (confirmed === false) {
        //has updated
        setUsers(
          modifiedUsers.map(user => {
            if (user.username === selected) {
              user["roles"] = selectedUserRoles;
            }
            return user;
          })
        );
        actionCompleteReset();
      } else {
        //error
      }
    } catch (error) {}
  };
  const deleteUser = async (client, modifiedUsers) => {
    setLoading(true);
    try {
      var confirmed = await deleteUserByUsername(selected, client);
    } catch (error) {
    } finally {
      if (confirmed) {
        actionCompleteReset(modifiedUsers);
        setUsers(modifiedUsers.filter(user => user.username !== selected));
      } else {
        //error
      }
    }
  };

  const handleRowClick = (event, username) => {
    if (selected === null) {
      setSelected(username);
    } else if (selected === username) {
      //unselect
      clearAll();
    }
  };

  return (
    <Query
      query={getUsers}
      variables={{
        user: { authKeyID: authKeyID, uid: uid }
      }}
    >
      {({ loading, error, data }) => {
        if (loading) return null;
        if (error) {
          dispatch({
            type: "LOGOUT"
          });
          return null;
        }
        const modifiedUsers = users.length > 0 ? users : data.getUsers;
        const headings = Object.keys(data.getUsers[0]).filter(
          heading => heading !== "__typename"
        );

        return (
          <div className={classes.root}>
            <Grid
              className={classes.grid}
              direction="column"
              justify="center"
              alignItems="center"
              container
              spacing={2}
              key={"grid"}
            >
              <Paper className={classes.root}>
                {(selected || actionComplete) && (
                  <ApolloConsumer>
                    {client => (
                      <TableToolbar
                        username={selected}
                        deleteUser={() => deleteUser(client, modifiedUsers)}
                        editUser={() => confirmEditUser(client, modifiedUsers)}
                        clear={isCleared => clearAll()}
                        setIsEditing={isEditing => setIsEditingUser(isEditing)}
                        isLoading={isLoading}
                        actionComplete={actionComplete}
                      />
                    )}
                  </ApolloConsumer>
                )}
                <Table className={classes.table} size="small">
                  <TableHead>
                    <TableRow className={classes.tableRow}>
                      <TableCell padding="checkbox"></TableCell>
                      {headings.map((heading, index) => {
                        var aligned = index === 0 ? "left" : "right";
                        return (
                          <TableCell
                            className={[classes.tableCell, classes.tableHeader]}
                            align={aligned}
                          >
                            {heading}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {modifiedUsers
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row, index) => {
                        const isItemSelected = isSelected(row.username);
                        const labelId = `enhanced-table-checkbox-${index}`;

                        return (
                          <TableRow
                            key={row.username}
                            className={classes.tableRow}
                            selected={isItemSelected}
                            aria-checked={isItemSelected}
                            role="checkbox"
                            classes={{ selected: classes.selected }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                color={"default"}
                                checked={isItemSelected}
                                className={classes.checkBox}
                                onClick={event =>
                                  handleRowClick(event, row.username)
                                }
                                inputProps={{ "aria-labelledby": labelId }}
                              />
                            </TableCell>
                            {headings.map((heading, headingIndex) => {
                              var aligned =
                                headingIndex === 0 ? "left" : "right";
                              return (
                                <TableCell
                                  align={aligned}
                                  component="th"
                                  scope="row"
                                  id={labelId}
                                  className={classes.tableCell}
                                  key={labelId + heading + row.username}
                                >
                                  {isSelectedForEditing(
                                    row.username,
                                    heading
                                  ) ? (
                                    <DropDownEdit
                                      setNewUserRoles={roles =>
                                        setSelectedUserRoles([...roles])
                                      }
                                      currentSelection={row[heading]}
                                      allRoles={data.getProjectRoles.roles}
                                    />
                                  ) : (
                                    row[heading]
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={modifiedUsers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  rowsPerPageOptions={[]}
                  backIconButtonProps={{
                    "aria-label": "previous page"
                  }}
                  nextIconButtonProps={{
                    "aria-label": "next page"
                  }}
                  className={classes.tablePagination}
                  onChangePage={handleChangePage}
                />
              </Paper>
            </Grid>
          </div>
        );
      }}
    </Query>
  );
};
const DropDownEdit = ({ currentSelection, allRoles, setNewUserRoles }) => {
  const [selectedRoles, setSelectedRoles] = useState([...currentSelection]);
  return (
    <FormControl required style={{ width: "100%" }}>
      <Select
        multiple
        value={selectedRoles}
        onChange={event => {
          setSelectedRoles(event.target.value);
          setNewUserRoles(event.target.value);
        }}
        input={<Input id="select-multiple-placeholder" />}
      >
        {allRoles.map(role => (
          <MenuItem value={role} key={role}>
            {role}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    borderRadius: "10px 10px 0px 0px"
  },
  highlight: {
    backgroundColor: "rgb(237, 241, 240)"
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
  username,
  deleteUser,
  actionComplete,
  isLoading,
  editUser,
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
                setIsEditing(true);
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
            <IconButton aria-label="clear">
              <ClearIcon onClick={ev => clear(true)} />
            </IconButton>
          </Tooltip>,
          <Tooltip title="Confirm">
            <IconButton aria-label="confirm">
              <CheckIcon
                onClick={ev =>
                  selectedAction === "Edit"
                    ? editUser(username)
                    : deleteUser(username)
                }
              />
            </IconButton>
          </Tooltip>,
          selectedAction === "Delete" && (
            <Typography
              className={classes.title}
              color="inherit"
              variant="subtitle1"
            >
              Delete {username}?
            </Typography>
          )
        ]
      )}
    </Toolbar>
  );
};

export default withStyles(styles)(withRouter(UserTable));
