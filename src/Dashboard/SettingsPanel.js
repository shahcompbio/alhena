import React, { useState } from "react";
import {
  AccordionActions,
  Button,
  Paper,
  Typography,
  Grid,
  Accordion,
  AccordionDetails,
  AccordionSummary
} from "@mui/material";

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import ClearIcon from "@mui/icons-material/Clear";

import ChipHeatmapSettings from "./Settings/ChipHeatmapSettings.js";
import ScatterplotSettings from "./Settings/ScatterplotSettings.js";
import LoadingCircle from "./CommonModules/LoadingCircle.js";
import ViolinSettings from "./Settings/ViolinSettings.js";
import GCBiasSettings from "./Settings/GCBiasSettings.js";
import DataFilters from "./Settings/DataFilters.js";

import ShareIcon from "@mui/icons-material/Share";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import BackspaceTwoToneIcon from "@mui/icons-material/BackspaceTwoTone";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import withStyles from "@mui/styles/withStyles";
import { makeStyles } from "@mui/styles";

import { useDashboardState } from "../Search/ProjectView/ProjectState/dashboardState";

import { useStatisticsState } from "./DashboardState/statsState";

const styles = makeStyles(theme => ({
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
    padding: theme.spacing(2, 2, 2, 2),
    margin: theme.spacing(0, 0, 0, 0),
    width: "100%",
    background: "white"
  },

  metaDataPanel: {
    background: "white",
    marginBottom: 10
  },
  buttonWrapper: {
    textAlign: "center"
  },
  button: {
    margin: theme.spacing(3)
  },
  exportButton: {
    color: "#31506b",
    width: 180,
    color: "#31506b !important",
    border: "1px solid #31506b !important",
    //marginBottom: "10px !important",
    marginRight: "20px !important",
    backgroundColor: "white !important"
  },
  shareButton: {
    color: "#31506b !important",
    border: "1px solid #31506b !important",
    width: 180,
    //marginBottom: 10,
    marginLeft: 6,
    backgroundColor: "white !important"
  },

  settings: {
    padding: 10,
    paddingRight: 0,
    width: 400,
    background: "#F5F5F5 !important",
    height: "100%",
    position: "sticky"
    //overflowY: "scroll"
  },
  sliderPanel: {
    padding: 20
  },
  slider: {
    color: "#e2ad13 !important"
    //marginTop: 10
  },
  search: {
    fontSize: "14px",
    marginTop: 0,
    '&&[class*="MuiFormControl-marginNormal"]': {
      marginTop: 0
    }
  },
  titlePadding: {
    paddingBottom: 15,
    paddingTop: 15
  },
  whiteText: {
    color: "white"
  },
  panelDetails: {
    padding: "0px 54px 24px !important"
  }
}));

const SettingsPanel = ({
  analysis,
  categoryStats,
  cellCount,
  chipHeatmapOptions,
  violinOptions,
  numericalDataFilters,
  metaData,
  setOpenExportPopup,
  setOpenSharePopup,
  cellIDs
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
  const classes = styles();

  const meta = metaData ? metaData["metadata"] : [];

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
    <Paper
      key={"settingsPanelPaper"}
      sx={{
        padding: "10px",
        paddingRight: "0px",
        width: "400px",
        background: "#F5F5F5 !important",
        height: "100%",
        position: "sticky"
      }}
      elevation={0}
    >
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
      {((selectedCells.length !== 0 && axisChange["datafilter"] === false) ||
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
        justifyContent="flex-start"
        alignItems="space-between"
        sx={{ marginBottom: "10px !important" }}
      >
        <Button
          variant="outlined"
          sx={{
            width: 180,
            color: "#31506b !important",
            border: "1px solid #31506b !important",
            marginRight: "20px !important",
            backgroundColor: "white !important",
            ":hover": {
              color: "white !important",
              backgroundColor: "#31506b !important"
            }
          }}
          onClick={() => setOpenExportPopup()}
          startIcon={<CloudDownloadIcon />}
        >
          Export
        </Button>
        <Button
          variant="outlined"
          sx={{
            color: "#31506b !important",
            border: "1px solid #31506b !important",
            width: 180,
            marginLeft: "6px",
            backgroundColor: "white !important",
            ":hover": {
              color: "white !important",
              backgroundColor: "#31506b !important"
            }
          }}
          onClick={() => setOpenSharePopup()}
          startIcon={<ShareIcon />}
        >
          Share
        </Button>
      </Grid>
      <Autocomplete
        id="cellid-searchInput"
        freeSolo
        options={
          cellIDs
            ? [...cellIDs].sort((a, b) =>
                a["cellID"].localeCompare(b["cellID"], "en", { numeric: true })
              )
            : []
        }
        onChange={(event, newValue) => {
          dispatch({
            type: "BRUSH",
            value: newValue ? [newValue.order] : [],
            dispatchedFrom: newValue ? "search" : "clear"
          });
        }}
        getOptionLabel={option => option.cellID}
        style={{ marginTop: -16 }}
        className={classes.search}
        renderInput={params => (
          <TextField
            {...params}
            label="Search By Cell ID"
            margin="normal"
            variant="outlined"
          />
        )}
      />
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
        {categoryStats.length > 0 ? (
          <DataFilters
            numericalDataFilters={numericalDataFilters}
            experimentalConditions={categoryStats.filter(
              category => category["category"] === experimentalCondition["type"]
            )}
            analysis={selectedAnalysis}
            update={(value, type) => {
              update(value, type);
            }}
            isDisabled={isDisabled}
          />
        ) : (
          <DataFilters
            numericalDataFilters={[]}
            experimentalConditions={[]}
            analysis={""}
            classes={classes}
          />
        )}
      </AccordianWrapper>
      <AccordianWrapper
        classes={classes}
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
          analysis={analysis}
          setAxisOption={value => update(value, "SCATTERPLOT_AXIS_UPDATE")}
          isDisabled={isDisabled}
        />
      </AccordianWrapper>
      <AccordianWrapper
        classes={classes}
        key={"chipAccordianWrapper"}
        name="chip"
        title="Chip"
        setIsOpenAccordian={setIsOpenAccordian}
        openAccordian={openAccordian}
        isResetPossible={axisChange["chip"]}
        resetFilter={() => {
          resetFilter("CHIP_AXIS_RESET");
        }}
      >
        <ChipHeatmapSettings
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
        setIsOpenAccordian={setIsOpenAccordian}
        openAccordian={openAccordian}
        isResetPossible={axisChange["violin"]}
        resetFilter={() => {
          resetFilter("VIOLIN_AXIS_RESET");
        }}
      >
        <ViolinSettings
          axisOptions={violinOptions}
          setAxisOption={value => update(value, "VIOLIN_AXIS_UPDATE")}
          isDisabled={isDisabled}
        />
      </AccordianWrapper>
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
    key={name + "accordian"}
  >
    <AccordionSummary
      key={name + "summary"}
      className={classes.AccordionSummary}
      expandIcon={<ExpandMoreIcon />}
      aria-controls={"panel-" + name + "-content"}
      id={"panel-" + name}
    >
      <Typography variant="body1" key={name + "title"}>
        {title}
      </Typography>
      {isResetPossible && (
        <AccordionActions style={{ width: "100%" }}>
          <Button
            size="small"
            variant="outlined"
            onClick={resetFilter}
            endIcon={<ClearIcon />}
            sx={{
              color: "#31506b",
              border: "1px solid #31506b",
              fontWeight: "bold"
            }}
          >
            {name === "dataFilter" ? "Clear Filter" : "Reset"}
          </Button>
        </AccordionActions>
      )}
    </AccordionSummary>
    <AccordionDetails
      key={name + "details"}
      id={"panel-" + name + "-content"}
      className={classes.panelDetails}
    >
      {children}
    </AccordionDetails>
  </Accordion>
);

const MetaData = ({ metaData, classes, count, analysis, library, project }) => (
  <Paper
    elevation={0}
    className={[classes.panel, classes.metaDataPanel].join(" ")}
    variant="outlined"
  >
    <Grid
      container
      direction="column"
      justifyContent="space-between"
      alignItems="flex-start"
    >
      <Typography
        variant="h6"
        fontWeight="fontWeightRegular"
        style={{
          color: "#a2a2a2"
        }}
      >
        <span
          style={{
            width: 225,
            display: "inline-block",
            fontWeight: "bold",
            fontSize: 20,
            wordBreak: "break-all"
          }}
        >
          Analysis: {analysis}
        </span>
      </Typography>
      {metaData !== null ? (
        metaData.map(meta => (
          <Typography
            key={"typography-" + meta["type"]}
            variant="h6"
            fontWeight="fontWeightRegular"
            style={{ color: "#a2a2a2" }}
          >
            {meta["type"]}: {meta["value"]}
          </Typography>
        ))
      ) : (
        <div />
      )}
      {count === null ? (
        <LoadingCircle />
      ) : (
        <Typography
          variant="h6"
          fontWeight="fontWeightRegular"
          style={{ color: "#a2a2a2" }}
        >
          {count} cells
        </Typography>
      )}
    </Grid>
  </Paper>
);

const SelectedCellsPanel = ({ selectedCellsCount, clearCellSelection }) => (
  <Paper
    sx={{
      p: 2,
      mb: 2,
      width: "100%"
    }}
    variant="outlined"
    elevation={0}
  >
    <Grid
      container
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Typography variant="h6" sx={{ color: "#31506b" }}>
        {selectedCellsCount} cells selected
      </Typography>
      <Button onClick={() => clearCellSelection()}>
        <BackspaceTwoToneIcon />
      </Button>
    </Grid>
  </Paper>
);

export default SettingsPanel;
