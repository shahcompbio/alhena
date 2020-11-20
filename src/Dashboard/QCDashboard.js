import React from "react";

import gql from "graphql-tag";
import { useQuery } from "react-apollo-hooks";

import { withStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";

import Heatmap from "./Heatmap/Heatmap.js";
import Chip from "./ChipHeatmap/Chip.js";
import GCBias from "./GCBias/GCBias.js";
import Scatterplot from "./Scatterplot/Scatterplot.js";
import Violin from "./Violin/Violin.js";

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
    height: 950,
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

const QCDashboard = ({ analysis, classes, client }) => {
  const [
    {
      selectedCells,
      quality,
      popupFacadeIsOpen,
      isContaminated,
      numericalDataFilters,
      expCondition,
      axisChange
    },
    dispatch
  ] = useStatisticsState();
  let history = useHistory();

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
      //    console.log(heatmapOrder);
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
            <Grid className={classes.settings} item xs={3}>
              <SettingsPanel
                client={client}
                numericalDataFilters={
                  data.numericalDataFilters.numericalDataFilters
                }
                cellCount={data.heatmapOrder.length}
                chipHeatmapOptions={data.chipHeatmapOptions}
                violinOptions={data.violinAxisOptions}
                categoryStats={data.categoriesStats}
                analysis={analysis}
              />
            </Grid>

            <Grid item className={classes.plots} xs={9}>
              {heatmapOrder && heatmapOrder.length === 0 ? (
                <Paper
                  className={[classes.scatterplot, classes.paperContainer]}
                >
                  <div>NO CELLS SELECTED</div>
                </Paper>
              ) : (
                <Paper
                  className={[classes.scatterplot, classes.paperContainer]}
                >
                  <Scatterplot analysis={analysis} />
                </Paper>
              )}
            </Grid>
          </Grid>
        </div>
      );
    } else {
      history.push("/dashboards");
      return null;
    }
  } else {
    return (
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        key="QCContainer"
        className={classes.content}
        spacing={3}
      >
        <Grid className={classes.settings} item>
          <SettingsPanel
            cellCount={null}
            categoryStats={[]}
            analysis={null}
            scatterplotOptions={[]}
            violionOptions={[]}
          />
        </Grid>
        <Grid item className={classes.plots}>
          <Paper className={[classes.chip, classes.paperContainer]}>
            <LoadingCircle />
          </Paper>
        </Grid>
      </Grid>
    );
  }
};
/*
<Paper
  className={[classes.heatmapContent, classes.paperContainer]}
>
  <Heatmap
    analysis={analysis}
    allHeatmapOrder={heatmapOrder}
    categoryStats={data.categoriesStats}
  />
</Paper><Paper className={[classes.chip, classes.paperContainer]}>
  <Chip analysis={analysis} />
</Paper>
<Paper
  className={[classes.violinContent, classes.paperContainer]}
>
  <Violin
    analysis={analysis}
    allHeatmapOrder={heatmapOrder}
    categoryStats={data.categoriesStats}
  />
</Paper>
<Paper className={[classes.gcBias, classes.paperContainer]}>
  <GCBias analysis={analysis} heatmapOrder={heatmapOrder} />
</Paper>
<Paper className={[classes.scatterplot, classes.paperContainer]}>
  <Scatterplot analysis={analysis} />
</Paper>*/
export default withStyles(styles)(QCDashboard);
