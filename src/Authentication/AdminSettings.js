import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import _ from "lodash";
import { Grid, Button, TextField, Typography } from "@material-ui/core";
import SnackbarContentWrapper from "../Misc/SnackBarPopup.js";

import { gql, useLazyQuery } from "@apollo/client";

const useStyles = makeStyles(theme => ({
  innerGrid: { padding: 15 },
  root: { padding: 35 },
  submitButton: { color: "#fdfdfd", backgroundColor: "#4e89bb" }
}));
const UPDATEDASHBOARDLABLES = gql`
  query updateDashboardColumns($columns: [DashboardColumnsInput]) {
    updateDashboardColumns(columns: $columns) {
      updated
    }
  }
`;
const AdminSettings = ({ data }) => {
  const classes = useStyles();
  const [error, setError] = useState(null);
  const originalLabels = data.reduce((final, d) => {
    final[d.type] = d.label;
    return final;
  }, {});
  const [labels, setLabels] = useState(originalLabels);

  const [updateLabels, { data: isUpdated }] = useLazyQuery(
    UPDATEDASHBOARDLABLES
  );
  useEffect(() => {
    if (isUpdated) {
      if (isUpdated.updateDashboardColumns.updated) {
        window.location.reload();
      } else {
        setError(14);
        //error
      }
    }
  }, [isUpdated]);

  return (
    <Grid
      container
      spacing={2}
      direction="column"
      justify="flex-start"
      alignItems="flex-start"
      className={classes.root}
    >
      {error && (
        <SnackbarContentWrapper
          variant="error"
          errorNumber={error}
          setError={setError}
        />
      )}
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
            <tr key={"tr-type"}>
              <th style={{ textAlign: "left" }}>
                <Typography variant="body">Type </Typography>
              </th>
              <th style={{ width: 20 }} />
              <th style={{ textAlign: "left" }}>
                <Typography variant="body">Display Label</Typography>
              </th>
            </tr>
            {data.map(option => (
              <tr key={"tr-" + option.type}>
                <td key={"td-" + option.t}>
                  <Typography variant="standard" key={"type-" + option.type}>
                    {option.type}{" "}
                  </Typography>
                </td>
                <td style={{ width: 20 }} />
                <td style={{ textAlign: "left" }}>
                  <TextField
                    key={"textfield-" + option.t}
                    key={option.type + "-label"}
                    variant="standard"
                    onChange={event => {
                      var newLabels = labels;
                      newLabels[option.type] = event.target.value;
                      setLabels({ ...newLabels });
                    }}
                    value={labels[option.type]}
                  />
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
          disabled={_.isEqual(labels, originalLabels)}
          variant="outlined"
          disableElevation
          onClick={() => {
            updateLabels({
              variables: {
                columns: [
                  ...Object.keys(labels).map(key => ({
                    id: key,
                    name: labels[key]
                  }))
                ]
              }
            });
          }}
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
