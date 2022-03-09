import React, { useState } from "react";
import * as d3 from "d3";

import { Dialog, Grid } from "@mui/material";

import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import ToggleButton from '@mui/material/ToggleButton';

import CheckIcon from "@mui/icons-material/Check";

import withStyles from '@mui/styles/withStyles';
import makeStyles from '@mui/styles/makeStyles';
import { heatmapConfig } from "../Dashboard/Heatmap/config.js";

import { Typography } from "@mui/material";
import { jsPDF } from "jspdf";
import canvg from "canvg";

const pageWidthPixel = 595;
const styles = theme => ({
  dialogContent: {
    width: 350,
    height: 375,
    textAlign: "center"
  },
  exportButton: {
    right: 100,
    position: "absolute",
    backgroundColor: "#e5f3f3",
    color: "#2b5d65"
  },
  closeButton: {
    right: 20,
    position: "absolute",
    color: "#350800",
    backgroundColor: "#efcfc5"
  }
});
const ExportPopup = ({
  setOpenExportPopup,
  openExportPopup,
  client,
  classes
}) => {
  const [selected, setSelected] = useState([]);

  const assembleHeatmapExport = doc => {
    const scaleWidth = (heatmapConfig.width + 50) / pageWidthPixel;
    const heatmapCanvas = d3.select("#heatmapCanvas").node();
    const chromAxisCanvas = d3.select("#chromAxis").node();

    const profileCanvasPoints = d3.select("#profileCanvas").node();
    const backgroundProfile = d3.select("#profileSvg").node();
    const genomeAxisCanvas = d3.select("#genomeAxis").node();

    const profileCanvasBackground = document.createElement("canvas");
    let profileContext = profileCanvasBackground.getContext("2d");
    profileCanvasBackground.width = heatmapConfig.width;
    profileCanvasBackground.height = 300;
    const profileInner = backgroundProfile.outerHTML;

    const profile = canvg.fromString(profileContext, profileInner);
    profile.start();

    const imgHeatmap = heatmapCanvas.toDataURL("image/png");
    const imgChromAxis = chromAxisCanvas.toDataURL("image/png");
    const imgProfile = profileCanvasPoints.toDataURL("image/png");
    const imgProfileBackground = profileCanvasBackground.toDataURL("image/png");
    const imgGenomeAxis = genomeAxisCanvas.toDataURL("image/png");
    doc.addImage(
      imgHeatmap,
      "PNG",
      27,
      10,
      heatmapConfig.width / scaleWidth,
      562
    );
    doc.addImage(imgChromAxis, "PNG", 10, 566, heatmapConfig.width / 1.44, 8);
    doc.addImage(
      imgProfileBackground,
      "PNG",
      27,
      576,
      heatmapConfig.width / scaleWidth,
      200
    );
    doc.addImage(
      imgProfile,
      "PNG",
      27,
      578,
      heatmapConfig.width / scaleWidth,
      200
    );
    doc.addImage(imgGenomeAxis, "PNG", 10, 574, 13, 200);
    const genomeYScale = d3
      .scaleLinear()
      .domain([-0.5, 11])
      .range([200, 0]);

    genomeYScale.ticks(11).forEach(tick => {
      doc.setLineDash([1, 1], 10);
      doc.line(
        25,
        genomeYScale(tick) + 580,
        heatmapConfig.width / scaleWidth + 10,
        genomeYScale(tick) + 580
      );
    });
    doc.setFontSize(9);
    doc.text(20, 800, d3.select("#heatmapCellID").node().textContent);
    return doc;
  };
  const exportSelected = selected => {
    var doc = new jsPDF("p", "pt", "a4");
    doc = assembleHeatmapExport(doc);
    doc.save("test.pdf");
  };

  return (
    <Dialog
      open={openExportPopup}
      onClose={() => setOpenExportPopup()}
      aria-labelledby="form-dialog-title"
    >
      <DialogContent className={classes.dialogContent}>
        <Grid
          container
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          <Typography variant="body">Plots available to export</Typography>

          <Grid
            container
            direction="column"
            justifyContent="flex-start"
            alignItems="flex-start"
          >
            <Grid item>
              <PlotItem
                name="Heatmap"
                disabled={false}
                selected={selected}
                setSelected={choices => setSelected([...choices])}
              />
            </Grid>
            <Grid item>
              <PlotItem
                name="Scatterplot"
                disabled={true}
                selected={selected}
                setSelected={choices => setSelected([...choices])}
              />
            </Grid>
            <Grid item>
              <PlotItem
                name="GC Bias"
                disabled={true}
                selected={selected}
                setSelected={choices => setSelected([...choices])}
              />
            </Grid>
            <Grid item>
              <PlotItem
                name="ChipHeatmap"
                disabled={true}
                selected={selected}
                setSelected={choices => setSelected([...choices])}
              />
            </Grid>
            <Grid item>
              <PlotItem
                name="Violin"
                disabled={true}
                selected={selected}
                setSelected={choices => setSelected([...choices])}
              />
            </Grid>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              className={classes.exportButton}
              onClick={() => {
                exportSelected(selected);
                setOpenExportPopup();
              }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              color="primary"
              className={classes.closeButton}
              onClick={() => setOpenExportPopup()}
            >
              Close
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
const useStyles = makeStyles(theme => ({
  selected: {
    backgroundColor: "#a1c1c0 !important"
  },
  plotNameWrapper: { marginTop: 15 },
  plotName: { margin: 10 },
  disabledPlotName: { margin: 10, color: "grey" },
  gridItem: { marginBottom: 10 }
}));
const PlotItem = ({ name, setSelected, selected, disabled }) => {
  const classes = useStyles();

  return (
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="flex-start"
    >
      <Grid item className={classes.gridItem}>
        <ToggleButton
          disabled={disabled}
          classes={{ selected: classes.selected }}
          value="check"
          selected={selected.indexOf(name) !== -1}
          onChange={() => {
            selected.indexOf(name) === -1
              ? setSelected([...selected, name])
              : setSelected([]);
          }}
        >
          <CheckIcon />
        </ToggleButton>
      </Grid>
      <Grid item className={classes.plotNameWrapper}>
        <Typography
          variant="h7"
          className={disabled ? classes.disabledPlotName : classes.plotName}
        >
          {name}
        </Typography>
      </Grid>
    </Grid>
  );
};
export default withStyles(styles)(ExportPopup);
