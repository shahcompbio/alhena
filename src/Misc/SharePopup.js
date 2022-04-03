import React, { useState, useEffect } from "react";
import * as d3 from "d3";

import { Dialog, Grid } from "@mui/material";

import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import FilledInput from "@mui/material/FilledInput";

import { gql, useLazyQuery } from "@apollo/client";

import { useStatisticsState } from "../Dashboard/DashboardState/statsState";

const SET_CACHE_SETTING = gql`
  query setCacheCopyUrl($type: String!, $value: String!) {
    setCacheCopyUrl(type: $type, value: $value) {
      link
    }
  }
`;
const SharePopup = ({ setOpenSharePopup, openSharePopup, analysis }) => {
  const [state] = useStatisticsState();
  const [url, setUrl] = useState(
    window.location.origin + "/alhena/dashboards/" + analysis
  );

  const [setCopyUrl, { data }] = useLazyQuery(SET_CACHE_SETTING);

  useEffect(() => {
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
      sx={{ margin: "10px" }}
    >
      <DialogContent
        sx={{
          width: "85%",
          margingBottom: "10px",
          textAlign: "center"
        }}
      >
        <Grid
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          <FilledInput
            classes={{ input: { paddingTop: 20 } }}
            id="copyUrl"
            value={url}
            fullWidth
            readonly
          />
          <Button
            variant="outlined"
            color="primary"
            sx={{
              marginTop: "7px",
              right: "100px",
              marginRight: "10px",
              position: "absolute",
              backgroundColor: "#5981b7 !important",
              color: "white !important",
              ":hover": {
                backgroundColor: "#2f4461 !important"
              }
            }}
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
            sx={{
              marginLeft: "20px",
              color: "#5981b7 !important",
              border: "1px solid #5981b7 !important",
              marginTop: "7px",
              right: "20px",
              position: "absolute"
            }}
            onClick={() => setOpenSharePopup()}
          >
            Close
          </Button>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default SharePopup;
