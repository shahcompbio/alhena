import React from "react";
import * as d3 from "d3";

import XYFrame from "semiotic/lib/XYFrame";
import DividedLine from "semiotic/lib/DividedLine";
import MedianLine from "./MedianLine.js";
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
  query gcBias($analysis: String!, $quality: String!) {
    gcBias(analysis: $analysis, quality: $quality) {
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

const GCBias = ({ analysis, classes }) => {
  const [{ quality, categoryState }] = useStatisticsState();

  return (
    <Query query={GCBIAS_QUERY} variables={{ analysis, quality }}>
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
const frameProps = (data, extent, lineFunction) => {
  return {
    lines: data,
    /* --- Size --- */
    size: [800, 600],
    margin: { left: 80, bottom: 90, right: 60, top: 70 },

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
    /*customLineMark: ({ d, i, xScale, yScale }) => {
      return (
        <DividedLine
          id="medianLine"
          key={`threshold-${i}`}
          data={[d]}
          parameters={p => {
            return { stroke: "#9fd0cb", fill: "none" };
          }}
          customAccessors={{
            x: d => xScale(d.gcPercent),
            y: d => yScale(d.median)
          }}
          lineDataAccessor={d => d.data}
        />
      );
    },
   --- Draw ---
,
    annotations: [
      {
        className: "dot-com-bubble",
        type: "line",
        lines: {
          coordinates: [[0, 0.5], [50, 0.8]]
        }
      }
    ],*/
    foregroundGraphics: <path d={lineFunction} stroke="black" fill="none" />,
    axes: [
      {
        orient: "left",
        label: "Median",
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
const linProps = (data, extent) => {
  const theme = [
    "#ac58e5",
    "#E0488B",
    "#9fd0cb",
    "#e0d33a",
    "#7566ff",
    "#533f82",
    "#7a255d",
    "#365350",
    "#a19a11",
    "#3f4482"
  ];

  return {
    lines: data,
    /* --- Size --- */
    size: [700, 400],
    margin: { left: 70, bottom: 60, right: 30, top: 40 },

    /* --- Process --- */
    xAccessor: "gcPerecent",
    yAccessor: "median",
    yExtent: [...extent],
    lineStyle: (d, i) => ({
      stroke: theme[i],
      strokeWidth: 2,
      fill: "none"
    }),
    axes: [
      {
        orient: "left",
        label: "Median",
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

const Chart = ({ data, stats, isLineVariation }) => {
  const extent = [stats.yMin, stats.yMax];

  const lowData = data.map(entry => ({ ...entry, type: "lowCi" }));
  const highData = data.map(entry => ({ ...entry, type: "highCi" }));
  const formattedData = [
    {
      title: "lowCi",
      coordinates: lowData
    },
    {
      title: "highCi",
      coordinates: highData
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
      return medianToScreenCord(d.median) + 40 + 30;
    })(data);

  const props = frameProps(formattedData, extent, lineFunction);
  return <XYFrame {...props} />;
};

export default withStyles(styles)(GCBias);
