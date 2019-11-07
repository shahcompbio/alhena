import React, { useState } from "react";
import { useAppState } from "../util/app-state";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import AddBoxIcon from "@material-ui/icons/AddBox";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";

import SeperatedTabs from "./SeperatedTabs.js";

import NewUserPopup from "./NewUser/NewUserPopup.js";
import AddDashboardPopupWrapper from "./AddDashboardPopupWrapper.js";

import { ApolloConsumer } from "react-apollo";
import TabContentWrapper from "./TabContentWrapper.js";

import { createUserEmail } from "../Queries/queries.js";
import { createNewDashboard } from "../util/utils.js";

import { withStyles } from "@material-ui/styles";

const styles = theme => ({
  root: { flexGrow: 1, width: "80vw", margin: "auto", paddingTop: 50 },
  paper: {
    paddingBottom: theme.spacing.unit * 5,
    padding: theme.spacing.unit * 3,
    height: 125,
    width: "100%",
    borderRadius: 20,
    overflowX: "auto"
  },
  buttons: {
    zIndex: 50
  },
  actions: {
    float: "right"
  }
});
const AdminPanel = ({ classes }) => {
  const [{ authKeyID, uid }, dispatch] = useAppState();

  const [openPopup, setOpenPopup] = useState(false);
  const [tabIndex, setTabIndex] = useState(1);

  const [isEditing, setIsEditing] = useState(false);

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
  const addUser = async (event, client, email, name, selectedRoles) => {
    var data = await client.query({
      query: createUserEmail,
      variables: {
        recipient: { email: email, name, roles: selectedRoles.join(",") }
      }
    });
    return data.data.sendMail.accepted;
  };

  return (
    <div className={classes.root}>
      <Paper rounded={"true"} className={classes.paper}>
        {" "}
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
                    size="medium"
                    color="primary"
                    className={classes.buttons}
                    onClick={handleClickAdd}
                  >
                    <AddBoxIcon />
                  </IconButton>,
                  openPopup && tabIndex === 0 && (
                    <NewUserPopup
                      key={"newUserPopup"}
                      isOpen={openPopup}
                      handleClose={handleCloseAdd}
                      client={client}
                      addUser={addUser}
                    />
                  ),
                  openPopup && tabIndex === 1 && (
                    <AddDashboardPopupWrapper
                      key={"newDashboardPopup"}
                      isOpen={openPopup}
                      handleClose={handleCloseAdd}
                      dashboardAction={addDashboard}
                    />
                  )
                ]}
              </ApolloConsumer>
              <IconButton
                variant="outlined"
                size="medium"
                color="primary"
                className={classes.buttons}
                onClick={ev =>
                  dispatch({
                    type: "LOGOUT"
                  })
                }
              >
                <ExitToAppIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      <AppBar
        position={"static"}
        elevation={0}
        style={{ backgroundColor: "#ffffff", marginTop: "-80px" }}
      >
        {" "}
        <Toolbar
          // you need to set override hidden in toolbar
          style={{ overflow: "hidden" }}
        >
          <SeperatedTabs
            style={{ alignSelf: "flex-end" }}
            tabs={[{ label: "Users" }, { label: "Dashboards" }]}
            tabStyle={{
              bgColor: tabIndex === 0 ? "#4486a3" : "#62b2bf",
              selectedBgColor: tabIndex === 0 ? "#62b2bf" : "#4486a3"
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
  );
};

export default withStyles(styles)(AdminPanel);
