import React, { useState, useEffect } from "react";
import {
  AccordionActions,
  Button,
  Divider,
  Paper,
  Typography,
  Grid,
  Accordion,
  AccordionDetails,
  AccordionSummary
} from "@material-ui/core";

import { ApolloConsumer } from "react-apollo";
import ChipHeatmapSettings from "./Settings/ChipHeatmapSettings.js";
import ScatterplotSettings from "./Settings/ScatterplotSettings.js";
import LoadingCircle from "./CommonModules/LoadingCircle.js";
import ViolinSettings from "./Settings/ViolinSettings.js";
import GCBiasSettings from "./Settings/GCBiasSettings.js";
import DataFilters from "./Settings/DataFilters.js";

import ShareIcon from "@material-ui/icons/Share";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
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
  AccordionRoot: {
    boxShadow:
      "0px 2px 1px -1px rgba(255, 255, 255, 0.85), 0px -1px 0px 0px rgb(255, 255, 255), 0px 1px 3px 0px rgba(204, 196, 196, 0)"
  },
  AccordionSummary: {
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
  exportButton: {
    width: 130,
    marginBottom: 10,
    marginRight: 12
  },
  shareButton: {
    width: 135,
    marginBottom: 10
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
  numericalDataFilters,
  metaData,
  setOpenExportPopup,
  setOpenSharePopup
}) => {
  const [{ selectedAnalysis, selectedDashboard }] = useDashboardState();
  const [
    {
      selectedCells,
      chipHeatmapAxis,
      experimentalCondition,
      axisChange,
      subsetSelection,
      selectedCellsDispatchFrom
    },
    dispatch
  ] = useStatisticsState();

  const meta = metaData ? metaData : {};

  const [openAccordian, setIsOpenAccordian] = useState({
    dataFilter: false,
    scatterplot: false,
    chip: false,
    GCBias: false,
    violin: false
  });

  const resetFilter = type => {
    update("", type);
  };

  function update(value, type) {
    dispatch({
      type: type,
      value: value
    });
  }
  const isDisabled =
    selectedCells.length > 0 && selectedCellsDispatchFrom !== "dataFilter"
      ? true
      : false;

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
        metaData={meta}
        project={selectedDashboard}
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
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        <Button
          variant="outlined"
          color="default"
          className={classes.exportButton}
          onClick={() => setOpenExportPopup()}
          startIcon={<CloudDownloadIcon />}
        >
          Export
        </Button>
        <Button
          variant="outlined"
          color="default"
          className={classes.shareButton}
          onClick={() => setOpenSharePopup()}
          startIcon={<ShareIcon />}
        >
          Share
        </Button>
      </Grid>
      <AccordianWrapper
        classes={classes}
        name="dataFilter"
        setIsOpenAccordian={setIsOpenAccordian}
        openAccordian={openAccordian}
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
        setIsOpenAccordian={setIsOpenAccordian}
        openAccordian={openAccordian}
        isResetPossible={axisChange["scatterplot"]}
        resetFilter={() => {
          resetFilter("SCATTERPLOT_AXIS_RESET");
        }}
      >
        <ScatterplotSettings
          classes={classes}
          analysis={analysis}
          setAxisOption={value => update(value, "SCATTERPLOT_AXIS_UPDATE")}
          isDisabled={isDisabled}
        />
      </AccordianWrapper>
      <AccordianWrapper
        key={"violinAccordianWrapper"}
        classes={classes}
        name="violin"
        title="Violin"
        setIsOpenAccordian={setIsOpenAccordian}
        openAccordian={openAccordian}
        isResetPossible={axisChange["violin"]}
        resetFilter={() => {
          resetFilter("VIOLIN_AXIS_RESET");
        }}
      >
        <ViolinSettings
          classes={classes}
          axisOptions={violinOptions}
          setAxisOption={value => update(value, "VIOLIN_AXIS_UPDATE")}
          isDisabled={isDisabled}
        />
      </AccordianWrapper>
      {selectedDashboard.toLowerCase() === "fitness" && (
        <AccordianWrapper
          key={"gcbiasAccordianWrapper"}
          classes={classes}
          name="GCBias"
          title="GC Bias"
          setIsOpenAccordian={setIsOpenAccordian}
          openAccordian={openAccordian}
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
      )}
    </Paper>
  );
};
const AccordianWrapper = ({
  children,
  name,
  title,
  classes,
  resetFilter,
  isResetPossible,
  setIsOpenAccordian,
  openAccordian
}) => (
  <Accordion
    className={classes.AccordionRoot}
    expanded={openAccordian[name]}
    onChange={() =>
      setIsOpenAccordian({
        ...openAccordian,
        [name]: !openAccordian[name]
      })
    }
  >
    <AccordionSummary
      className={classes.AccordionSummary}
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
    </AccordionSummary>
    <AccordionDetails
      id={"panel-" + name + "-content"}
      className={classes.panelDetails}
    >
      {children}
    </AccordionDetails>
  </Accordion>
);

const MetaData = ({ classes, count, analysis, library, project, metaData }) => (
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
        <span
          style={{
            width: 225,
            display: "inline-block",
            fontWeight: "bold",
            wordBreak: "break-all"
          }}
        >
          Analysis: {analysis.toUpperCase()}
        </span>
      </Typography>
      {project && (
        <Typography
          variant="h7"
          fontWeight="fontWeightRegular"
          style={{ color: "#a2a2a2" }}
        >
          Project: {project}
        </Typography>
      )}
      {metaData && (
        <Typography
          variant="h7"
          fontWeight="fontWeightRegular"
          style={{ color: "#a2a2a2" }}
        >
          Library: {metaData["library_id"]}
        </Typography>
      )}
      {metaData && (
        <Typography
          variant="h7"
          fontWeight="fontWeightRegular"
          style={{ color: "#a2a2a2" }}
        >
          Sample: {metaData["sample_id"]}
        </Typography>
      )}
      {count === null ? (
        <LoadingCircle />
      ) : (
        <Typography
          variant="h7"
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
