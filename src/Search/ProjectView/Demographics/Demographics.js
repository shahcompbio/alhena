import React from "react";
import Typography from "@mui/material/Typography";
import styled from "@emotion/styled";

const Demographics = ({ stats }) => {
  var newStat = stats ? stats : [];
  return (
    <SummaryDiv>
      <Typography
        style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
        variant="h4"
      >
        Analyses Statistics
      </Typography>
      {newStat
        .filter(field => field.label !== "Project")
        .map(field => {
          return <AverageStats label={field.label} value={field.value} />;
        })}
    </SummaryDiv>
  );
};

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

const StatWrapperDiv = styled("div")`
  padding: 15px;
`;

const SummaryDiv = styled("div")`
  width: 15vw !important;
  height: 100vh;
  float: right;
  position: fixed;
  text-align: end;
  right: 50px;
  top: 50px;
  flex-direction: column;
  padding: 25px;
`;
export default Demographics;
