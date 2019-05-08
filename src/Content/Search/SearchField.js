import React, {Component} from "react";

import {Search, Container, Header} from "semantic-ui-react";

class SearchField extends Component {
  constructor(props) {
    super(props);

    this.state = {isLoading: true, value: "", results: ""};
  }

  render() {
    const {isLoading, value, results} = this.state;
    return (
      <Container
        style={{backgroundColor: "white", height: "38px", margin: "5px"}}
        fluid
      >
        {" "}
        <Header as="h3" style={{margin: "20px 13px 5px", textAlign: "right"}}>
          Search
        </Header>
        <Search
          fluid
          input={{fluid: true}}
          className={"squareInput"}
          loading={isLoading}
          results={results}
          value={value}
        />
      </Container>
    );
  }
}
export default SearchField;
