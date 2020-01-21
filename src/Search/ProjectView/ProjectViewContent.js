import React, { useState, useEffect, useRef } from "react";
import Search from "./Filter/Search.js";
import Demographics from "./Demographics/Demographics.js";

import { useAppState } from "../../util/app-state";
import { withStyles } from "@material-ui/styles";

import Graph from "./Graph/Graph2.js";

import { Query } from "react-apollo";
import { getAllAnalyses } from "../../Queries/queries.js";

import { useDashboardState } from "./ProjectState/dashboardState";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const styles = {
  root: { flexGrow: 1 },
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

const ProjectViewContent = ({ classes }) => {
  const [{ selectedDashboard }] = useDashboardState();
  const [{ authKeyID, uid }] = useAppState();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [filters, setFilters] = useState([]);
  console.log(selectedDashboard);
  const [graphDim, setDim] = useState(0);
  const dimRef = useRef(0);

  const updateDimensions = () => {
    setDim({
      width: dimRef.current.clientWidth,
      height: dimRef.current.clientHeight
    });
  };

  window.addEventListener("resize", updateDimensions);
  useEffect(() => {
    updateDimensions();
  }, []);

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

      setFilters([...newFilters]);
    }
  };
  return (
    <Query
      query={getAllAnalyses}
      variables={{
        filter: [...filters],
        dashboardName: selectedDashboard,
        user: { authKeyID: authKeyID, uid: uid }
      }}
    >
      {({ loading, error, data }) => {
        if (error) {
          /*  dispatch({
            type: "LOGOUT"
          });*/
          return null;
        }
        if (loading) {
          return (
            <Grid
              container
              className={classes.root}
              spacing={2}
              key={"grid-container"}
            >
              <Grid
                item
                xs={6}
                sm={3}
                style={{ height: "50vh" }}
                key={"grid-search"}
              >
                <Search
                  key={"search"}
                  selectedOptions={null}
                  filters={null}
                  dashboards={[]}
                  handleFilterChange={null}
                />
              </Grid>
              <Grid item xs={12} sm={6} key={"grid-content"} ref={dimRef}>
                <Graph
                  isLoading={true}
                  key={"packing-circles"}
                  filters={[]}
                  analyses={{}}
                  handleFilterChange={null}
                />
              </Grid>
              <Grid item xs={6} sm={3} key={"demographics-content"}>
                <Demographics stats={null} key={"demographics"} />
              </Grid>
            </Grid>
          );
        } else {
          return (
            <Grid
              container
              className={classes.root}
              spacing={2}
              key={"grid-container"}
            >
              <Grid
                item
                xs={6}
                sm={3}
                style={{ height: "50vh" }}
                key={"grid-search"}
              >
                <Search
                  key={"search"}
                  selectedOptions={selectedOptions}
                  filters={data.analyses.analysesList}
                  handleFilterChange={(selection, type) =>
                    handleFilterChange(selection, type)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} key={"grid-content"} ref={dimRef}>
                <Graph
                  graphDim={graphDim}
                  isLoading={false}
                  key={"packing-circles"}
                  filters={filters}
                  analyses={data.analyses.analysesTree.children}
                  handleFilterChange={(filters, type) =>
                    handleFilterChange(filters, type)
                  }
                />
              </Grid>
              <Grid item xs={6} sm={3} key={"demographics-content"}>
                <Demographics
                  stats={data.analyses.analysesStats}
                  key={"demographics"}
                />
              </Grid>
            </Grid>
          );
        }
      }}
    </Query>
  );
};

export default withStyles(styles)(ProjectViewContent);
