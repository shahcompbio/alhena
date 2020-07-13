import React, { useState, useEffect } from "react";
import { useAppState } from "../util/app-state";

import gql from "graphql-tag";
import { Query } from "react-apollo";

import TableContent from "./TableContent.js";
import EditDashboardPopupWrapper from "./EditDashboardPopupWrapper.js";
import Paper from "@material-ui/core/Paper";
import TableToolbar from "./TableToolBar.js";

import Grid from "@material-ui/core/Grid";

import { ApolloConsumer } from "react-apollo";
import {
  updateDashboard,
  deleteUserByUsername,
  updateUserRoles
} from "../util/utils.js";

import { getAllDashboards, getUsers } from "../Queries/queries.js";
import { withStyles, useTheme } from "@material-ui/styles";

export const UPDATEDASHBOARD = gql`
  query updateDashboard($dashboard: DashboardInput!) {
    updateDashboard(dashboard: $dashboard) {
      updated
    }
  }
`;
export const DELETEDASHBOARD = gql`
  query deleteDashboard($name: String!) {
    deleteDashboard(name: $name) {
      allDeleted
    }
  }
`;
export const DELETEUSERBYUSERNAME = gql`
  query DeleteUser($username: String!) {
    deleteUser(username: $username) {
      isDeleted
    }
  }
`;
const styles = (theme, tabIndex) => ({
  root: {
    width: "95%",
    margin: "auto",
    flexGrow: 1,
    borderRadius: 20,
    zIndex: 20,
    marginTop: 25
  },
  grid: {
    marginTop: "-60px"
  },

  table: {
    width: "90%",
    margin: "auto",
    minWidth: 650,
    marginTop: 25
  },
  tableRowIndex0: {
    backgroundColor: theme.palette.primary.dark,
    color: "white",
    "&$selected, &$selected:hover": {
      backgroundColor: "#ffffff"
    }
  },
  checkBox0: {
    color: "white !important",
    "$selected &": {
      color: "white"
    }
  },
  checkBox1: {
    color: "#000000 !important",
    "$selected &": {
      color: "#000000"
    }
  },
  tableRowIndex1: {
    backgroundColor: theme.palette.primary.main,
    color: "#000000",
    "&$selected, &$selected:hover": {
      backgroundColor: "rgba(232, 232, 232, 0.43)"
    }
  },
  selected: {},
  tableCell: {
    whiteSpace: "normal",
    wordWrap: "break-word",
    maxWidth: "100px"
  },
  tableHeader: {
    fontWeight: "bold"
  },
  tablePagination: {
    fontWeight: "bold"
  },
  toolbar: {},
  hide: {
    display: "none"
  }
});

const TabContentWrapper = ({ tabIndex, classes }) => {
  const theme = useTheme();
  const [{ authKeyID, uid }, dispatch] = useAppState();

  const [isLoading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionComplete, setActionComplete] = useState(null);

  const [selected, setSelected] = useState(null);
  const [data, setData] = useState([]);

  const [selectedUserRoles, setSelectedUserRoles] = useState([]);

  useEffect(() => {
    clearAll();
  }, [tabIndex]);

  const clearAll = () => {
    setIsEditing(null);
    setSelected(null);
  };
  const handleClose = () => {
    setIsEditing(false);
    setSelected(null);
  };

  const handleRowClick = name => {
    if (selected === null) {
      setSelected(name);
    } else if (selected === name) {
      //unselect
      clearAll();
    }
  };
  const deleteUserByUsername = async (username, client) => {
    const { data } = await client.query({
      query: DELETEUSERBYUSERNAME,
      variables: {
        username: username
      }
    });
    return data.deleteUser.isDeleted;
  };
  const deleteDashboard = async (name, client) => {
    const { data } = await client.query({
      query: DELETEDASHBOARD,
      variables: {
        name: name
      }
    });

    if (data.deleteDashboard.allDeleted) {
      window.location.reload();
    }
    return data.deleteDashboard.allDeleted;
  };
  const updateDashboards = async (client, name, selectedIndices) => {
    const updated = await client.query({
      query: UPDATEDASHBOARD,
      variables: {
        dashboard: { name: name, indices: selectedIndices }
      }
    });
    clearAll();
    if (updated.data.updateDashboard.updated) {
      window.location.reload();
    }
  };

  const actionCompleteReset = () => {
    setLoading(false);
    setActionComplete(true);
    setIsEditing(null);
    setTimeout(() => {
      setActionComplete(null);
      setSelected(null);
    }, 3000);
  };

  const confirmEditUser = async (client, modifiedUsers) => {
    setLoading(true);
    const selectedUserObj = modifiedUsers.reduce((final, user) => {
      if (user.username.indexOf(selected) !== -1) {
        final = user;
      }
      return final;
    });
    try {
      const confirmed = await updateUserRoles(
        selected,
        selectedUserRoles,
        selectedUserObj.email,
        selectedUserObj.full_name,
        client
      );
      if (confirmed === false) {
        //has updated
        setData(
          modifiedUsers.map(user => {
            if (user.username === selected) {
              user.roles = selectedUserRoles;
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

  const deleteByName = async (client, modifiedData, tabIndex) => {
    setLoading(true);
    try {
      var confirmed =
        tabIndex === 1
          ? await deleteDashboard(selected, client)
          : await deleteUserByUsername(selected, client);
    } catch (error) {
    } finally {
      if (!confirmed) {
        //error
      }
    }
  };
  const config = {
    1: {
      query: getAllDashboards,
      dataReturnName: "getAllDashboards",
      tableKey: "dashboardsContentKey"
    },
    0: {
      query: getUsers,
      dataReturnName: "getUsers",
      tableKey: "usersContentKey"
    }
  };

  const tableConfig = config[tabIndex];

  return (
    <Query
      query={tableConfig.query}
      variables={{
        user: { authKeyID: authKeyID, uid: uid }
      }}
    >
      {({ loading, error, data }) => {
        if (loading)
          return (
            <Paper
              className={classes.root}
              style={{
                background:
                  tabIndex === 1
                    ? theme.palette.primary.main
                    : theme.palette.primary.dark
              }}
            >
              <div />
            </Paper>
          );
        if (error) {
          dispatch({
            type: "LOGOUT"
          });
          return null;
        }

        const modifiedData =
          data.length > 0 ? data : data[tableConfig.dataReturnName];

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
              <ApolloConsumer>
                {client => (
                  <Paper
                    className={classes.root}
                    style={{
                      background:
                        tabIndex === 1
                          ? theme.palette.primary.main
                          : theme.palette.primary.dark
                    }}
                  >
                    {(selected || actionComplete) && (
                      <TableToolbar
                        name={selected}
                        deleteName={() =>
                          deleteByName(client, modifiedData, tabIndex)
                        }
                        edit={name => confirmEditUser(client, modifiedData)}
                        clear={isCleared => clearAll()}
                        setIsEditing={() => setIsEditing(true)}
                        isLoading={isLoading}
                        actionComplete={actionComplete}
                      />
                    )}
                    <TableContent
                      key={tableConfig.key}
                      modifiedData={modifiedData}
                      classes={classes}
                      tabIndex={tabIndex}
                      isEditing={isEditing}
                      allRoles={
                        tabIndex === 0
                          ? data.getAllDashboards.map(
                              dashboard => dashboard.name
                            )
                          : []
                      }
                      setSelectedUserRoles={userRoles =>
                        setSelectedUserRoles(userRoles)
                      }
                      selected={selected}
                      handleRowClick={name => handleRowClick(name)}
                    />
                    {isEditing && tabIndex === 1 && (
                      <EditDashboardPopupWrapper
                        key={"editDashboardPopup" + selected}
                        isOpen={true}
                        handleClose={handleClose}
                        dashboardAction={(name, selectedIndices) =>
                          updateDashboards(client, name, selectedIndices)
                        }
                        dashboardName={selected}
                      />
                    )}
                  </Paper>
                )}
              </ApolloConsumer>
            </Grid>
          </div>
        );
      }}
    </Query>
  );
};
export default withStyles(styles)(TabContentWrapper);
