import React, { useRef, useCallback, useState } from "react";

import { gql, useQuery } from "@apollo/client";

import * as d3 from "d3";

import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";

import { heatmapConfig } from "./config.js";
import { getGenomeYScale } from "./utils.js";

import Profile from "./Profile.js";
import ProfileAxis from "./ProfileAxis.js";

const BINS_QUERY = gql`
  query bins($analysis: String!, $id: String!) {
    bins(analysis: $analysis, id: $id) {
      id
      start
      end
      copy
      state
      chromNumber
    }
  }
`;
const ProfileWrapper = ({
  categoryLength,
  chromosomes,
  chromMap,
  analysis,
  cellId,
  maxState,
  segs
}) => {
  const genomeYScale = getGenomeYScale(maxState);
  const axisDomain = Array.from(Array(maxState + 1).keys());
  const xOffset = categoryLength === 1 ? 12 : categoryLength === 2 ? 5 : 0;
  const [isLoading, setIsLoading] = useState(false);

  function useHookWithRefCallback() {
    const ref = useRef(null);
    const setRef = useCallback(node => {
      if (node) {
        const container = d3.select(node).select("#profileSvg");

        container
          .append("g")
          .attr("class", "gw-tick-lines")
          .selectAll(".gw-tick-line")
          .data(axisDomain)
          .enter()
          .append("line")
          .attr("x1", 0)
          .attr("x2", heatmapConfig.profile.axisWidth)
          .attr("y1", d => genomeYScale(d))
          .attr("y2", d => genomeYScale(d));

        container
          .append("g")
          .attr("class", "gw-background")
          .selectAll(".gw-background-box")
          .data(chromosomes)
          .enter()
          .append("rect")
          .attr("class", d => "gw-background-box chrom-" + d.id)
          .attr("x", d => chromMap[d.id].x)
          .attr("y", 0)
          .attr("width", d => chromMap[d.id].width)
          .attr("height", heatmapConfig.profile.height)
          .attr(
            "fill",
            (d, i) => heatmapConfig.profile.backgroundColors[i % 2]
          );

        container
          .append("g")
          .attr("class", "gw-background-lines")
          .selectAll(".gw-background-line")
          .data(axisDomain)
          .enter()
          .append("line")
          .attr("x1", 0)
          .attr("x2", heatmapConfig.width - heatmapConfig.profile.axisWidth)
          .attr("y1", d => genomeYScale(d))
          .attr("y2", d => genomeYScale(d));
      }
      ref.current = node;
    }, []);

    return [setRef];
  }

  const [ref] = useHookWithRefCallback();

  return (
    <Grid
      item
      container
      direction="row"
      id="profileWrapper"
      ref={ref}
      style={{ position: "relative", marginLeft: -xOffset }}
      width={heatmapConfig.wrapperWidth}
    >
      <Grid item>
        <canvas
          id="genomeAxis"
          style={{ marginTop: -7 }}
          width={heatmapConfig.profile.axisWidth}
          height={heatmapConfig.profile.height}
        >
          <ProfileAxis genomeYScale={genomeYScale} />
        </canvas>
      </Grid>
      <Grid item>
        <svg
          id="profileSvg"
          width={heatmapConfig.width}
          height={heatmapConfig.profile.height}
          style={{ position: "absolute" }}
        />
        <canvas
          id="profileCanvas"
          style={{
            marginLeft: heatmapConfig.profile.axisWidth
          }}
          width={heatmapConfig.width}
          height={heatmapConfig.profile.height}
        >
          {cellId && (
            <ProfileWithData
              cellId={cellId}
              analysis={analysis}
              segs={segs}
              chromosomes={chromosomes}
              genomeYScale={genomeYScale}
              resetLoadingCircle={value => setIsLoading(value)}
            />
          )}
        </canvas>
        {cellId && isLoading && (
          <CircularProgress
            size={70}
            style={{
              position: "relative",
              marginLeft: heatmapConfig.width * 0.45,
              marginTop: heatmapConfig.profile.height * 0.45
            }}
          />
        )}
      </Grid>
    </Grid>
  );
};

const ProfileWithData = ({
  resetLoadingCircle,
  cellId,
  analysis,
  segs,
  chromosomes,
  genomeYScale
}) => {
  const { loading, error, data } = useQuery(BINS_QUERY, {
    variables: {
      analysis: analysis,
      id: cellId
    }
  });

  if (loading) {
    resetLoadingCircle(true);
    return null;
  }
  if (error) return null;
  if (data) {
    resetLoadingCircle(false);
  }

  const { bins } = data;

  return (
    <Profile
      cellSegs={segs}
      chromosomes={chromosomes}
      bins={bins}
      genomeYScale={genomeYScale}
    />
  );
};
export default ProfileWrapper;
