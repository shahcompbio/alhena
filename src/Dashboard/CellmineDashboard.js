import React, { useState } from "react";

import gql from "graphql-tag";
import { useQuery } from "react-apollo-hooks";

import { withStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";

import Heatmap from "./Heatmap/Heatmap.js";
import Chip from "./ChipHeatmap/Chip.js";
import GCBias from "./GCBias/GCBias.js";
import Scatterplot from "./Scatterplot/Scatterplot.js";
import Violin from "./Violin/Violin.js";
import MetaDataTable from "./Table/MetaDataTable.js";

import ExportPopup from "../Misc/ExportPopup.js";
import SharePopup from "../Misc/SharePopup.js";

import SettingsPanel from "./SettingsPanel.js";

import LoadingCircle from "./CommonModules/LoadingCircle.js";

import { Paper, Grid } from "@material-ui/core";
import { useStatisticsState } from "./DashboardState/statsState";
const HEATMAP_ORDER = gql`
  query heatmapOrder(
    $analysis: String!
    $quality: String!
    $params: [InputParams]
  ) {
    heatmapOrder(analysis: $analysis, quality: $quality) {
      order
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
      sample_id
      library_id
      jira_id
      dashboard
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
  metadataContent: {
    padding: 15,
    height: 500,
    width: 1050
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

const CellmineDashboard = ({ analysis, classes, client }) => {
  const [
    {
      selectedCells,
      quality,
      popupFacadeIsOpen,
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
            justify="flex-start"
            alignItems="flex-start"
            key="CellmineContainer"
            className={classes.content}
          >
            <Grid
              key={"settingsPanelGridCellmine"}
              className={classes.settings}
              item
              xs={3}
            >
              <SettingsPanel
                key={"settingsPanelCellmine"}
                client={client}
                metaData={data.analysisMetadata}
                numericalDataFilters={
                  data.numericalDataFilters.numericalDataFilters
                }
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
                client={client}
                params={params}
                analysis={analysis}
                setOpenSharePopup={setOpenSharePopup}
                openSharePopup={openSharePopup}
              />
            )}
            {heatmapOrder && heatmapOrder.length === 0 ? (
              <Grid
                item
                className={classes.plots}
                xs={9}
                key={"plotPanelGridCellmine"}
              >
                <Paper
                  className={[classes.scatterplot, classes.paperContainer]}
                >
                  <div>NO CELLS SELECTED</div>
                </Paper>
              </Grid>
            ) : (
              <Grid
                item
                className={classes.plots}
                xs={9}
                key={"plotPanelGridCellmine"}
              >
                <Paper
                  key={"metadataTableCellmine"}
                  className={[classes.metadataContent, classes.paperContainer]}
                >
                  <MetaDataTable analysis={analysis} />
                </Paper>
                <Paper
                  key={"heatmapPaperCellmine"}
                  className={[classes.heatmapContent, classes.paperContainer]}
                >
                  <Heatmap
                    key={"heatmapPlotCellmine"}
                    analysis={analysis}
                    allHeatmapOrder={heatmapOrder}
                    categoryStats={data.categoriesStats}
                  />
                </Paper>
                <Paper
                  key={"scatterPaperCellmine"}
                  className={[classes.scatterplot, classes.paperContainer]}
                >
                  <Scatterplot key={"scatterplot"} analysis={analysis} />
                </Paper>
                <Paper
                  key={"violinPaperCellmine"}
                  className={[classes.violinContent, classes.paperContainer]}
                >
                  <Violin
                    key={"violinPlot"}
                    analysis={analysis}
                    allHeatmapOrder={heatmapOrder}
                    categoryStats={data.categoriesStats}
                  />
                </Paper>
                {data.analysisMetadata.dashboard === "QC Dashboard" && (
                  <Paper
                    key={"chipPaper"}
                    className={[classes.chip, classes.paperContainer]}
                  >
                    <Chip key={"chipPlot"} analysis={analysis} />
                  </Paper>
                )}
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
          justify="flex-start"
          alignItems="flex-start"
          key="QCContainer"
          className={classes.content}
        >
          <Grid
            key={"settingsPanelGridCellmine"}
            className={classes.settings}
            item
            xs={3}
          >
            <SettingsPanel
              key={"settingsPanelCellmine"}
              cellCount={null}
              categoryStats={[]}
              analysis={null}
              scatterplotOptions={[]}
              violionOptions={[]}
            />
          </Grid>
          <Grid
            item
            className={classes.plots}
            xs={9}
            key={"plotPanelGridCellmine"}
          >
            <Paper
              key={"heatmapPaperCellmine"}
              className={[classes.heatmapContent, classes.paperContainer]}
            >
              <LoadingCircle />
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
};

export default withStyles(styles)(CellmineDashboard);
