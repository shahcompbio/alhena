import React, { useState, useEffect } from "react";
import * as d3 from "d3";

import { Dialog, Grid } from "@mui/material";

import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import FilledInput from "@mui/material/FilledInput";

import withStyles from '@mui/styles/withStyles';
import { gql, useLazyQuery } from "@apollo/client";

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
  classes,
  analysis
}) => {
  const [state] = useStatisticsState();
  const [url, setUrl] = useState(
    window.location.origin + "/alhena/dashboards/" + analysis
  );

  const [setCopyUrl, { data }] = useLazyQuery(SET_CACHE_SETTING);

  useEffect(() => {
    console.log(state);
    if (
      Object.keys(state.axisChange)
        .map(key => state.axisChange[key])
        .indexOf(true) !== -1
    ) {
      const paramsString = JSON.stringify(state);

      setCopyUrl({
        variables: {
          type: "copyUrl",
          value: paramsString
        }
      });
    }
  }, [state]);
  useEffect(() => {
    if (data) {
      setUrl(url + "/" + data.setCacheCopyUrl.link);
    }
  }, [data, setUrl]);

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
          justifyContent="flex-start"
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
            Copy
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
