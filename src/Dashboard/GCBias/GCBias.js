import React from "react";
import * as d3 from "d3";

import XYFrame from "semiotic/lib/XYFrame";
import { withStyles } from "@material-ui/core/styles";

import { Query } from "react-apollo";
import gql from "graphql-tag";

import Grid from "@material-ui/core/Grid";

import { useStatisticsState } from "../DashboardState/statsState";

const styles = theme => ({
  legend: {
    marginTop: 50,
    marginRight: 30,
    marginLeft: 15
  }
});

const GCBIAS_QUERY = gql`
  query gcBias($analysis: String!, $quality: String!, $selectionOrder: [Int!]) {
    gcBias(
      analysis: $analysis
      quality: $quality
      selectionOrder: $selectionOrder
    ) {
      gcCells {
        experimentalCondition
        gcPercent
        highCi
        lowCi
        median
      }
      stats {
        yMin
        yMax
        xMax
        xMin
      }
    }
  }
`;

const GCBias = ({ analysis, classes, heatmapOrder }) => {
  const [{ quality, selectedCells }] = useStatisticsState();

  const selectionOrder = selectedCells.length > 0 ? heatmapOrder : null;

  return (
    <Query
      query={GCBIAS_QUERY}
      variables={{ analysis, quality, selectionOrder }}
    >
      {({ loading, error, data }) => {
        if (error) return null;
        if (loading && Object.keys(data).length === 0) {
          return null;
        }
        const { gcBias } = data;
        return (
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Grid item>
              <Chart
                data={gcBias.gcCells}
                stats={gcBias.stats}
                isLineVariation={false}
              />
            </Grid>
          </Grid>
        );
      }}
    </Query>
  );
};
const plotDimensions = {
  size: [800, 600],
  margin: { left: 80, bottom: 90, right: 60, top: 70 }
};
const frameProps = (data, extent, lineFunction) => {
  return {
    lines: data,
    /* --- Size --- */
    size: plotDimensions.size,
    margin: plotDimensions.margin,

    /* --- Layout --- */
    lineType: "difference",

    /* --- Process --- */
    xAccessor: "gcPercent",

    yAccessor: e => e[e.type],
    yExtent: [...extent],

    lineDataAccessor: "coordinates",

    /* --- Customize --- */
    lineStyle: (d, i) => {
      return {
        stroke: d.title === "lowCi" ? "red" : "#ac58e5",
        strokeWidth: 2,
        fill: d.title === "lowCi" ? "none" : "#ac58e5",
        fillOpacity: 0.6
      };
    },

    foregroundGraphics: <path d={lineFunction} stroke="black" fill="none" />,
    axes: [
      {
        orient: "left",
        label: "Average",
        ticks: 10,
        tickLineGenerator: function() {}
      },
      {
        orient: "bottom",
        label: { name: "GC Percent", locationDistance: 55 },
        tickLineGenerator: function() {}
      }
    ]
  };
};
const mapData = (data, type, max) =>
  data.map(entry => {
    //entry[type] = entry[type] < 0 ? 0 : entry[type];
    return { ...entry, type: type };
  });

const Chart = ({ data, stats, isLineVariation }) => {
  const extent = [0, stats.yMax];

  const formattedData = [
    {
      title: "lowCi",
      coordinates: mapData(data, "lowCi", stats.yMax)
    },
    {
      title: "highCi",
      coordinates: mapData(data, "highCi", stats.yMax)
    }
  ];
  const gcPercentToScreenCord = d3
    .scaleLinear()
    .domain([0, 100])
    .range([0, 660]);

  const medianToScreenCord = d3
    .scaleLinear()
    .domain([...extent])
    .range([440, 0]);

  const lineFunction = d3
    .line()
    .x(function(d) {
      return gcPercentToScreenCord(d.gcPercent) + 70 + 10;
    })
    .y(function(d) {
      return medianToScreenCord(d.median) + 70;
    })(mapData(data, "average", stats.yMax));

  const props = frameProps(formattedData, extent, lineFunction);
  return <XYFrame {...props} />;
};

export default withStyles(styles)(GCBias);
