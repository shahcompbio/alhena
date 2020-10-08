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
  query heatmapOrder($analysis: String!, $quality: String!) {
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
    scatterplotAxisOptions {
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
  }
`;
const styles = theme => ({
  root: {
    flexGrow: 1
  },
  content: {
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
    width: 800
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
const QCDashboard = ({ analysis, classes }) => {
  const [
    { selectedCells, quality, popupFacadeIsOpen },
    dispatch
  ] = useStatisticsState();
  let history = useHistory();

  const { loading, data } = useQuery(HEATMAP_ORDER, {
    variables: {
      analysis: analysis,
      quality: quality
    }
  });

  if (!loading && data) {
    if (data.heatmapOrder) {
      const heatmapOrder =
        selectedCells.length > 0
          ? selectedCells
          : data.heatmapOrder.map(order => order.order);

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
                cellCount={data.heatmapOrder.length}
                scatterplotOptions={data.scatterplotAxisOptions}
                chipHeatmapOptions={data.chipHeatmapOptions}
                violinOptions={data.violinAxisOptions}
                categoryStats={data.categoriesStats}
                analysis={analysis}
              />
            </Grid>
            <Grid item className={classes.plots} xs={9}>
              <Paper
                className={[classes.heatmapContent, classes.paperContainer]}
              >
                <Heatmap
                  analysis={analysis}
                  allHeatmapOrder={heatmapOrder}
                  categoryStats={data.categoriesStats}
                />
              </Paper>
              <Paper className={[classes.chip, classes.paperContainer]}>
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
              </Paper>
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

export default withStyles(styles)(QCDashboard);
