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

import { getAllDashboards, getUsers } from "../Queries/queries.js";
import { withStyles, useTheme } from "@material-ui/styles";

export const UPDATEDASHBOARD = gql`
  query updateDashboardByName($dashboard: DashboardInput!) {
    updateDashboardByName(dashboard: $dashboard) {
      updated
    }
  }
`;
export const DELETEDASHBOARD = gql`
  query deleteDashboardByNames($name: String!) {
    deleteDashboardByName(name: $name) {
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
export const UPDATEUSER = gql`
  query updateUser(
    $username: String!
    $newRoles: [String!]
    $email: String!
    $name: String!
    $isAdmin: Boolean!
  ) {
    updateUser(
      username: $username
      newRoles: $newRoles
      email: $email
      name: $name
      isAdmin: $isAdmin
    ) {
      created
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
    marginTop: 25,
    marginBottom: 80,
  },
  grid: {
    marginTop: "-60px",
  },
});

const TabContentWrapper = ({ tabIndex, classes }) => {
  const theme = useTheme();
  const [{ authKeyID, uid }, dispatch] = useAppState();

  const [isLoading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionComplete, setActionComplete] = useState(null);

  const [selected, setSelected] = useState(null);
  const [tableData, setData] = useState([]);

  const [selectedUserRoles, setSelectedUserRoles] = useState([]);
  const [selectedUserAdmin, setSelectedUserAdmin] = useState(null);

  useEffect(() => {
    setIsEditing(null);
    setSelected(null);
    setData([]);
    setSelectedUserRoles([]);
    setSelectedUserAdmin(null);
  }, [tabIndex]);

  const clearAll = () => {
    setIsEditing(null);
    setSelected(null);
  };
  const handleClose = () => {
    setIsEditing(false);
    setSelected(null);
  };

  const handleRowClick = (name) => {
    if (selected === null) {
      setSelected(name);
    } else if (selected === name) {
      //unselect
      clearAll();
    }
  };
  const updateUser = async (
    username,
    roles,
    email,
    full_name,
    isAdmin,
    client
  ) => {
    const { data } = await client.query({
      query: UPDATEUSER,
      variables: {
        email: email,
        name: full_name,
        username: username,
        newRoles: [...roles],
        isAdmin: isAdmin,
      },
    });
    return data.updateUser.created;
  };
  const deleteUserByUsername = async (username, client) => {
    const { data } = await client.query({
      query: DELETEUSERBYUSERNAME,
      variables: {
        username: username,
      },
    });
    return data.deleteUser.isDeleted;
  };
  const deleteDashboard = async (name, client) => {
    const { data } = await client.query({
      query: DELETEDASHBOARD,
      variables: {
        name: name,
      },
    });

    if (data.deleteDashboardByName.allDeleted) {
      window.location.reload();
    }
    return data.deleteDashboardByName.allDeleted;
  };
  const updateDashboards = async (
    client,
    name,
    selectedIndices,
    selectedColumns,
    selectedUsers,
    deletedUsers
  ) => {
    const updated = await client.query({
      query: UPDATEDASHBOARD,
      variables: {
        dashboard: {
          name: name,
          indices: selectedIndices,
          columns: selectedColumns,
          users: selectedUsers,
          deletedUsers: deletedUsers,
        },
      },
    });
    clearAll();
    if (updated.data.updateDashboardByName.updated) {
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
      setSelectedUserAdmin(null);
      setSelectedUserRoles([]);
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
      if (selectedUserRoles.length !== 0 || selectedUserAdmin !== null) {
        const roles =
          selectedUserRoles.length > 0
            ? selectedUserRoles
            : selectedUserObj["roles"];

        const isAdmin =
          selectedUserAdmin !== null
            ? selectedUserAdmin
            : selectedUserObj["isAdmin"];

        const confirmed = await updateUser(
          selected,
          roles,
          selectedUserObj.email,
          selectedUserObj.full_name,
          isAdmin,
          client
        );

        if (confirmed === false) {
          //has updated
          setData(
            modifiedUsers.map((user) => {
              if (user.username === selected) {
                user.roles = roles;
                user.isAdmin = isAdmin;
              }
              return user;
            })
          );
          actionCompleteReset();
        } else {
          //error
        }
      }
    } catch (error) {}
  };
  const sortAlpha = (list) =>
    list.sort((a, b) => {
      var textA = a.name ? a.name.toUpperCase() : a.username.toUpperCase();
      var textB = b.name ? b.name.toUpperCase() : b.username.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });

  const deleteByName = async (client, users, tabIndex) => {
    setLoading(true);
    try {
      const confirmed =
        tabIndex === 1
          ? await deleteDashboard(selected, client)
          : await deleteUserByUsername(selected, client);

      if (confirmed) {
        //has updated
        setData(users.filter((user) => user.username !== selected));
        actionCompleteReset();
        window.location.reload();
      } else {
        //error
      }
    } catch (error) {}
  };
  const config = {
    1: {
      query: getAllDashboards,
      dataReturnName: "getAllDashboards",
      tableKey: "dashboardsContentKey",
    },
    0: {
      query: getUsers,
      dataReturnName: "getUsers",
      tableKey: "usersContentKey",
    },
  };

  const tableConfig = config[tabIndex];

  return (
    <Query
      query={tableConfig.query}
      variables={{
        user: { authKeyID: authKeyID, uid: uid },
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
                    : theme.palette.primary.dark,
              }}
            >
              <div />
            </Paper>
          );
        if (error) {
          dispatch({
            type: "LOGOUT",
          });
          return null;
        }

        const modifiedData =
          tableData.length > 0
            ? sortAlpha(tableData)
            : sortAlpha(data[tableConfig.dataReturnName]);

        return (
          <div className={classes.root} key={"adminTable" + tabIndex}>
            <Grid
              className={classes.grid}
              direction="column"
              justify="center"
              alignItems="center"
              container
              spacing={2}
              key={"adminGrid"}
            >
              <ApolloConsumer>
                {(client) => (
                  <Paper
                    className={classes.root}
                    key={"adminTablePaper" + tabIndex}
                    style={{
                      background:
                        tabIndex === 1
                          ? theme.palette.primary.main
                          : theme.palette.primary.dark,
                    }}
                  >
                    {(selected || actionComplete) && (
                      <TableToolbar
                        name={selected}
                        deleteName={() =>
                          deleteByName(client, modifiedData, tabIndex)
                        }
                        edit={(name) => confirmEditUser(client, modifiedData)}
                        clear={(isCleared) => clearAll()}
                        setIsEditing={() => setIsEditing(true)}
                        isLoading={isLoading}
                        actionComplete={actionComplete}
                      />
                    )}
                    <TableContent
                      key={"tableContent"}
                      data={modifiedData}
                      tabIndex={tabIndex}
                      isEditing={isEditing}
                      allRoles={
                        tabIndex === 0
                          ? data.getAllDashboards.map(
                              (dashboard) => dashboard.name
                            )
                          : []
                      }
                      setSelectedUserRoles={(userRoles) =>
                        setSelectedUserRoles(userRoles)
                      }
                      setSelectedUserAdmin={(isAdmin) =>
                        setSelectedUserAdmin(isAdmin)
                      }
                      selected={selected}
                      handleRowClick={(name) => handleRowClick(name)}
                    />
                    {isEditing && tabIndex === 1 && (
                      <EditDashboardPopupWrapper
                        key={"editDashboardPopup" + selected}
                        isOpen={true}
                        handleClose={handleClose}
                        dashboardAction={(
                          name,
                          selectedIndices,
                          selectedColumns,
                          selectedUsers,
                          deletedUsers
                        ) =>
                          updateDashboards(
                            client,
                            name,
                            selectedIndices,
                            selectedColumns,
                            selectedUsers,
                            deletedUsers
                          )
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
