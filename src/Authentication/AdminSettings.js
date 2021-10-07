import React from "react";
import { makeStyles } from "@material-ui/core/styles";

import { Grid, Button, TextField, Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  innerGrid: { padding: 15 },
  root: { padding: 35 },
  submitButton: { color: "#fbfaf9", backgroundColor: "#828897" }
}));

const AdminSettings = ({ data }) => {
  const classes = useStyles();
  return (
    <Grid
      container
      spacing={2}
      direction="column"
      justify="flex-start"
      alignItems="flex-start"
      className={classes.root}
    >
      <Typography variant="h5">Search Table Labeling</Typography>
      <Grid
        container
        spacing={2}
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        className={classes.innerGrid}
      >
        <Grid
          container
          spacing={2}
          direction="column"
          justify="flex-start"
          alignItems="flex-start"
          className={classes.innerGrid}
        >
          <table>
            <tr>
              <th style={{ textAlign: "left" }}>
                <Typography variant="body">Type </Typography>
              </th>
              <th style={{ width: 20 }} />
              <th style={{ textAlign: "left" }}>
                <Typography variant="body">Display Label</Typography>
              </th>
            </tr>
            {data.map(option => (
              <tr>
                <td>
                  <Typography variant="body">{option.type} </Typography>
                </td>
                <td style={{ width: 20 }} />
                <td style={{ textAlign: "left" }}>
                  <TextField
                    id="standard-basic"
                    label="Standard"
                    variant="standard"
                  >
                    {option.label}
                  </TextField>
                </td>
              </tr>
            ))}
          </table>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
        direction="row"
        justify="flex-end"
        alignItems="flex-end"
        className={classes.innerGrid}
      >
        <Button
          className={classes.submitButton}
          variant="outlined"
          disableElevation
          size="large"
          type="submit"
        >
          Save
        </Button>
      </Grid>
    </Grid>
  );
};
export default AdminSettings;
