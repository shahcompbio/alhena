import React, { useState } from "react";
import gql from "graphql-tag";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import AddBoxIcon from "@material-ui/icons/AddBox";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import SeperatedTabs from "./SeperatedTabs.js";

import NewUserPopup from "./NewUser/NewUserPopup.js";
import AddDashboardPopupWrapper from "./AddDashboardPopupWrapper.js";

import Menu from "../Misc/Menu.js";

import { ApolloConsumer } from "react-apollo";
import TabContentWrapper from "./TabContentWrapper.js";

import { withStyles, useTheme } from "@material-ui/styles";
const styles = theme => ({
  actions: {
    float: "right"
  },
  appBar: {
    backgroundColor: "#ffffff",
    margin: "auto",
    marginTop: "-80px",
    width: "90%",
    zIndex: 10
  },
  icons: {
    padding: 0,
    zIndex: 5
  },
  iconSvg: { width: "1.5em", height: "1.5em" },
  root: {
    flexGrow: 1,
    width: "80vw",
    margin: "auto",
    paddingTop: 50,
    marginBottom: 80
  },
  paper: {
    paddingBottom: theme.spacing(5),
    padding: theme.spacing(3),
    height: 125,
    width: "90%",
    borderRadius: 10,
    margin: "auto",
    overflowX: "auto"
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
const createNewDashboard = async (
  client,
  name,
  selectedIndices,
  selectedColumns,
  selectedUsers,
  deletedUsers
) => {
  const { data } = await client.query({
    query: CREATENEWDASHBOARD,
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
  return data.createNewDashboard.created;
};

const AdminPanel = ({ classes }) => {
  const theme = useTheme();

  const [openPopup, setOpenPopup] = useState(false);
  const [tabIndex, setTabIndex] = useState(1);

  const handleClickAdd = () => {
    setOpenPopup(true);
  };

  const handleCloseAdd = () => {
    setOpenPopup(false);
  };
  const addDashboard = async (
    client,
    name,
    selectedIndices,
    selectedColumns,
    selectedUsers
  ) => {
    const created = await createNewDashboard(
      client,
      name,
      selectedIndices,
      selectedColumns,
      selectedUsers,
      []
    );
    if (created) {
      window.location.reload();
    }
  };
  const keyType = tabIndex === 0 ? "-users" : "-dashboards";
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
                justify="flex-end"
                alignItems="center"
                className={classes.actions}
              >
                <ApolloConsumer key={"add-consumer" + keyType}>
                  {client => [
                    <IconButton
                      key={"add-button" + keyType}
                      variant="outlined"
                      color="secondary"
                      className={classes.icons}
                      onClick={handleClickAdd}
                    >
                      <AddBoxIcon className={classes.iconSvg} />
                    </IconButton>,
                    openPopup && tabIndex === 0 && (
                      <NewUserPopup
                        key={"newUserPopup"}
                        isOpen={openPopup}
                        handleClose={handleCloseAdd}
                        client={client}
                      />
                    ),
                    openPopup && tabIndex === 1 && (
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
                            client,
                            name,
                            selectedIndices,
                            selectedColumns,
                            selectedUsers
                          )
                        }
                      />
                    )
                  ]}
                </ApolloConsumer>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        <AppBar position={"static"} elevation={0} className={classes.appBar}>
          <Toolbar className={classes.toolBar}>
            <SeperatedTabs
              className={classes.tabs}
              tabs={[{ label: "Users" }, { label: "Dashboards" }]}
              tabStyle={{
                bgColor:
                  tabIndex === 0
                    ? theme.palette.primary.main
                    : theme.palette.primary.dark,
                selectedBgColor:
                  tabIndex === 0
                    ? theme.palette.primary.dark
                    : theme.palette.primary.main
              }}
              tabProps={{
                disableRipple: true
              }}
              value={tabIndex}
              onChange={(e, i) => setTabIndex(i)}
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
