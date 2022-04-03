import React, { useState } from "react";

import { gql, useQuery } from "@apollo/client";

import withStyles from "@mui/styles/withStyles";
import { useHistory } from "react-router-dom";

import Heatmap from "./Heatmap/Heatmap.js";
import Chip from "./ChipHeatmap/Chip.js";
import GCBias from "./GCBias/GCBias.js";
import Scatterplot from "./Scatterplot/Scatterplot.js";
import Violin from "./Violin/Violin.js";

import ExportPopup from "../Misc/ExportPopup.js";
import SharePopup from "../Misc/SharePopup.js";

import SettingsPanel from "./SettingsPanel.js";

import LoadingCircle from "./CommonModules/LoadingCircle.js";

import { Paper, Grid, Typography } from "@mui/material";
import { useStatisticsState } from "./DashboardState/statsState";
const HEATMAP_ORDER = gql`
  query heatmapOrder(
    $analysis: String!
    $quality: String!
    $params: [InputParams]
  ) {
    heatmapOrder(analysis: $analysis, quality: $quality, params: $params) {
      order
      cellID
    }
    categoriesStats(analysis: $analysis) {
      category
      types
    }
    chipHeatmapOptions {
      type
      label
    }
    violinAxisOptions {
      xAxis {
        type
        label
      }
      yAxis {
        type
        label
      }
    }
    analysisMetadata(analysis: $analysis) {
      metadata {
        value
        type
      }
    }
    numericalDataFilters(
      analysis: $analysis
      quality: $quality
      params: $params
    ) {
      numericalDataFilters {
        localMax
        min
        localMin
        max
        name
        label
      }
      heatmapOrderFromDataFilters {
        order
      }
    }
  }
`;
const styles = theme => ({
  root: {
    flexGrow: 1,
    height: "100%"
  },
  content: {
    height: "100%",
    minWidth: 1600,

    overflowX: "scroll"
  },
  heatmapContent: {
    padding: 15,
    height: 975,
    width: 1050
  },
  violinContent: {
    padding: 15,
    height: 375,
    width: 800
  },
  gcBias: {
    width: 850,
    height: 625
  },
  scatterplot: {
    width: 650,
    height: 525
  },
  chip: {
    width: 900
  },
  noCells: {
    margin: "auto"
  },
  noCellPaper: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  paperContainer: {
    margin: 15
  },
  settings: {
    width: 400
  }
});
const getQueryParams = (isContaminated, expCondition, numericalDataFilters) => {
  var params = isContaminated
    ? [{ param: "is_contaminated", value: "false" }]
    : [];

  params = expCondition
    ? [...params, { param: "experimental_condition", value: expCondition }]
    : [...params];

  if (numericalDataFilters) {
    params = [...params, ...numericalDataFilters];
  }
  return params;
};

const QCDashboard = ({ analysis, classes }) => {
  const [
    {
      selectedCells,
      quality,
      isContaminated,
      numericalDataFilters,
      expCondition,
      axisChange,
      subsetSelection
    },
    dispatch
  ] = useStatisticsState();
  let history = useHistory();
  const [openExportPopup, setOpenExportPopup] = useState(false);
  const [openSharePopup, setOpenSharePopup] = useState(false);

  if (history.location.pathname !== "/dashboards/" + analysis) {
    //  history.replace("/dashboards/" + analysis);
  }
  const params = getQueryParams(
    isContaminated,
    expCondition,
    numericalDataFilters
  );
  const { loading, data } = useQuery(HEATMAP_ORDER, {
    variables: {
      analysis: analysis,
      quality: quality,
      params: [...params]
    }
  });

  if (!loading && data) {
    if (data.heatmapOrder) {
      var heatmapOrder;
      if (axisChange["datafilter"]) {
        const selection = data.numericalDataFilters.heatmapOrderFromDataFilters.map(
          order => order.order
        );
        heatmapOrder = subsetSelection.length > 0 ? subsetSelection : selection;
        if (selection.length !== selectedCells.length) {
          dispatch({
            type: "BRUSH",
            value: selection,
            dispatchedFrom: "dataFilter"
          });
        }
      } else {
        heatmapOrder =
          selectedCells.length > 0
            ? selectedCells
            : data.heatmapOrder.map(order => order.order);
      }

      return (
        <div className={classes.root}>
          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            key="QCContainer"
            className={classes.content}
          >
            <Grid
              key={"settingsPanelGrid"}
              className={classes.settings}
              item
              xs={3}
            >
              <SettingsPanel
                key={"settingsPanel"}
                metaData={data.analysisMetadata}
                numericalDataFilters={
                  data.numericalDataFilters.numericalDataFilters
                }
                cellIDs={data.heatmapOrder}
                cellCount={data.heatmapOrder.length}
                chipHeatmapOptions={data.chipHeatmapOptions}
                violinOptions={data.violinAxisOptions}
                categoryStats={data.categoriesStats}
                analysis={analysis}
                setOpenSharePopup={() => setOpenSharePopup(!openSharePopup)}
                setOpenExportPopup={() => setOpenExportPopup(!openExportPopup)}
              />
            </Grid>
            {openExportPopup && (
              <ExportPopup
                setOpenExportPopup={setOpenExportPopup}
                openExportPopup={openExportPopup}
              />
            )}
            {openSharePopup && (
              <SharePopup
                params={params}
                analysis={analysis}
                setOpenSharePopup={setOpenSharePopup}
                openSharePopup={openSharePopup}
              />
            )}
            {heatmapOrder && heatmapOrder.length === 0 ? (
              <Grid item className={classes.plots} xs={9} key={"plotPanelGrid"}>
                <Paper
                  className={[
                    classes.scatterplot,
                    classes.paperContainer,
                    classes.noCellPaper
                  ].join(" ")}
                >
                  <Typography variant="h4" className={classes.noCells}>
                    NO CELLS SELECTED
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              <Grid item className={classes.plots} xs={9} key={"plotPanelGrid"}>
                <Paper
                  key={"heatmapPaper"}
                  className={[
                    classes.heatmapContent,
                    classes.paperContainer
                  ].join(" ")}
                >
                  <Heatmap
                    key={"heatmapPlot"}
                    analysis={analysis}
                    allHeatmapOrder={heatmapOrder}
                    categoryStats={data.categoriesStats}
                  />
                </Paper>
                <Paper
                  key={"chipPaper"}
                  className={[classes.chip, classes.paperContainer].join(" ")}
                >
                  <Chip key={"chipPlot"} analysis={analysis} />
                </Paper>
                <Paper
                  key={"violinPaper"}
                  className={[
                    classes.violinContent,
                    classes.paperContainer
                  ].join(" ")}
                >
                  <Violin
                    key={"violinPlot"}
                    analysis={analysis}
                    allHeatmapOrder={heatmapOrder}
                    categoryStats={data.categoriesStats}
                  />
                </Paper>
                <Paper
                  key={"gcBiasPaper"}
                  className={[classes.gcBias, classes.paperContainer].join(" ")}
                >
                  <GCBias
                    key={"gcBiasPlot"}
                    analysis={analysis}
                    heatmapOrder={heatmapOrder}
                  />
                </Paper>
                <Paper
                  key={"scatterPaper"}
                  className={[classes.scatterplot, classes.paperContainer].join(
                    " "
                  )}
                >
                  <Scatterplot key={"scatterplot"} analysis={analysis} />
                </Paper>
              </Grid>
            )}
          </Grid>
        </div>
      );
    } else {
      history.push("/dashboards");
      return null;
    }
  } else {
    return (
      <div className={classes.root}>
        <Grid
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-start"
          key="QCContainer"
          className={classes.content}
        >
          <Grid
            key={"settingsPanelGrid"}
            className={classes.settings}
            item
            xs={3}
          >
            <SettingsPanel
              key={"settingsPanel"}
              metaData={null}
              cellCount={null}
              categoryStats={[]}
              analysis={null}
              scatterplotOptions={[]}
              violionOptions={[]}
            />
          </Grid>
          <Grid item className={classes.plots} xs={9} key={"plotPanelGrid"}>
            <Paper
              key={"heatmapPaper"}
              className={[classes.heatmapContent, classes.paperContainer].join(
                " "
              )}
            >
              <LoadingCircle />
            </Paper>
            <Paper
              key={"chipPaper"}
              className={[classes.chip, classes.paperContainer].join(" ")}
            >
              <LoadingCircle />
            </Paper>
            <Paper
              key={"violinPaper"}
              className={[classes.violinContent, classes.paperContainer].join(
                " "
              )}
            >
              <LoadingCircle />
            </Paper>
            <Paper
              key={"gcBiasPaper"}
              className={[classes.gcBias, classes.paperContainer].join(" ")}
            >
              <LoadingCircle />
            </Paper>
            <Paper
              key={"scatterPaper"}
              className={[classes.scatterplot, classes.paperContainer].join(
                " "
              )}
            >
              <LoadingCircle />
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
};

export default withStyles(styles)(QCDashboard);
