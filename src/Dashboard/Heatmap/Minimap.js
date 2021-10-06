import React, { useRef, useEffect, useCallback, useState } from "react";

import { gql, useQuery } from "@apollo/client";

import LoadingCircle from "../CommonModules/LoadingCircle.js";

import * as d3 from "d3";
import { heatmapConfig } from "./config.js";
import { useStatisticsState } from "../DashboardState/statsState";

import {
  getMinimapBPRatio,
  getMinimapYScale,
  getSegX,
  getSegWidth,
  colorScale,
  heatmapToMinimapScale
} from "./utils.js";

const MINI_MAP_QUERY = gql`
  query mini_map(
    $analysis: String!
    $indices: [Int!]!
    $quality: String!
    $heatmapWidth: Int!
  ) {
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
const Minimap = ({
  heatmapOrder,
  rangeExtent,
  analysis,
  chromosomes,
  chromMap,
  triggerHeatmapRequery
}) => {
  const [{ quality }] = useStatisticsState();
  const cellCount = heatmapOrder.length;

  const [range, setRange] = useState([...rangeExtent]);

  const numRows = Math.min(
    cellCount,
    Math.floor(heatmapConfig.height / heatmapConfig.minimap.rowHeight)
  );
  const ratio = Math.ceil(cellCount / numRows);

  const [paintReady, setPaintReady] = useState(false);

  const indices = heatmapOrder.filter((key, index) => index % ratio === 0);
  const bpRatio = getMinimapBPRatio(chromosomes);

  useEffect(() => {
    setRange([...rangeExtent]);
  }, [rangeExtent]);

  function refCallback() {
    const ref = useRef(null);
    const setRef = useCallback(node => {
      if (node) {
        setPaintReady(true);
      }
      ref.current = node;
    }, []);

    return [setRef];
  }

  const [ref] = refCallback();

  useEffect(() => {
    if (data && paintReady) {
      const { segs } = data;
      var canvas = d3.select("#minimap");
      var context = canvas.node().getContext("2d");
      const yScale = getMinimapYScale(segs.length);

      segs.forEach((record, index) => {
        const y = yScale(index);
        record.segs.forEach(seg => {
          context.fillStyle = colorScale(seg.state);

          context.fillRect(
            getSegX(seg, chromMap, bpRatio, true),
            y,
            getSegWidth(seg, bpRatio),
            heatmapConfig.minimap.rowHeight
          );
        });
      });

      const brushSvg = d3.select("#minimapBrush");
      const heatmapToMinimap = heatmapToMinimapScale(cellCount, segs.length);

      var brush = d3
        .brushY()
        .extent([
          [0, 0],
          [
            heatmapConfig.minimap.width - 10,
            segs.length * heatmapConfig.minimap.rowHeight
          ]
        ])
        .on("end", brushEnd);

      function brushEnd() {
        const selection = d3.event.selection;
        if (!d3.event.sourceEvent || !selection) return;

        if (range[1] !== selection[1]) {
          const heatmapIndex = heatmapOrder.filter(
            (order, index) =>
              index >= Math.round(heatmapToMinimap.invert(selection[0])) &&
              index <= Math.round(heatmapToMinimap.invert(selection[1]))
          );

          setRange([...selection]);
          triggerHeatmapRequery(heatmapIndex);
        }
      }
      brushSvg.selectAll(".brush").remove();
      var gBrush = brushSvg.append("g").attr("class", "brush");

      gBrush.call(brush);

      brushSvg.select(".brush>.overlay").remove();
      brushSvg.select(".brush>.handle").remove();

      brush.move(gBrush, [
        heatmapToMinimap(range[0]),
        heatmapToMinimap(range[1])
      ]);
    }
  }, [data, paintReady]);

  const heatmapWidth = heatmapConfig.minimap.width;
  const { loading, error, data } = useQuery(MINI_MAP_QUERY, {
    variables: {
      analysis,
      indices,
      quality,
      heatmapWidth
    }
  });

  if (loading) return <LoadingCircle />;
  if (error) return null;

  return (
    <div ref={ref} style={{ position: "absolute", marginLeft: 15 }}>
      <canvas
        style={{ position: "absolute" }}
        id="minimap"
        width={heatmapConfig.minimap.width}
        height={heatmapConfig.height}
      />
      <svg
        id="minimapBrush"
        style={{ position: "absolute" }}
        width={heatmapConfig.minimap.width}
        height={heatmapConfig.height}
      />
    </div>
  );
};
export default Minimap;
