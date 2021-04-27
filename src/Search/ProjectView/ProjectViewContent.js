import React, { useState, useRef } from "react";
import Search from "./Filter/Search.js";

import { useAppState } from "../../util/app-state";
import { withStyles } from "@material-ui/styles";

import CanvasGraph from "./Graph/CanvasGraph.js";
import Publications from "./Publications/Publications.js";

import { Query } from "react-apollo";
import gql from "graphql-tag";
import { useDashboardState } from "./ProjectState/dashboardState";
import { Grid } from "@material-ui/core";

const styles = {
  root: { flexGrow: 1, background: "#586773" },
  hide: {
    display: "none"
  },
  title: {
    color: "white",
    filter: "url(#textGlow)",
    paddingTop: 50,
    paddingLeft: 50
  }
};
const getAllAnalyses = gql`
  query Sunburst($filter: [Term]!, $dashboardName: String!) {
    analyses(filters: $filter, dashboardName: $dashboardName) {
      error
      analysesStats {
        label
        value
      }
      analysesList {
        label
        values
        type
      }
      analysesTree {
        source
        children {
          ... on ParentType {
            source
            target
            children {
              ... on ParentType {
                source
                target
                children {
                  ... on ChildType {
                    source
                    target
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
const ProjectViewContent = ({ classes, handleForwardStep }) => {
  const [{ selectedDashboard }] = useDashboardState();

  const [{ authKeyID, uid }, dispatch] = useAppState();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [filters, setFilters] = useState([]);

  const [graphDim, setDim] = useState(0);
  const dimRef = useRef(0);

  const handleFilterChange = (filter, type) => {
    var options = selectedOptions;

    if (filter && type.localeCompare("clear") !== 0) {
      options[filter.label] = {
        value: filter.label,
        label: filter.value
      };
      setSelectedOptions(options);
      setFilters([...filters, filter]);
    } else {
      var newFilters = filters.filter((value, i) => value.label !== filter);
      delete selectedOptions[filter];

      setSelectedOptions(selectedOptions);
      setFilters([...newFilters]);
    }
  };
  console.log(handleForwardStep);
  return selectedDashboard !== null ? (
    <Grid container className={classes.root} spacing={2} key={"grid-container"}>
      <Grid item xs={12} sm={6} key={"grid-content"} ref={dimRef}>
        <Publications
          isLoading={true}
          key={"packing-circles"}
          filters={[]}
          analyses={{}}
          handleFilterChange={null}
          handleForwardStep={() => handleForwardStep()}
        />
      </Grid>
    </Grid>
  ) : (
    <Grid container className={classes.root} spacing={2} key={"grid-container"}>
      <Grid item xs={12} sm={6} key={"grid-content"} ref={dimRef}>
        <Publications
          graphDim={graphDim}
          isLoading={false}
          key={"packing-circles"}
          filters={filters}
          handleFilterChange={(filters, type) =>
            handleFilterChange(filters, type)
          }
          handleForwardStep={() => handleForwardStep()}
        />
      </Grid>
    </Grid>
  );
};

export default withStyles(styles)(ProjectViewContent);
