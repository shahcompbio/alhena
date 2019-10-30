import React, { useState, useRef } from "react";
import { useAppState } from "../util/app-state";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import AddBoxIcon from "@material-ui/icons/AddBox";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";

import SeperatedTabs from "./SeperatedTabs.js";
import UserTable from "./UserTable.js";
import NewUserPopup from "./NewUser/NewUserPopup.js";

import { createUserEmail } from "../Queries/queries.js";
import { ApolloConsumer } from "react-apollo";

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
    //  margin: theme.spacing.unit
  },
  actions: {
    float: "right"
  }
});
const AdminPanel = ({ classes }) => {
  const [{ authKeyID, uid }, dispatch] = useAppState();

  const [openPopup, setOpenPopup] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const handleClickAddUser = () => {
    setOpenPopup(true);
  };

  const handleCloseAddUser = () => {
    setOpenPopup(false);
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
      <Paper rounded className={classes.paper}>
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
              <ApolloConsumer key={"adduser-consumer"}>
                {client => [
                  <IconButton
                    variant="outlined"
                    size="medium"
                    color="primary"
                    className={classes.buttons}
                    onClick={handleClickAddUser}
                  >
                    <AddBoxIcon />
                  </IconButton>,
                  openPopup && (
                    <NewUserPopup
                      isOpen={openPopup}
                      handleClose={handleCloseAddUser}
                      client={client}
                      addUser={addUser}
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
            tabs={[{ label: "Users" }, { label: "Permissions" }]}
            tabStyle={{
              bgColor: "#4486a3",
              selectedBgColor: "#62b2bf"
            }}
            tabProps={{
              disableRipple: true
            }}
            value={tabIndex}
            onChange={(e, i) => setTabIndex(i)}
          />
        </Toolbar>
      </AppBar>
      <UserTable />
    </div>
  );
};

export default withStyles(styles)(AdminPanel);
