import React from "react";
import * as d3 from "d3";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";

const svgLabelMatching = {
  SA609X3X8MB03073: "SA609 Mixture A",
  SA532X1XB00118: "SA532",
  SA039Mx2SA906b0: "Cell Line Mixture A",
  SA535X5XB02895: "SA535",
  SA609X1XB00290: "SA609",
  SA609X3X8XB03076: "Mixture B",
  SA1035X4XB02879: "SA1035",
  "Cell Line": "Cell Line"
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
            label="Search by Analyses"
            variant="outlined"
          />
        )}
      />
      <Autocomplete
        classes={classes}
        options={sampleList}
        getOptionLabel={option => svgLabelMatching[option.name]}
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
            label="Search by Lineage"
            variant="outlined"
          />
        )}
      />
    </span>
  );
};
export default Search;
