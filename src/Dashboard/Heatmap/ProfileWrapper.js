import React, { useRef, useCallback } from "react";

import { Query } from "react-apollo";
import gql from "graphql-tag";
import * as d3 from "d3";

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
  function useHookWithRefCallback() {
    const ref = useRef(null);
    const setRef = useCallback(node => {
      if (node) {
        const container = d3.select(node).select("#profileSvg");
        container.attr(
          "transform",
          "translate(" +
            heatmapConfig.paddingLeft +
            ", " +
            heatmapConfig.profile.axisTextYOffset +
            ")"
        );

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

  const ProfileWithData = () =>
    cellId ? (
      <Query
        query={BINS_QUERY}
        variables={{
          analysis: analysis,
          id: cellId
        }}
      >
        {({ loading, error, data }) => {
          if (loading) return null;
          if (error) return null;

          const { bins } = data;
          return (
            <Profile
              cellSegs={segs}
              chromosomes={chromosomes}
              bins={bins}
              genomeYScale={genomeYScale}
            />
          );
        }}
      </Query>
    ) : null;

  return (
    <div
      id="profileWrapper"
      ref={ref}
      style={{ position: "absolute", marginLeft: -xOffset }}
    >
      <ProfileAxis genomeYScale={genomeYScale} />
      <svg
        id="profileSvg"
        width={heatmapConfig.width}
        height={heatmapConfig.profile.height}
      />
      <canvas
        id="profileCanvas"
        style={{ marginLeft: heatmapConfig.profile.axisWidth }}
        width={heatmapConfig.width}
        height={heatmapConfig.profile.height}
      >
        <ProfileWithData />
      </canvas>
    </div>
  );
};

export default ProfileWrapper;
