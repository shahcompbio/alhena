import React, { useState, useEffect } from "react";
import {
  Paper,
  Button,
  Typography,
  Slider,
  Grid,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary
} from "@material-ui/core";

import ChipHeatmapSettings from "./Settings/ChipHeatmapSettings.js";
import ScatterplotSettings from "./Settings/ScatterplotSettings.js";
import LoadingCircle from "./CommonModules/LoadingCircle.js";
import ViolinSettings from "./Settings/ViolinSettings.js";
import GCBiasSettings from "./Settings/GCBiasSettings.js";

import BackspaceTwoToneIcon from "@material-ui/icons/BackspaceTwoTone";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { withStyles } from "@material-ui/core/styles";
import { useDashboardState } from "../Search/ProjectView/ProjectState/dashboardState";

import { useStatisticsState } from "./DashboardState/statsState";
import { heatmapConfig } from "./Heatmap/config";

const styles = theme => ({
  fieldComponent: {
    margin: theme.spacing(0, 3, 8, 3)
  },
  fieldTitle: {
    paddingBottom: 30
  },
  expansionPanelRoot: {
    boxShadow:
      "0px 2px 1px -1px rgba(255, 255, 255, 0.85), 0px -1px 0px 0px rgb(255, 255, 255), 0px 1px 3px 0px rgba(204, 196, 196, 0)"
  },
  expansionPanelSummary: {
    padding: "0 14px 0 14px"
  },
  expanded: { margin: "0px !important" },
  panel: {
    padding: theme.spacing(3, 3, 3, 3),
    margin: theme.spacing(0, 0, 0, 0),
    width: "100%",
    background: "white"
  },
  selectedCells: {
    backgroundColor: "#e6eaec",
    padding: theme.spacing(3, 3, 3, 3),
    margin: theme.spacing(2, 0, 2, 0)
  },
  markLabel: {
    color: "rgba(225, 225, 225, 0.54)"
  },
  metaDataPanel: {
    background: "none"
  },
  buttonWrapper: {
    textAlign: "center"
  },
  button: {
    margin: theme.spacing(3)
  },
  fieldComponent: {
    margin: theme.spacing(2, 0, 0, 0)
  },
  formControl: {
    margin: theme.spacing(0, 0, 2, 0)
  },
  settings: {
    padding: 10,
    width: 300,
    background: "none",
    height: "100%",
    position: "fixed"
  },
  sliderPanel: {
    padding: 20
  },
  slider: {
    marginTop: 10
  },
  titlePadding: {
    paddingBottom: 15,
    paddingTop: 15
  },
  whiteText: {
    color: "white"
  },
  panelDetails: {
    padding: "0px 24px 24px"
  }
});
const SettingsPanel = ({
  classes,
  categoryStats,
  cellCount,
  scatterplotOptions,
  chipHeatmapOptions,
  violinOptions
}) => {
  const [{ selectedAnalysis }] = useDashboardState();

  const [
    { quality, selectedCells, scatterplotAxis, chipHeatmapAxis, violinAxis },
    dispatch
  ] = useStatisticsState();

  const [qualityMenuValue, setQualityMenuValue] = useState(quality);

  function update(value, type) {
    dispatch({
      type: type,
      value: value
    });
  }

  return (
    <Paper className={classes.settings} elevation={0}>
      <MetaData
        classes={classes}
        count={cellCount}
        analysis={selectedAnalysis}
      />
      {selectedCells.length !== 0 && (
        <SelectedCellsPanel
          classes={classes}
          selectedCellsCount={selectedCells.length}
          clearCellSelection={() => update([], "BRUSH")}
        />
      )}
      <AccordianWrapper
        classes={classes}
        name="qualityFilter"
        title="Quality Filter"
      >
        <Slider
          className={classes.slider}
          color={"secondary"}
          defaultValue={qualityMenuValue}
          onChange={(event, newValue) => setQualityMenuValue(newValue)}
          onChangeCommitted={() =>
            update(
              {
                quality: qualityMenuValue.toString()
              },
              "QUALITY_UPDATE"
            )
          }
          getAriaValueText={value => value}
          aria-labelledby="discrete-slider"
          step={0.05}
          marks={heatmapConfig.qualitySliderMarks}
          valueLabelDisplay="on"
          min={0}
          max={1.0}
        />
      </AccordianWrapper>
      <AccordianWrapper
        classes={classes}
        name="scatterplot"
        title="Scatterplot"
      >
        <ScatterplotSettings
          classes={classes}
          axisOptions={scatterplotOptions}
          currentlySelectedAxis={scatterplotAxis}
          setAxisOption={value => update(value, "SCATTERPLOT_AXIS_UPDATE")}
        />
      </AccordianWrapper>
      <AccordianWrapper classes={classes} name="chip" title="Chip">
        <ChipHeatmapSettings
          classes={classes}
          axisOptions={chipHeatmapOptions}
          currentlySelectedAxis={chipHeatmapAxis}
          setAxisOption={value => update(value, "CHIPHEATMAP_AXIS_UPDATE")}
        />
      </AccordianWrapper>
      <AccordianWrapper classes={classes} name="violin" title="Violin">
        <ViolinSettings
          classes={classes}
          axisOptions={violinOptions}
          currentlySelectedAxis={violinAxis}
          setAxisOption={value => update(value, "VIOLIN_AXIS_UPDATE")}
        />
      </AccordianWrapper>
      <AccordianWrapper classes={classes} name="GCBias" title="GC Bias">
        <GCBiasSettings
          classes={classes}
          setAxisOption={value => update(value, "GCBIAS_IS_GROUPED")}
        />
      </AccordianWrapper>
    </Paper>
  );
};
const AccordianWrapper = ({ children, name, title, classes }) => (
  <ExpansionPanel className={classes.expansionPanelRoot}>
    <ExpansionPanelSummary
      className={classes.expansionPanelSummary}
      expandIcon={<ExpandMoreIcon />}
      aria-controls={"panel-" + name + "-content"}
      id={"panel-" + name}
    >
      <Typography variant="body1">{title}</Typography>
    </ExpansionPanelSummary>
    <ExpansionPanelDetails
      id={"panel-" + name + "-content"}
      className={classes.panelDetails}
    >
      {children}
    </ExpansionPanelDetails>
  </ExpansionPanel>
);

const MetaData = ({ classes, count, analysis, library }) => (
  <Paper
    elevation={0}
    className={[classes.panel, classes.metaDataPanel].join(" ")}
    variant="outlined"
  >
    <Grid
      container
      direction="column"
      justify="space-between"
      alignItems="flex-start"
    >
      <Typography
        variant="h5"
        fontWeight="fontWeightRegular"
        style={{ color: "#a2a2a2" }}
      >
        Analysis: <b>{analysis}</b>
      </Typography>
      {count === null ? (
        <LoadingCircle />
      ) : (
        <Typography
          variant="h5"
          fontWeight="fontWeightRegular"
          style={{ color: "#a2a2a2" }}
        >
          {count} cells
        </Typography>
      )}
    </Grid>
  </Paper>
);

const SelectedCellsPanel = ({
  classes,
  selectedCellsCount,
  clearCellSelection
}) => (
  <Paper
    className={[classes.panel, classes.selectedCells]}
    variant="outlined"
    elevation={0}
  >
    <Grid container direction="row" justify="space-between" alignItems="center">
      <Typography variant="h6">{selectedCellsCount} cells selected</Typography>
      <Button onClick={() => clearCellSelection()}>
        <BackspaceTwoToneIcon />
      </Button>
    </Grid>
  </Paper>
);

export default withStyles(styles)(SettingsPanel);
