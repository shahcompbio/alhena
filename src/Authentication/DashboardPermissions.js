import React from "react";
import { Query } from "react-apollo";

import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import { GETPROJECTROLES } from "../Queries/queries.js";

import Grid from "@material-ui/core/Grid";

import clsx from "clsx";
import { withStyles } from "@material-ui/styles";
import { useAppState } from "../util/app-state";

const tableHeadings = ["Dashboard", "Allowed Analysis"];

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: "#4486a3",
    borderRadius: 20,
    zIndex: 40,
    marginTop: 25
  },
  grid: {
    marginTop: "-40px"
  },
  paper: {
    zIndex: 40,
    marginTop: theme.spacing.unit,
    width: "100%",
    overflowX: "auto",
    height: 300,
    borderRadius: 20,
    backgroundColor: "#4486a3"
  },
  content: {
    width: "90%",
    margin: "auto",
    minWidth: 650,
    marginTop: 25
  },
  table: {
    width: "90%",
    margin: "auto",
    minWidth: 650,
    marginTop: 25
  },
  tableRow: {
    backgroundColor: "#4486a3",
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
  }
});
const DashboardPermissions = ({ classes, history }) => {
  const [{ authKeyID, uid }, dispatch] = useAppState();
  return (
    <Query
      query={GETPROJECTROLES}
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
        return (
          <div className={classes.root}>
            <Grid
              className={classes.grid}
              direction="column"
              justify="center"
              alignItems="center"
              container
              spacing={2}
              key={"permissions-grid"}
            >
              <Paper className={classes.paper}>
                <Table className={classes.table} size="small">
                  <TableHead>
                    <TableRow className={classes.tableRow}>
                      {tableHeadings.map(heading => (
                        <TableCell
                          key={"permissions-heading" + heading}
                          className={clsx(
                            classes.tableCell,
                            classes.tableHeader
                          )}
                        >
                          {heading}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.getProjectRoles.roles.map(role => {
                      return (
                        <TableRow
                          className={classes.tableRow}
                          classes={{ selected: classes.selected }}
                          key={"permissions-row-" + role}
                        >
                          <TableCell
                            className={classes.tableCell}
                            align={"left"}
                            component="th"
                            scope="row"
                            key={"role" + role}
                          >
                            {role}
                          </TableCell>
                          <TableCell
                            className={classes.tableCell}
                            align={"left"}
                            component="th"
                            scope="row"
                            key={"analysisList" + role}
                          >
                            {role}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </div>
        );
      }}
    </Query>
  );
};

export default withStyles(styles)(DashboardPermissions);
