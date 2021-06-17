import React, { useState, useEffect } from "react";
import * as d3 from "d3";

import { Dialog, Grid } from "@material-ui/core";

import Button from "@material-ui/core/Button";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import FilledInput from "@material-ui/core/FilledInput";

import { withStyles, makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

import { useAppState } from "../util/app-state";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

import { useStatisticsState } from "../Dashboard/DashboardState/statsState";

const styles = theme => ({
  dialogContent: {
    width: "85%",
    height: 70,
    textAlign: "center",
    paddingTop: "10px !important"
  },
  dialogGrid: { width: "80%" },
  shareButton: {
    marginTop: 7,
    right: 100,
    position: "absolute",
    backgroundColor: "#e5f3f3",
    color: "#2b5d65"
  },
  closeButton: {
    marginTop: 7,
    right: 20,
    position: "absolute",
    color: "#350800",
    backgroundColor: "#efcfc5"
  },
  urlInput: {
    paddingTop: 20
  }
});

const SET_CACHE_SETTING = gql`
  query setCacheCopyUrl($type: String!, $value: String!) {
    setCacheCopyUrl(type: $type, value: $value) {
      link
    }
  }
`;
const SharePopup = ({
  setOpenSharePopup,
  openSharePopup,
  client,
  classes,
  analysis
}) => {
  const [state, dispatch] = useStatisticsState();
  const [url, setUrl] = useState(
    window.location.origin + "/dashboards/" + analysis
  );
  useEffect(() => {
    (async () => {
      if (
        Object.keys(state.axisChange)
          .map(key => state.axisChange[key])
          .indexOf(true) !== -1
      ) {
        const paramsString = JSON.stringify(state);
        const response = await client.query({
          query: SET_CACHE_SETTING,
          variables: {
            type: "copyUrl",
            value: paramsString
          }
        });
        if (response) {
          setUrl(url + "/" + response.data.setCacheCopyUrl.link);
        }
      }
    })();
  }, [state]);
  return (
    <Dialog
      fullWidth
      maxWidth={"lg"}
      open={openSharePopup}
      onClose={() => setOpenSharePopup()}
      aria-labelledby="form-dialog-title"
    >
      <DialogContent className={classes.dialogContent}>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
        >
          <FilledInput
            classes={{ input: classes.urlInput }}
            id="copyUrl"
            value={url}
            fullWidth
            readonly
          />
          <Button
            variant="outlined"
            color="primary"
            className={classes.shareButton}
            onClick={() => {
              const urlElement = d3.select("#copyUrl").node();
              urlElement.select();
              document.execCommand("copy");
            }}
          >
            Share
          </Button>
          <Button
            variant="outlined"
            color="primary"
            className={classes.closeButton}
            onClick={() => setOpenSharePopup()}
          >
            Close
          </Button>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default withStyles(styles)(SharePopup);
