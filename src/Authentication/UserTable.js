import React, { useState, useRef, useEffect } from "react";
import { Route, Switch } from "react-router-dom";
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
import LoadingCircle from "./ProgressCircle.js";
import CheckIcon from "@material-ui/icons/Check";

import { ApolloConsumer } from "react-apollo";
import { getUsers } from "../Queries/queries.js";
import { deleteUserByUsername } from "../util/utils.js";

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
    borderRadius: 20
  },
  grid: {
    marginTop: "-60px"
  },
  paper: {
    marginTop: theme.spacing.unit,
    width: "100%",
    overflowX: "auto",
    marginBottom: theme.spacing.unit
  },
  table: {
    width: "90%",
    margin: "auto",
    minWidth: 650
  },
  tableRow: {
    backgroundColor: "#62b2bf"
  },
  tableCell: {
    color: "#ffffff",
    whiteSpace: "normal",
    wordWrap: "break-word"
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

const UserTable = ({ classes, history }) => {
  const [{ authKeyID, uid }, dispatch] = useAppState();
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [actionComplete, setActionComplete] = useState(null);
  const [users, setUsers] = useState([]);

  const rowsPerPage = 10;

  const isSelected = name => selected === name;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const deleteUser = async (username, client, modifiedUsers) => {
    setLoading(true);
    try {
      var confirmed = await deleteUserByUsername(username, client);
    } catch (error) {
      console.log(error);
    } finally {
      if (confirmed.deleteUser.isDeleted) {
        console.log("deleted");
        setLoading(false);
        setActionComplete(true);

        setTimeout(() => {
          setActionComplete(null);
          var use = modifiedUsers.filter(user => user.username !== selected);
          console.log(use);
          setUsers(use);
          setSelected(null);
        }, 4000);
        //window.location.reload();
        //  setRefresh(true);
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
      setSelected(null);
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
          heading => heading != "__typename"
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
                        deleteUser={username =>
                          deleteUser(username, client, modifiedUsers)
                        }
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
                            onClick={event =>
                              handleRowClick(event, row.username)
                            }
                            role="checkbox"
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                color={"default"}
                                checked={isItemSelected}
                                className={classes.checkBox}
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
                                >
                                  {row[heading]}
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
const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    borderRadius: "10px 10px 0px 0px"
  },
  highlight: {
    color: theme.palette.secondary.main,
    backgroundColor: lighten(theme.palette.secondary.light, 0.85)
  },
  completeHighlight: {
    color: "#03a678",
    backgroundColor: lighten("#03a678", 0.7)
  },
  title: {
    flex: "1 1 100%"
  }
}));
const TableToolbar = ({ username, deleteUser, actionComplete, isLoading }) => {
  const classes = useToolbarStyles();
  return (
    <Toolbar
      className={clsx(
        classes.root,
        {
          [classes.highlight]: !actionComplete
        },
        { [classes.completeHighlight]: actionComplete }
      )}
      dense
    >
      {isLoading ? (
        <Typography>Loading</Typography>
      ) : actionComplete ? (
        ""
      ) : (
        <Typography
          className={classes.title}
          color="inherit"
          variant="subtitle1"
        >
          Delete {username}?
        </Typography>
      )}
      <Tooltip title="Delete">
        <IconButton aria-label="delete" onClick={ev => deleteUser(username)}>
          {isLoading ? "" : actionComplete ? <CheckIcon /> : <DeleteIcon />}
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
};

export default withStyles(styles)(withRouter(UserTable));
