import React from "react";
import * as d3 from "d3";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";

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
const Search = ({ analysisList, dispatch, handleForwardStep }) => {
  const classes = useStyles();
  return (
    <Autocomplete
      classes={classes}
      options={analysisList}
      getOptionLabel={option => option.name}
      style={{ width: 300 }}
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
  );
};
export default Search;
