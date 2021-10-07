import React, { useState, useEffect } from "react";
import { useAppState } from "../util/app-state";

import TableContent from "./TableContent.js";
import EditDashboardPopupWrapper from "./EditDashboardPopupWrapper.js";
import AdminSettings from "./AdminSettings";
import TableToolbar from "./TableToolBar.js";

import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

import { withStyles, useTheme } from "@material-ui/styles";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
const getAllSettings = gql`
  query AdminPanel {
    getAllSettings {
      type
      label
    }
  }
`;

const getUsers = gql`
  query AdminPanel($user: ApiUser!) {
    getUsers(auth: $user) {
      username
      roles
      full_name
      email
      isAdmin
    }
    getAllDashboards(auth: $user) {
      name
    }
  }
`;
const getAllDashboards = gql`
  query getAllDashboards($user: ApiUser!) {
    getAllDashboards(auth: $user) {
      name
      count
    }
  }
`;

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
    marginBottom: 80
  },
  grid: {
    marginTop: "-60px"
  }
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

  const [
    updateUser,
    { data: updateUserData, loading: updateUserLoading, error: updateUserError }
  ] = useLazyQuery(UPDATEUSER);

  const [
    deleteUser,
    { data: deleteUserData, loading: deleteUserLoading, error: deleteUserError }
  ] = useLazyQuery(DELETEUSERBYUSERNAME);

  const [
    deleteDashboard,
    {
      data: deleteDashboardData,
      loading: deleteDashboardLoading,
      error: deleteDashboardError
    }
  ] = useLazyQuery(DELETEDASHBOARD);

  const [
    updateDashboard,
    {
      data: updateDashboardData,
      loading: updateDashboardError,
      error: updateDashboardLoading
    }
  ] = useLazyQuery(UPDATEDASHBOARD);

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

  const handleRowClick = name => {
    if (selected === name) {
      //unselect
      clearAll();
    } else {
      setSelected(name);
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
  useEffect(() => {
    if (deleteUserData) {
      //      return data.deleteUser.isDeleted;
      if (deleteUserData.deleteUser.isDeleted) {
        //has updated
        setData(modifiedData.filter(user => user.username !== selected));
        actionCompleteReset();
        window.location.reload();
      } else {
        setLoading(false);
        //error
      }
    }
  }, [deleteUserData, deleteUserError, deleteUserLoading]);

  useEffect(() => {
    if (updateUserData) {
      if (updateUserData.updateUser.created === false) {
        const selectedUserObj = modifiedData.reduce((final, user) => {
          if (user.username.indexOf(selected) !== -1) {
            final = user;
          }
          return final;
        });
        const roles =
          selectedUserRoles.length > 0
            ? selectedUserRoles
            : selectedUserObj["roles"];

        const isAdmin =
          selectedUserAdmin !== null
            ? selectedUserAdmin
            : selectedUserObj["isAdmin"];

        //has updated
        setData(
          modifiedData.map(user => {
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
  }, [updateUserData, updateUserError, updateUserLoading]);

  useEffect(() => {
    if (deleteDashboardData) {
      if (deleteDashboardData.deleteDashboardByName.allDeleted) {
        window.location.reload();
      }
    }
  }, [deleteDashboardData, deleteDashboardError, deleteDashboardLoading]);

  useEffect(() => {
    if (updateDashboardData) {
      if (updateDashboardData.updateDashboardByName.updated) {
        window.location.reload();
      }
    }
  }, [updateDashboardData, updateDashboardError, updateDashboardLoading]);

  const confirmEditUser = (modifiedUsers, updateUser) => {
    setLoading(true);
    const selectedUserObj = modifiedUsers.reduce((final, user) => {
      if (user.username.indexOf(selected) !== -1) {
        final = user;
      }
      return final;
    });
    if (selectedUserRoles.length !== 0 || selectedUserAdmin !== null) {
      const roles =
        selectedUserRoles.length > 0
          ? selectedUserRoles
          : selectedUserObj["roles"];

      const isAdmin =
        selectedUserAdmin !== null
          ? selectedUserAdmin
          : selectedUserObj["isAdmin"];

      updateUser({
        variables: {
          email: selectedUserObj.email,
          name: selectedUserObj.full_name,
          username: selected,
          newRoles: [...roles],
          isAdmin: isAdmin
        }
      });
    } else {
      setLoading(false);
    }
  };
  const sortAlpha = (list, name) =>
    list.sort((a, b) => {
      var textA = a[name] ? a[name].toUpperCase() : a.username.toUpperCase();
      var textB = b[name] ? b[name].toUpperCase() : b.username.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });

  const deleteByName = tabIndex => {
    setLoading(true);
    tabIndex === 1
      ? deleteDashboard({
          variables: {
            name: selected
          }
        })
      : deleteUser({
          variables: {
            username: selected
          }
        });
  };
  const config = {
    2: {
      query: getAllSettings,
      dataReturnName: "getAllSettings",
      tableKey: "settingsContentKey",
      keyName: "type"
    },
    1: {
      query: getAllDashboards,
      dataReturnName: "getAllDashboards",
      tableKey: "dashboardsContentKey",
      keyName: "name"
    },
    0: {
      query: getUsers,
      dataReturnName: "getUsers",
      tableKey: "usersContentKey",
      keyName: "name"
    }
  };

  const tableConfig = config[tabIndex];
  const { loading, error, data } = useQuery(tableConfig["query"], {
    variables: {
      user: { authKeyID: authKeyID, uid: uid }
    }
  });

  if (loading) {
    return (
      <Paper
        className={classes.root}
        style={{
          background: "rgb(251 251 251)"
          //tabIndex === 1 ? "rgb(196 221 239)" : theme.palette.primary.dark
        }}
      >
        <div />
      </Paper>
    );
  }
  if (error) {
    dispatch({
      type: "LOGOUT"
    });
    return null;
  }
  const modifiedData =
    tableData.length > 0
      ? sortAlpha(tableData, tableConfig.keyName)
      : sortAlpha(data[tableConfig.dataReturnName], tableConfig.keyName);

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
        <Paper
          className={classes.root}
          elevation={0}
          key={"adminTablePaper" + tabIndex}
          style={{
            background: "rgb(251 251 251)"
            //background: "rgb(201 221 214)"
            //background: tabIndex === 1 ? "rgb(196 221 239)" : "rgb(201 221 214)"
          }}
        >
          {(selected || actionComplete) && (
            <TableToolbar
              name={selected}
              deleteName={() => deleteByName(tabIndex)}
              edit={name => confirmEditUser(modifiedData, updateUser)}
              clear={isCleared => clearAll()}
              setIsEditing={() => setIsEditing(true)}
              isLoading={isLoading}
              actionComplete={actionComplete}
            />
          )}
          {tabIndex === 2 ? (
            <AdminSettings data={data[tableConfig.dataReturnName]} />
          ) : (
            <TableContent
              key={"tableContent"}
              data={modifiedData}
              tabIndex={tabIndex}
              isEditing={isEditing}
              allRoles={
                tabIndex === 0
                  ? data.getAllDashboards.map(dashboard => dashboard.name)
                  : []
              }
              setSelectedUserRoles={userRoles =>
                setSelectedUserRoles(userRoles)
              }
              setSelectedUserAdmin={isAdmin => setSelectedUserAdmin(isAdmin)}
              selected={selected}
              handleRowClick={name => handleRowClick(name)}
            />
          )}
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
              ) => {
                updateDashboard({
                  variables: {
                    dashboard: {
                      name: name,
                      indices: selectedIndices,
                      columns: selectedColumns,
                      users: selectedUsers,
                      deletedUsers: deletedUsers
                    }
                  }
                });
                clearAll();
              }}
              dashboardName={selected}
            />
          )}
        </Paper>
      </Grid>
    </div>
  );
};
export default withStyles(styles)(TabContentWrapper);
