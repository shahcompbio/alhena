import React, {Component} from "react";
import Content from "./Content/Content.js";

import "./semantic/dist/semantic.min.css";
import "./App.css";

import styled from "@emotion/styled";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <BodyWrapper>
        <Content />
      </BodyWrapper>
    );
  }
}
const BodyWrapper = styled("div")``;

export default App;
