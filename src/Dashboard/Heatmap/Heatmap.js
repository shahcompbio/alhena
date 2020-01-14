import React, { useState, useEffect } from "react";

import { withStyles } from "@material-ui/core/styles";

import { Query } from "react-apollo";
import gql from "graphql-tag";

import { heatmapConfig } from "./config.js";
import {
  getYScale,
  getChromPixelMapping,
  heatmapOrderToCellIndex
} from "./utils.js";

import CategoriesLegend from "./CategoriesLegend.js";
import Categories from "./Categories.js";
import ChromAxis from "./ChromAxis.js";
import HeatmapRow from "./HeatmapRow.js";
import Indicator from "./Indicator.js";
import Legend from "./Legend.js";
import MenuToolBar from "../CommonModules/MenuToolBar.js";
import Minimap from "./Minimap.js";
import ProfileWrapper from "./ProfileWrapper.js";

import Grid from "@material-ui/core/Grid";

import { useStatisticsState } from "../DashboardState/statsState";

const styles = theme => ({
  content: {
    flexGrow: 1,
    backgroundColor: "#FFFFFFF",
    padding: theme.spacing.unit * 3
  },
  container: {
    minHeight: "100vh"
  }
});

const CHROMOSOME_SEGS_QUERY = gql`
  query chromosomes_segs(
    $analysis: String!
    $indices: [Int!]!
    $quality: String!
  ) {
    analysisStats(analysis: $analysis, indices: $indices) {
      maxState
      cellStats {
        id
        state_mode
        experimental_condition
        cell_call
        heatmap_order
      }
    }
    chromosomes(analysis: $analysis) {
      id
      start
      end
    }
    segs(analysis: $analysis, indices: $indices, quality: $quality) {
      id
      name
      index
      segs {
        chromosome
        start
        end
        state
      }
    }
  }
`;

const Heatmap = ({ analysis, heatmapOrder, categoryStats }) => {
  const [{ quality, categoryState }] = useStatisticsState();

  const [hoverCell, setHoverCell] = useState({});
  const [allCategories] = useState(categoryStats);
  const [selectedCategories, setSelectedCategories] = useState(categoryStats);
  const [indices, setIndices] = useState([
    ...heatmapOrder.filter(
      order =>
        order >= heatmapOrder[0] &&
        order < heatmapOrder[heatmapConfig.height / heatmapConfig.rowHeight - 2]
    )
  ]);

  const heatmapOrderToIndex = heatmapOrderToCellIndex(
    heatmapOrder,
    heatmapOrder.length
  );

  useEffect(() => {
    if (categoryState) {
      const newCategories = categoryStats.filter(
        stat => categoryState[stat.category]
      );
      setSelectedCategories(newCategories);
    }
  }, [categoryState]);

  return (
    <Query
      query={CHROMOSOME_SEGS_QUERY}
      variables={{ analysis, indices, quality }}
    >
      {({ loading, error, data }) => {
        if (error) return null;
        if (loading && Object.keys(data).length === 0) {
          return null;
        }
        const { chromosomes, segs, analysisStats } = data;

        const categoryWidth =
          selectedCategories.length * heatmapConfig.categories.squareSize +
          heatmapConfig.paddingLeft * 2;

        const yScale = getYScale(
          heatmapConfig.height / heatmapConfig.rowHeight
        );

        const chromMap = getChromPixelMapping(chromosomes);

        const segRows = segs.map((seg, index) => {
          const { id, name, ...segData } = seg;
          const rowData = { ...segData, id: name };

          return (
            <HeatmapRow
              index={index}
              key={rowData["id"]}
              rowData={rowData}
              chromosomes={chromosomes}
              yScale={yScale}
              chromMap={chromMap}
              rowMouseOver={async (id, y) =>
                setHoverCell({ id: id, y: y, index: index })
              }
              categoryWidth={categoryWidth + heatmapConfig.paddingLeft}
            />
          );
        });
        return (
          <Grid container direction="column">
            <Grid item>
              <MenuToolBar
                categoryOptions={{
                  selected: selectedCategories,
                  all: allCategories
                }}
                handleRequery={(quality, selectedCategories) => {}}
              />
            </Grid>
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
              height={heatmapConfig.categories.legendHeight}
              width={heatmapConfig.wrapperWidth}
            >
              <Grid item>
                <CategoriesLegend choosenStats={selectedCategories} />
              </Grid>
              <Grid item>
                <Legend maxState={analysisStats.maxState} />
              </Grid>
            </Grid>
            <Grid
              item
              container
              direction="row"
              width={heatmapConfig.wrapperWidth}
            >
              <Grid item>
                <svg
                  width={heatmapConfig["width"] + heatmapConfig.paddingLeft}
                  height={heatmapConfig["height"] + heatmapConfig["rowHeight"]}
                >
                  <Categories
                    categories={selectedCategories}
                    cellStats={analysisStats.cellStats}
                    yScale={yScale}
                  />
                  {segRows}
                  <ChromAxis
                    categoryWidth={categoryWidth + heatmapConfig.paddingLeft}
                    y={yScale(segRows.length)}
                    chromosomes={chromosomes}
                    chromMap={chromMap}
                  />

                  {hoverCell.hasOwnProperty("y") && (
                    <Indicator y={hoverCell.y} />
                  )}
                </svg>
              </Grid>
              <Grid item>
                <Minimap
                  triggerHeatmapRequery={index => setIndices([...index])}
                  heatmapOrder={heatmapOrder}
                  rangeExtent={[
                    heatmapOrderToIndex(indices[0]),
                    heatmapOrderToIndex(indices[indices.length - 1])
                  ]}
                  analysis={analysis}
                  chromosomes={chromosomes}
                  chromMap={chromMap}
                />
              </Grid>
            </Grid>
            <Grid item>
              <ProfileWrapper
                categoryLength={selectedCategories.length}
                segs={segs[hoverCell.index]}
                maxState={analysisStats.maxState}
                chromosomes={chromosomes}
                chromMap={chromMap}
                analysis={analysis}
                cellId={hoverCell.id}
                key={"genomeProfile"}
              />
            </Grid>
          </Grid>
        );
      }}
    </Query>
  );
};

export default withStyles(styles)(Heatmap);
