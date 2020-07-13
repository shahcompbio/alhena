import React, { useState } from "react";

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

import { createNewDashboard } from "../util/utils.js";

import { withStyles, useTheme } from "@material-ui/styles";
const styles = theme => ({
  actions: {
    float: "right"
  },
  appBar: {
    backgroundColor: "#ffffff",
    margin: "auto",
    marginTop: "-80px",
    width: "90%"
  },
  icons: {
    zIndex: 5
  },
  iconSvg: { width: "1.5em", height: "1.5em" },
  root: { flexGrow: 1, width: "80vw", margin: "auto", paddingTop: 50 },
  paper: {
    paddingBottom: theme.spacing.unit * 5,
    padding: theme.spacing.unit * 3,
    height: 125,
    width: "90%",
    borderRadius: 10,
    margin: "auto",
    overflowX: "auto"
  },
  tabs: { alignSelf: "flex-end" },
  toolbar: { overflow: "hidden" }
});

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
  const addDashboard = async (client, name, selectedIndices) => {
    const created = createNewDashboard(client, name, selectedIndices);
    if (created) {
      window.location.reload();
    }
  };

  return (
    <div style={{ flexGrow: 1, height: "100vh" }}>
      <div className={classes.root}>
        <Paper rounded={"true"} className={classes.paper}>
          <Grid
            container
            direction="row"
            spacing={3}
            key={"adminpanel-container"}
          >
            <Grid item xs={6} key={"admin-title"}>
              <Typography variant="h5">Admin Settings</Typography>
            </Grid>
            <Grid item xs={6} key={"icon-container"}>
              <Grid
                container
                direction="row"
                justify="flex-end"
                alignItems="center"
                className={classes.actions}
              >
                <ApolloConsumer key={"add-consumer"}>
                  {client => [
                    <IconButton
                      key={"add-button"}
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
                        dashboardAction={(name, selectedIndices) =>
                          addDashboard(client, name, selectedIndices)
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
