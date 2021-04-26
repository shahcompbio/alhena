import React from "react";
import * as d3 from "d3";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";
const svgLabelMatching = {
  SA609X3X8MB03073: "imgSA609X3X8MB03073",
  SA532X1XB00118: "imgSA532X1XB00118",
  SA039Mx2SA906b0: "imgSA039Mx2SA906b0",
  SA535X5XB02895: "imgSA535X5XB02895",
  SA609X1XB00290: "imgSA609X1XB00290",
  SA609X3X8XB03076: "imgSA609X3X8XB03076",
  SA1035X4XB02879: "imgSA1035X4XB02879",
  CellLine: "Cell Line"
};
const useStyles = makeStyles(theme => ({
  inputRoot: {
    "& .MuiAutocomplete-popupIndicator": { color: "white" },
    color: "white",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "white"
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "white"
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "white"
    },
    "& .MuiInputLabel-formControl": {
      color: "white"
    }
  }
}));
const Search = ({
  analysisList,
  sampleList,
  goToSample,
  dispatch,
  handleForwardStep
}) => {
  const classes = useStyles();
  console.log(sampleList);
  return (
    <span>
      <Autocomplete
        classes={classes}
        options={analysisList}
        getOptionLabel={option => option.name}
        style={{ width: 300, marginBottom: 10 }}
        onChange={(event, option) => {
          d3.select("#root").classed("blackBackground", false);
          dispatch({
            type: "ANALYSIS_SELECT",
            value: { selectedAnalysis: option.name }
          });
          handleForwardStep();
        }}
        renderInput={params => (
          <TextField
            {...params}
            InputLabelProps={{
              style: { color: "#fff" }
            }}
            label="Search Analyses"
            variant="outlined"
          />
        )}
      />
      <Autocomplete
        classes={classes}
        options={sampleList}
        getOptionLabel={option => option.name}
        style={{ width: 300 }}
        onChange={(event, option) => {
          if (option) {
            goToSample(option.name);
          }
        }}
        renderInput={params => (
          <TextField
            {...params}
            InputLabelProps={{
              style: { color: "#fff" }
            }}
            label="Search by Sample"
            variant="outlined"
          />
        )}
      />
    </span>
  );
};
export default Search;
