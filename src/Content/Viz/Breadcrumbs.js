import React, { Component } from "react";

import Typography from "@material-ui/core/Typography";
import styled from "@emotion/styled";
const hierarchy = ["project", "sampleID", "libraryID", "jiraID"];
const hierarchyDefaultLabels = {
  project: "Project",
  sampleID: "Sample ID",
  libraryID: "Library ID",
  jiraID: "Jira Ticket"
};
class Breadcrumbs extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }
  render() {
    var { choosenLevels, revertLevels } = this.props;

    var joinedLevels = hierarchy.reduce((final, level) => {
      final[level] =
        choosenLevels[level] !== null
          ? choosenLevels[level]
          : hierarchyDefaultLabels[level];
      return final;
    }, {});

    return (
      <BreadcrumbsWrapper>
        {hierarchy.map((level, i) => (
          <TypographyHeader
            variant="h5"
            onClick={() => revertLevels(this, i)}
            style={
              choosenLevels[level] !== null
                ? { fontWeight: "bold", color: "black" }
                : {}
            }
          >
            {" "}
            {" " + joinedLevels[level] + " > "}{" "}
          </TypographyHeader>
        ))}
      </BreadcrumbsWrapper>
    );
  }
}

const TypographyHeader = styled(Typography)`
  black: white !important;
  opacity: 0.6;
`;
const BreadcrumbsWrapper = styled("div")`
  margin-top: 25px;
  padding-left: 20px;
  float: left;
  top: 0;
  left: 15px;
  display: flex;
  flex-direction: row;
`;

export default Breadcrumbs;
