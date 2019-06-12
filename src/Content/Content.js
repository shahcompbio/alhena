import React, { Component, createRef } from "react";
import Dashboard from "./Dashboard/Dashboard.js";
import Search from "./Search/Search.js";
import Demographics from "./Viz/Demographics.js";
import styled from "@emotion/styled";
import StickyHeader from "./Header/StickyHeader";

import { withStyles } from "@material-ui/styles";

import PackingCircles from "./Viz/PackingCircles";

import { Query } from "react-apollo";
import { graphql } from "react-apollo";
import { getAllSunburstAnalyses, getAllFilters } from "../Queries/queries.js";

import Drawer from "@material-ui/core/Drawer";
import Grid from "@material-ui/core/Grid";
const drawerWidth = 400;
const styles = {
  root: {
    flexGrow: 1
  },
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
      selectedOptions: {}
    };
  }

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
    const { sidebarIsVisible, filters, selectedOptions } = this.state;
    return (
      <Query query={getAllSunburstAnalyses} variables={{ filter: filters }}>
        {({ loading, error, data }) => {
          if (loading || error) return null;
          else {
            return (
              <Grid container className={classes.root} spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Search
                    selectedOptions={selectedOptions}
                    filters={data.analysesList}
                    visible={sidebarIsVisible}
                    handleFilterChange={(selection, type) =>
                      this.handleFilterChange(selection, type)
                    }
                  />
                </Grid>
                <Grid item xs={18} sm={9}>
                  <div>
                    <Demographics stats={data.analysesStats} />
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

const Viz = (analyses, visible, closeSidebar) => (
  <PackingCircles analyses={analyses} visible={visible} />
);

export default withStyles(styles)(Content);
