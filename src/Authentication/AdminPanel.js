import React, { useState, useRef } from "react";
import { useAppState } from "../util/app-state";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import AddBoxIcon from "@material-ui/icons/AddBox";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

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

  const handleClickAddUser = () => {
    setOpenPopup(true);
  };

  const handleCloseAddUser = () => {
    setOpenPopup(false);
  };

  const addUser = async (event, client, email, name) => {
    var data = await client.query({
      query: createUserEmail,
      variables: {
        recipient: { email: email, name }
      }
    });
    return data.data.sendMail.accepted;
  };

  return (
    <div className={classes.root}>
      <Paper rounded className={classes.paper}>
        {" "}
        <Grid container direction="row" alignItems="space-evenly" spacing={3}>
          <Grid item xs={6}>
            <Typography variant="h5">Admin Settings</Typography>
          </Grid>
          <Grid item xs={6}>
            <Grid
              container
              direction="row"
              justify="flex-end"
              alignItems="center"
              className={classes.actions}
            >
              <ApolloConsumer>
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
                  <NewUserPopup
                    isOpen={openPopup}
                    handleClose={handleCloseAddUser}
                    client={client}
                    addUser={addUser}
                  />
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
      <UserTable />
    </div>
  );
};

export default withStyles(styles)(AdminPanel);
