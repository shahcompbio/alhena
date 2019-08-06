import React, { Component, createRef } from "react";
import Search from "./Search/Search.js";
import Demographics from "./Viz/Demographics.js";
import styled from "@emotion/styled";

import { withStyles } from "@material-ui/styles";

import PackingCircles from "./Viz/PackingCircles";

import { Query } from "react-apollo";
import { graphql } from "react-apollo";
import { getAllSunburstAnalyses, getAllFilters } from "../Queries/queries.js";

import Drawer from "@material-ui/core/Drawer";
import Grid from "@material-ui/core/Grid";
const drawerWidth = 400;
const styles = {
  root: { flexGrow: 1 },
  hide: {
    display: "none"
  }
};

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarIsVisible: true,
      filters: [],
      previousDataTree: null,
      selectedOptions: {},
      key: 1
    };
  }

  handleVizChange = (value, label, action) => {
    var { selectedOptions, filters } = this.state;
    if (action.localeCompare("clear") !== 0) {
      selectedOptions[label] = {
        value: label,
        label: value
      };

      this.setState({
        filters: [...filters, { value: value, label: label }],
        selectedOptions: { ...selectedOptions }
      });
    }
  };

  handleFilterChange = (filter, type) => {
    var { selectedOptions, filters } = this.state;

    if (filter && type.localeCompare("clear") !== 0) {
      selectedOptions[filter.label] = {
        value: filter.label,
        label: filter.value
      };

      this.setState({
        filters: [...filters, filter],
        selectedOptions: { ...selectedOptions }
      });
    } else {
      var newFilters = filters.filter((value, i) => value.label !== filter);
      delete selectedOptions[filter];

      this.setState({
        selectedOptions: { ...selectedOptions },
        filters: [...newFilters]
      });
    }
  };

  render() {
    const { classes } = this.props;
    const { filters, selectedOptions } = this.state;
    return (
      <Query query={getAllSunburstAnalyses} variables={{ filter: filters }}>
        {({ loading, error, data }) => {
          if (error) return null;
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
                    handleFilterChange={null}
                  />
                </Grid>
                <Grid item xs={18} sm={9} key={"grid-content"}>
                  <div>
                    <PackingCircles
                      isLoading={true}
                      key={"packing-circles"}
                      filters={[]}
                      analyses={{}}
                      handleVizChange={null}
                    />
                    <Demographics stats={null} key={"demographics"} />
                  </div>
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
                    filters={data.analysesList}
                    handleFilterChange={(selection, type) =>
                      this.handleFilterChange(selection, type)
                    }
                  />
                </Grid>
                <Grid item xs={18} sm={9} key={"grid-content"}>
                  <div>
                    <PackingCircles
                      isLoading={false}
                      key={"packing-circles"}
                      filters={filters}
                      analyses={data.analysesTree.children}
                      handleVizChange={(value, label, action) =>
                        this.handleVizChange(value, label, action)
                      }
                    />
                    <Demographics
                      stats={data.analysesStats}
                      key={"demographics"}
                    />
                  </div>
                </Grid>
              </Grid>
            );
          }
        }}
      </Query>
    );
  }
}

export default withStyles(styles)(Content);
