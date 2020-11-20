import React, { useState, useEffect } from "react";
import {
  AccordionActions,
  Button,
  Divider,
  Paper,
  Typography,
  Grid,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary
} from "@material-ui/core";

import { ApolloConsumer } from "react-apollo";
import ChipHeatmapSettings from "./Settings/ChipHeatmapSettings.js";
import ScatterplotSettings from "./Settings/ScatterplotSettings.js";
import LoadingCircle from "./CommonModules/LoadingCircle.js";
import ViolinSettings from "./Settings/ViolinSettings.js";
import GCBiasSettings from "./Settings/GCBiasSettings.js";
import DataFilters from "./Settings/DataFilters.js";

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
    background: "none",
    marginBottom: 10
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
    width: "100%",
    margin: theme.spacing(0, 0, 2, 0)
  },
  gridSlider: { width: "100%", marginBottom: 10 },
  settings: {
    padding: 10,
    width: 300,
    background: "none",
    height: "100%",
    position: "fixed",
    overflowY: "scroll"
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
const defaultCleared = {
  dataFilters: false,
  scatterplot: false,
  chip: false,
  GCBias: false
};
const SettingsPanel = ({
  analysis,
  classes,
  categoryStats,
  cellCount,
  chipHeatmapOptions,
  violinOptions,
  numericalDataFilters
}) => {
  const [{ selectedAnalysis }] = useDashboardState();
  const [
    {
      selectedCells,
      scatterplotAxis,
      chipHeatmapAxis,
      violinAxis,
      experimentalCondition,
      axisChange,
      subsetSelection
    },
    dispatch
  ] = useStatisticsState();

  const resetFilter = type => {
    update("", type);
  };

  function update(value, type) {
    dispatch({
      type: type,
      value: value
    });
  }
  const isDisabled = selectedCells ? true : false;
  console.log("dis", isDisabled);
  return (
    <Paper className={classes.settings} elevation={0}>
      <MetaData
        classes={classes}
        count={
          cellCount === null
            ? "Loading"
            : axisChange["datafilter"]
            ? selectedCells.length
            : cellCount
        }
        analysis={selectedAnalysis}
      />
      {((selectedCells.length !== 0 && axisChange["datafilter"] == false) ||
        subsetSelection.length !== 0) && (
        <SelectedCellsPanel
          classes={classes}
          selectedCellsCount={
            subsetSelection.length === 0
              ? selectedCells.length
              : subsetSelection.length
          }
          clearCellSelection={() =>
            dispatch({
              type: "BRUSH",
              value: [],
              subsetSelection: [],
              dispatchedFrom: "clear"
            })
          }
        />
      )}
      <AccordianWrapper
        classes={classes}
        name="dataFilter"
        key={"datafiltersAccordianWrapper"}
        title="Data Filters"
        isResetPossible={axisChange["datafilter"]}
        resetFilter={() => {
          resetFilter("DATA_FILTER_OFF");
        }}
      >
        <ApolloConsumer>
          {client =>
            categoryStats.length > 0 ? (
              <DataFilters
                key={"dataFilterWrapper"}
                client={client}
                numericalDataFilters={numericalDataFilters}
                experimentalConditions={categoryStats.filter(
                  category =>
                    category["category"] === experimentalCondition["type"]
                )}
                analysis={selectedAnalysis}
                classes={classes}
                update={(value, type) => {
                  update(value, type);
                }}
                isDisabled={isDisabled}
              />
            ) : null
          }
        </ApolloConsumer>
      </AccordianWrapper>
      <AccordianWrapper
        classes={classes}
        key={"scatterplotAccordianWrapper"}
        name="scatterplot"
        title="Scatterplot"
        isResetPossible={axisChange["scatterplot"]}
        resetFilter={() => {
          resetFilter("SCATTERPLOT_AXIS_RESET");
        }}
      >
        <ScatterplotSettings
          classes={classes}
          analysis={analysis}
          currentlySelectedAxis={scatterplotAxis}
          setAxisOption={value => update(value, "SCATTERPLOT_AXIS_UPDATE")}
          isDisabled={isDisabled}
        />
      </AccordianWrapper>
      <AccordianWrapper
        classes={classes}
        key={"chipAccordianWrapper"}
        name="chip"
        title="Chip"
        isResetPossible={axisChange["chip"]}
        resetFilter={() => {
          resetFilter("CHIP_AXIS_RESET");
        }}
      >
        <ChipHeatmapSettings
          classes={classes}
          axisOptions={chipHeatmapOptions}
          currentlySelectedAxis={chipHeatmapAxis}
          setAxisOption={value => update(value, "CHIPHEATMAP_AXIS_UPDATE")}
          isDisabled={isDisabled}
        />
      </AccordianWrapper>
      <AccordianWrapper
        key={"violinAccordianWrapper"}
        classes={classes}
        name="violin"
        title="Violin"
        isResetPossible={axisChange["violin"]}
        resetFilter={() => {
          resetFilter("VIOLIN_AXIS_RESET");
        }}
      >
        <ViolinSettings
          classes={classes}
          axisOptions={violinOptions}
          currentlySelectedAxis={violinAxis}
          setAxisOption={value => update(value, "VIOLIN_AXIS_UPDATE")}
          isDisabled={isDisabled}
        />
      </AccordianWrapper>
      <AccordianWrapper
        key={"gcbiasAccordianWrapper"}
        classes={classes}
        name="GCBias"
        title="GC Bias"
        isResetPossible={false}
        resetFilter={() => {
          resetFilter("GCBIAS_AXIS_RESET");
        }}
      >
        <GCBiasSettings
          classes={classes}
          setAxisOption={value => update(value, "GCBIAS_IS_GROUPED")}
          isDisabled={isDisabled}
        />
      </AccordianWrapper>
    </Paper>
  );
};
const AccordianWrapper = ({
  children,
  name,
  title,
  classes,
  resetFilter,
  isResetPossible
}) => (
  <ExpansionPanel className={classes.expansionPanelRoot}>
    <ExpansionPanelSummary
      className={classes.expansionPanelSummary}
      expandIcon={<ExpandMoreIcon />}
      aria-controls={"panel-" + name + "-content"}
      id={"panel-" + name}
    >
      <Typography variant="body1">{title}</Typography>
      {isResetPossible && (
        <AccordionActions style={{ width: "100%" }}>
          <Button size="small" onClick={resetFilter}>
            {name === "dataFilter" ? "Clear All" : "Reset"}
          </Button>
        </AccordionActions>
      )}
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
