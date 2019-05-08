import React, {Component, createRef} from "react";
import Dashboard from "./Dashboard/Dashboard.js";
import Search from "./Search/Search.js";
import styled from "@emotion/styled";
import StickyHeader from "./Header/StickyHeader";
import {Ref} from "semantic-ui-react";
import {graphql} from "react-apollo";
import {getAllDashboards} from "../Queries/queries.js";
import {Segment, Sidebar, Dimmer} from "semantic-ui-react";
class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarIsVisible: true
    };
  }
  segmentRef = createRef();
  closeSidebar = () => {
    if (this.state.sidebarIsVisible) {
      this.setState({sidebarIsVisible: false});
    }
  };
  openSidebar = () => {
    this.setState({sidebarIsVisible: true});
  };

  render() {
    const {data} = this.props;
    const {sidebarIsVisible} = this.state;
    if (data && data.loading) {
      return null;
    }

    if (data && data.error) {
      return null;
    }
    return (
      <ContentWrapper>
        <HeaderWrapper
          style={sidebarIsVisible ? {display: "none"} : {display: "inline"}}
        >
          <StickyHeader onSearchClick={e => this.openSidebar()} />
        </HeaderWrapper>
        <Sidebar.Pushable as={Segment.Group} raised>
          <Search
            allDashboards={data.getAllDashboards}
            innerRef={this.segmentRef}
            visible={sidebarIsVisible}
          />
          <Ref innerRef={this.segmentRef}>
            <Dimmer.Dimmable as={Segment} blurring dimmed={sidebarIsVisible}>
              <Sidebar.Pusher blurring onClick={this.closeSidebar}>
                <Dashboard />
              </Sidebar.Pusher>
            </Dimmer.Dimmable>
          </Ref>
        </Sidebar.Pushable>
      </ContentWrapper>
    );
  }
}
const HeaderWrapper = styled("div")``;
const ContentWrapper = styled("div")``;
export default graphql(getAllDashboards)(Content);
