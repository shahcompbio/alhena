import _ from "lodash";
import React, {Component} from "react";

import {Accordion, Header, Dropdown} from "semantic-ui-react";

class Filters extends Component {
  constructor(props) {
    super(props);

    this.state = {activeIndex: 0};
  }

  render() {
    const {dashboards, dropdownLabels} = this.props;

    const filterTypes = Object.keys(dropdownLabels);
    const panels = _.times(filterTypes.length, i => ({
      key: `panel-${i}`,
      content: {
        content: (
          <Dropdown
            placeholder="Select Jira ID"
            fluid
            search
            pointing
            selection
            options={[
              ...new Set(
                dashboards.map(dashboard => {
                  return dashboard[filterTypes[i]];
                })
              )
            ].map(value => {
              return {
                key: value,
                value: value,
                text: value
              };
            })}
          />
        )
      },
      title: {
        style: {
          pointerEvents: "none"
        },
        icon: null,
        content: (
          <Header as="h3" index={i} style={{float: "right"}}>
            {dropdownLabels[filterTypes[i]]}
          </Header>
        )
      }
    }));
    return (
      <Accordion
        style={{backgroundColor: "white"}}
        defaultActiveIndex={Array.from(Array(filterTypes.length).keys())}
        onTitleClick={null}
        panels={panels}
        exclusive={false}
        styled
        fluid
      />
    );
  }
}
export default Filters;
