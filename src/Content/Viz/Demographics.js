import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import styled from "@emotion/styled";

class Demographics extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    var { stats } = this.props;
    var newStat = stats ? stats : [];
    return (
      <SummaryDiv>
        <Typography
          style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
          variant="h4"
        >
          Analyses Statistics
        </Typography>
        {newStat.map(field => {
          return <AverageStats label={field.label} value={field.value} />;
        })}
      </SummaryDiv>
    );
  }
}
const AverageStats = ({ value, label }) => (
  <StatWrapperDiv>
    <Typography style={{ color: "white" }} variant="h3">
      {value}
    </Typography>
    <Typography style={{ color: "white" }} variant="h6">
      {label}s
    </Typography>
  </StatWrapperDiv>
);

const StatTypography = styled(Typography)`
  color: white !important;
`;
const StatWrapperDiv = styled("div")`
  padding: 15px;
`;

const SummaryDiv = styled("div")`
  width: 15vw !important;
  height: 100vh;
  float: right;
  position: fixed;
  right: 0;
  top: 50px;
  background: #394a69;
  flex-direction: column;
  padding: 25px;
`;
export default Demographics;
