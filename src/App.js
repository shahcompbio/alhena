import React, { Component } from "react";
import Content from "./Content/Content.js";
import Header from "@bit/viz.spectrum.header";
import "./App.css";

import styled from "@emotion/styled";
const title = "Alhena";
const description =
  "Alhena is a single cell DNA (scDNA) dashboard for MSK SPECTRUM. It takes the CSV output from the single cell pipeline.";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <BodyWrapper>
        <Header title={title} description={description} />
        <ContentWrapper>
          <Content />
        </ContentWrapper>
      </BodyWrapper>
    );
  }
}
const BodyWrapper = styled("div")``;

const ContentWrapper = styled("div")`
  padding-top: 56px;
`;
export default App;
