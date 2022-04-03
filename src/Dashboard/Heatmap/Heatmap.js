import React, { useState, useEffect, useCallback } from "react";
import * as d3 from "d3";
import withStyles from "@mui/styles/withStyles";

import { gql, useQuery } from "@apollo/client";

//import gql from "graphql-tag";
import { scalePoint } from "d3";
import { heatmapConfig } from "./config.js";
import { initContext } from "../utils.js";
import {
  getYScale,
  getChromPixelMapping,
  getBPRatio,
  getSegWidth,
  getSegX,
  colorScale
} from "./utils.js";

import CategoriesLegend from "./CategoriesLegend.js";
import Categories from "./Categories.js";
import ChromAxis from "./ChromAxis.js";
import Indicator from "./Indicator.js";
import Legend from "./Legend.js";
import Minimap from "./Minimap.js";
import LoadingCircle from "../CommonModules/LoadingCircle.js";
import ProfileWrapper from "./ProfileWrapper.js";

import Grid from "@mui/material/Grid";

import { useStatisticsState } from "../DashboardState/statsState";

const width = heatmapConfig["width"] + heatmapConfig["paddingLeft"];
const height = heatmapConfig["height"] + heatmapConfig["rowHeight"];

const margin = {
  left: 75,
  top: 37,
  bottom: 90,
  right: 10,
  histogram: 20
};
const styles = theme => ({
  content: {
    flexGrow: 1,
    backgroundColor: "#FFFFFFF",
    padding: theme.spacing(3)
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
    $heatmapWidth: Int!
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
    segs(
      analysis: $analysis
      indices: $indices
      quality: $quality
      heatmapWidth: $heatmapWidth
    ) {
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
const getIndicesFromAllHeatmapOrder = allHeatmapOrder =>
  allHeatmapOrder.filter(
    (order, index) => index < heatmapConfig.height / heatmapConfig.rowHeight - 2
  );

const Heatmap = ({ analysis, allHeatmapOrder, categoryStats }) => {
  const [{ quality, selectedCells, subsetSelection }] = useStatisticsState();
  const [heatmapOrder, setHeatmapOrder] = useState([]);

  const [hoverCell, setHoverCell] = useState({ cell: {} });

  const [indices, setIndices] = useState([]);
  useEffect(() => {
    if (allHeatmapOrder) {
      setHeatmapOrder([...allHeatmapOrder]);
      setIndices([...getIndicesFromAllHeatmapOrder(allHeatmapOrder)]);
    }
  }, [allHeatmapOrder, selectedCells, subsetSelection]);

  const heatmapOrderToHeatmapIndex = scalePoint()
    .domain([...heatmapOrder])
    .range([0, heatmapOrder.length - 1]);

  const categoryWidth =
    categoryStats.length * heatmapConfig.categories.squareSize +
    categoryStats.length * heatmapConfig.categories.squareSpacing;
  const heatmapWidth = width - categoryWidth;

  const { loading, error, data } = useQuery(CHROMOSOME_SEGS_QUERY, {
    variables: {
      analysis,
      indices,
      quality,
      heatmapWidth
    }
  });

  if (error) return null;
  if (loading) {
    return <LoadingCircle />;
  }

  const { chromosomes, segs, analysisStats } = data;

  const yScale = getYScale(heatmapConfig.height / heatmapConfig.rowHeight);

  const chromMap = getChromPixelMapping(chromosomes);
  return (
    <Grid container direction="column">
      <Grid
        item
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        height={heatmapConfig.categories.legendHeight}
        width={heatmapConfig.wrapperWidth}
      >
        <Grid item>
          <CategoriesLegend choosenStats={categoryStats} />
        </Grid>
        <Grid item>
          <Legend maxState={analysisStats.maxState} />
        </Grid>
      </Grid>
      <Grid
        item
        container
        direction="row"
        style={{ position: "relative" }}
        width={heatmapConfig.wrapperWidth}
        height={heatmapConfig["height"] - heatmapConfig.chromosome["height"]}
      >
        <Grid item>
          <svg
            width={categoryWidth + heatmapConfig.paddingLeft}
            height={heatmapConfig["height"]}
          >
            <Categories
              categories={categoryStats}
              cellStats={analysisStats.cellStats}
              yScale={yScale}
            />

            {hoverCell.hasOwnProperty("y") && <Indicator y={hoverCell["y"]} />}
          </svg>
        </Grid>
        <Grid item>
          <Plot
            setSelectedCell={(y, heatmapRow) => {
              const cell = segs[heatmapRow];
              if (cell !== undefined) {
                setHoverCell({
                  y: yScale(heatmapRow),
                  cell: segs[heatmapRow]
                });
              }
            }}
            setHoverCellCoordinate={(y, heatmapRow) => {
              const cell = segs[heatmapRow];
              if (cell !== undefined) {
                setHoverCell({
                  y: yScale(heatmapRow),
                  cell: segs[heatmapRow]
                });
              }
            }}
            indicator={hoverCell["y"]}
            chromosomes={chromosomes}
            analysisStats={analysisStats}
            segs={segs}
            heatmapOrderToHeatmapIndex={heatmapOrderToHeatmapIndex}
            categoryWidth={categoryWidth + heatmapConfig.paddingLeft}
          />
        </Grid>
        <Grid item>
          <Minimap
            triggerHeatmapRequery={index => setIndices([...index])}
            heatmapOrder={heatmapOrder}
            rangeExtent={[
              heatmapOrderToHeatmapIndex(indices[0]),
              heatmapOrderToHeatmapIndex(indices[indices.length - 1])
            ]}
            analysis={analysis}
            chromosomes={chromosomes}
            chromMap={chromMap}
          />
        </Grid>
      </Grid>
      <Grid item style={{ paddingTop: 10 }}>
        <canvas
          id="chromAxis"
          height={heatmapConfig.chromosome["height"]}
          width={heatmapConfig.wrapperWidth}
        >
          <ChromAxis
            categoryWidth={categoryWidth + heatmapConfig.paddingLeft}
            chromosomes={chromosomes}
            chromMap={chromMap}
          />
        </canvas>
      </Grid>
      <Grid item style={{ marginTop: -5, marginLeft: 3 }}>
        <ProfileWrapper
          loading={true}
          categoryLength={categoryStats.length}
          segs={hoverCell["cell"]}
          maxState={analysisStats["maxState"]}
          chromosomes={chromosomes}
          chromMap={chromMap}
          analysis={analysis}
          cellId={hoverCell["cell"]["id"]}
          key={"genomeProfile"}
        />
      </Grid>
      <div id="heatmapCellID" style={{ height: 15, margin: 5 }}>
        {Object.keys(hoverCell["cell"]).length !== 0 && (
          <div>Cell ID: {hoverCell["cell"]["id"]}</div>
        )}
      </div>
    </Grid>
  );
};

const Plot = ({
  chromosomes,
  analysisStats,
  setHoverCellCoordinate,
  setSelectedCell,
  segs,
  categoryWidth,
  indicator
}) => {
  const [context, saveContext] = useState();

  const [ref] = useHookWithRefCallback();
  const [rowHoverCordinates, setRowHoverCordinates] = useState(null);
  const [selectedCellCoordinates, setRowSelectedCoordinates] = useState(null);

  const yScale = getYScale(heatmapConfig.height / heatmapConfig.rowHeight);

  const invertYScale = d3.range(
    yScale.range()[0],
    yScale.range()[1],
    yScale.step()
  );

  const chromMap = getChromPixelMapping(chromosomes);

  useEffect(() => {
    var heatmapRow;
    if (selectedCellCoordinates && rowHoverCordinates === null) {
      const roundY = Math.max(selectedCellCoordinates[1], 0);
      heatmapRow = yScale.domain()[d3.bisect(invertYScale, roundY) - 1];
      if (heatmapRow < segs.length) {
        setSelectedCell(selectedCellCoordinates[1], heatmapRow);
        drawHeatmap(segs, context, yScale(heatmapRow));
      }
    }
    if (rowHoverCordinates !== null) {
      const roundY = Math.max(rowHoverCordinates[1], 0);
      heatmapRow = yScale.domain()[d3.bisect(invertYScale, roundY) - 1];
      if (heatmapRow < segs.length) {
        setHoverCellCoordinate(rowHoverCordinates[1], heatmapRow);
        drawHeatmap(segs, context, yScale(heatmapRow));
      } else {
        setRowHoverCordinates(null);
      }
    }
  }, [rowHoverCordinates, selectedCellCoordinates]);

  useEffect(() => {
    if (context) {
      drawHeatmap(segs, context);
    }
  }, [segs]);

  function useHookWithRefCallback() {
    const setRef = useCallback(node => {
      if (node) {
        const heatmap = d3.select("#heatmap");
        const canvas = heatmap
          .select("canvas")
          .attr("width", width)
          .attr("height", height - heatmapConfig.chromosome["height"])
          .attr("transform", "translate(" + 0 + "," + margin.top + ")");

        const context = initContext(canvas, width, height);

        saveContext(context);
        context.save();
        drawHeatmap(segs, context, indicator);

        d3.select("#heatSelection")
          .on("mousemove", function() {
            var coordinates = d3.mouse(this);
            setRowHoverCordinates(coordinates);
          })
          .on("mousedown", function() {
            var coordinates = d3.mouse(this);
            setRowSelectedCoordinates(coordinates);
          })
          .on("mouseout", function() {
            if (selectedCellCoordinates !== null) {
              setRowHoverCordinates(null);
            }
          });
      }
    }, []);

    return [setRef];
  }
  const drawHeatmap = (segs, context, indicator) => {
    context.clearRect(0, 0, width, height);
    segs.forEach((segRow, index) => {
      const y = yScale(index);

      const bpRatio = getBPRatio(chromosomes);
      segRow.segs.forEach(seg => {
        const x = getSegX(seg, chromMap, bpRatio, false, 0);

        context.beginPath();
        context.fillStyle = colorScale(seg["state"]);
        context.fillRect(
          x,
          y,
          getSegWidth(seg, bpRatio),
          heatmapConfig["rowHeight"]
        );
        context.stroke();
      });

      if (indicator) {
        context.beginPath();
        context.fillStyle = "black";

        context.fillRect(
          0,
          indicator + heatmapConfig["rowHeight"],
          heatmapConfig["width"] - categoryWidth,
          0.8
        );

        context.stroke();
      }
    });
  };

  return (
    <div
      style={{
        width: width - categoryWidth,
        height: height - heatmapConfig.chromosome["height"],
        position: "relative"
      }}
      ref={ref}
    >
      <div
        id="heatmap"
        style={{
          width: width - categoryWidth,
          height: height - heatmapConfig.chromosome["height"],
          position: "absolute",
          pointerEvents: "all"
        }}
      >
        <canvas id="heatmapCanvas" />
      </div>
      <svg
        id="heatSelection"
        style={{
          width: width - categoryWidth,
          height: height - heatmapConfig.chromosome["height"],
          position: "relative"
        }}
      />
    </div>
  );
};
export default withStyles(styles)(Heatmap);
