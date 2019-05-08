import React, {Component} from "react";
import {Menu, Sidebar, Header} from "semantic-ui-react";
import Filters from "./Filters.js";
import SearchField from "./SearchField";

import _ from "lodash";

const dropdownLabels = {
  index: "Jira ID",
  title: "Sample ID"
};
class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const {innerRef, visible, allDashboards} = this.props;

    var dashboards = allDashboards.map(dashboard => {
      return _.pick(dashboard, Object.keys(dropdownLabels));
    });
    return (
      <Sidebar
        animation="overlay"
        as={Menu}
        icon="labeled"
        inverted
        target={innerRef}
        onHide={this.handleSidebarHide}
        vertical
        visible={visible}
        width="very wide"
      >
        <Header as="h2" style={{marginTop: "20px"}}>
          Select a library
        </Header>
        <Filters dashboards={dashboards} dropdownLabels={dropdownLabels} />

        <SearchField />
      </Sidebar>
    );
  }
}
export default Search;
