import React, { useState, useEffect } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { useAppState } from "../util/app-state";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import SeperatedTabs from "./SeperatedTabs.js";

import NewUserPopup from "./NewUser/NewUserPopup.js";
import AddDashboardPopupWrapper from "./AddDashboardPopupWrapper.js";
import Menu from "../Misc/Menu.js";
import TabContentWrapper from "./TabContentWrapper.js";

import { withStyles } from "@mui/styles";
const styles = theme => ({
  actions: {
    float: "right"
  },
  appBar: {
    width: "50% !important",
    margin: "auto",
    zIndex: 10,
    marginLeft: -55,
    marginTop: -60,
    backgroundColor: "#ffffff00 !important",
    position: "absolute !important"
  },
  icons: {
    height: "45px",
    marginTop: "20px",
    position: "absolute !important",
    padding: 0,
    paddingTop: "50px !important",
    zIndex: 5
  },
  iconSvg: {
    width: "1.5em",
    height: "1.5em",
    color: "#5b6691",
    pointerEvents: "all"
  },
  root: {
    flexGrow: 1,
    width: "80vw",
    margin: "auto",
    paddingTop: 50,
    marginBottom: 80
  },
  paper: {
    overflowY: "clip",
    paddingBottom: theme.spacing(5),
    padding: theme.spacing(3),
    height: 100,
    width: "90%",
    borderRadius: 10,
    margin: "auto",
    overflowX: "auto",
    backgroundColor: "#4e89bb",
    color: "white"
  },
  tabs: { alignSelf: "flex-end" },
  toolbar: { overflow: "hidden" }
});
const CREATENEWDASHBOARD = gql`
  query createNewDashboard($dashboard: DashboardInput!) {
    createNewDashboard(dashboard: $dashboard) {
      created
    }
  }
`;

const AdminPanel = ({ classes }) => {
  const [{ lastSettingsTab }] = useAppState();

  const [openPopup, setOpenPopup] = useState(false);
  const [tabIndex, setTabIndex] = useState(
    lastSettingsTab !== null ? parseInt(lastSettingsTab) : 0
  );

  const [createNewDashboard, { data, loading, error }] = useLazyQuery(
    CREATENEWDASHBOARD
  );

  const handleClickAdd = () => {
    setOpenPopup(true);
  };

  const handleCloseAdd = () => {
    setOpenPopup(false);
  };
  useEffect(() => {
    if (data) {
      if (data.createNewDashboard.created) {
        window.location.reload();
      }
    }
  }, [data, loading, error]);

  const addDashboard = (
    createNewDashboard,
    name,
    selectedIndices,
    selectedColumns,
    selectedUsers
  ) => {
    createNewDashboard({
      variables: {
        dashboard: {
          name: name,
          indices: selectedIndices,
          columns: selectedColumns,
          users: selectedUsers,
          deletedUsers: []
        }
      }
    });
  };
  const keyType =
    tabIndex === 0 ? "-users" : tabIndex === 1 ? "-dashboards" : "-settings";
  return (
    <div style={{ flexGrow: 1, height: "100vh" }}>
      <div className={classes.root}>
        <Paper
          rounded={"true"}
          className={classes.paper}
          key={"rootPaper" + keyType}
        >
          <Grid
            container
            direction="row"
            spacing={3}
            key={"adminpanel-container" + keyType}
          >
            <Grid item xs={6} key={"admin-title" + keyType}>
              <Typography variant="h4">Admin Settings</Typography>
            </Grid>
            <Grid item xs={6} key={"icon-container"}>
              <Grid
                container
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                className={classes.actions}
              >
                <IconButton
                  key={"add-button" + keyType}
                  variant="outlined"
                  color="secondary"
                  className={classes.icons}
                  onClick={handleClickAdd}
                  size="large"
                >
                  <AddBoxIcon className={classes.iconSvg} />
                </IconButton>
                {openPopup && tabIndex === 0 && (
                  <NewUserPopup
                    key={"newUserPopup"}
                    isOpen={openPopup}
                    handleClose={handleCloseAdd}
                  />
                )}
                {openPopup && tabIndex === 1 && (
                  <AddDashboardPopupWrapper
                    key={"newDashboardPopup"}
                    isOpen={openPopup}
                    handleClose={handleCloseAdd}
                    dashboardAction={(
                      name,
                      selectedIndices,
                      selectedColumns,
                      selectedUsers
                    ) =>
                      addDashboard(
                        createNewDashboard,
                        name,
                        selectedIndices,
                        selectedColumns,
                        selectedUsers
                      )
                    }
                  />
                )}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        <AppBar position={"static"} elevation={0} className={classes.appBar}>
          <Toolbar className={classes.toolBar}>
            <SeperatedTabs
              className={classes.tabs}
              tabs={[
                { label: "Users" },
                { label: "Dashboards" },
                { label: "Settings" }
              ]}
              tabStyle={{
                bgColor: "#d6d9dd",
                selectedBgColor: "rgb(251 251 251)",
                marginTop: 45
                //    bgColor: "rgb(177 193 187)",
                //  selectedBgColor: "RGB(201, 221, 214)"
              }}
              tabProps={{
                disableRipple: true
              }}
              value={tabIndex}
              onChange={(e, i) => {
                setTabIndex(i);
                localStorage.setItem("lastSettingsTab", i);
              }}
            />
          </Toolbar>
        </AppBar>
        <TabContentWrapper tabIndex={tabIndex} />
      </div>
      <Menu />
    </div>
  );
};

export default withStyles(styles)(AdminPanel);
