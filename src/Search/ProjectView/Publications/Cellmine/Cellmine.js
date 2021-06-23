import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import "./index.css";

import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";

import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import Grid from "@material-ui/core/Grid";
//import { PackingCircles } from "@shahlab/planetarium";
import PackingCircles from "./PackingCircles.js";

import { matchSorter } from "match-sorter";
import cellCount from "./cellCount.png";

const getDataByKey = (data, key) =>
  [...new Set(data.map(row => row[key]).flat(1))].sort((a, b) =>
    a.localeCompare(b, "en", { numeric: true })
  );

const Cellmine = ({ data, handleForwardStep, dispatch }) => {
  const [selected, setSelected] = useState({});
  useEffect(() => {
    d3.selectAll("#root").classed("whiteBackground", false);
    d3.selectAll("#root").classed("blackBackground", true);
  }, []);

  const [modifiedData, setModifiedData] = useState([]);

  useEffect(() => {
    if (data.length > 0) {
      setModifiedData(data);
    }
  }, [data]);

  const handleFilterChange = (data, value, type) => {
    setSelected({ ...selected, [type]: value });
  };

  const filter = (data, keys, { inputValue }) => {
    return matchSorter(data, inputValue, {
      keys: [...keys]
    });
  };

  const filterOptions = (d, params, key) => {
    if (params.inputValue === null) {
      const newSelected = selected;
      delete newSelected[key];
      setSelected({ ...newSelected });

      if (Object.keys(newSelected).length === 0) {
        setModifiedData(data);
      } else {
        const filtered = Object.keys(newSelected).reduce(
          (final, key) =>
            filter(final, [key], {
              inputValue: newSelected[key]
            }),
          [...data]
        );
        setModifiedData(filtered);
      }
      return getDataByKey(data, key);
    } else if (params.inputValue !== "") {
      const newSelected = { ...selected, [key]: params.inputValue };

      setSelected({ ...newSelected });

      const filtered = Object.keys(newSelected).reduce(
        (final, key) =>
          filter(final, [key], {
            inputValue: newSelected[key]
          }),
        [...data]
      );

      setModifiedData(filtered);
      return getDataByKey(filtered, key);
    } else {
      return getDataByKey(modifiedData, key);
    }
  };

  return (
    <Grid
      container
      direction="row"
      justify="flex-start"
      alignItems="flex-start"
      spacing={1}
      style={{ width: "100%", height: "100%" }}
    >
      <Grid style={{ margin: 50 }} xs={3} item>
        <Typography variant="h5" component="h2" style={{ color: "white" }}>
          Filter:
        </Typography>

        <Search
          data={[...getDataByKey(modifiedData, "jira_ticket")]}
          selectedOption={selected["jira_ticket"] || null}
          filterOptions={filterOptions}
          type="jira_ticket"
          title="Analysis Ticket"
          selectOption={option =>
            handleFilterChange(modifiedData, option, "jira_ticket")
          }
        />
        <Search
          data={[
            ...getDataByKey(modifiedData, "pathology_disease_name")
          ].sort((a, b) => a.localeCompare(b))}
          filterOptions={filterOptions}
          type="pathology_disease_name"
          title="Tumour Type"
          selectedOption={selected["pathology_disease_name"] || null}
          selectOption={option =>
            handleFilterChange(modifiedData, option, "pathology_disease_name")
          }
        />
        <Search
          data={[...getDataByKey(modifiedData, "pool_id")]}
          filterOptions={filterOptions}
          type="pool_id"
          title="Library"
          selectedOption={selected["pool_id"] || null}
          selectOption={option =>
            handleFilterChange(modifiedData, option, "pool_id")
          }
        />
        <Search
          data={[...getDataByKey(modifiedData, "additional_pathology_info")]}
          filterOptions={filterOptions}
          type="additional_pathology_info"
          title="Subtype"
          selectedOption={selected["additional_pathology_info"] || null}
          selectOption={option =>
            handleFilterChange(
              modifiedData,
              option,
              "additional_pathology_info"
            )
          }
        />
        {modifiedData.length && (
          <RadioOptions
            options={[...getDataByKey(data, "taxonomy_id")]}
            filterOptions={filterOptions}
            type="taxonomy_id"
            title="Taxonomy"
            selectOption={option => {
              return filterOptions(data, { inputValue: option }, "taxonomy_id");
            }}
          />
        )}
        <div style={{ marginTop: 45 }}>
          <FormLabel style={{ paddingLeft: 15, color: "white" }}>
            Cell Count
          </FormLabel>
        </div>
        <img
          src={cellCount}
          width={300}
          height={156}
          style={{ transform: "scale(0.8)", width: 300, height: 156 }}
        />
      </Grid>
      <Grid
        style={{ marginTop: 100, textAlign: "center", margin: "auto" }}
        xs={7}
        item
      >
        <div style={{ position: "relative", margin: "auto" }}>
          {modifiedData && modifiedData.length && (
            <PackingCircles
              modifiedData={modifiedData ? modifiedData : []}
              chartDim={{
                height: 600,
                width: 750
              }}
              selectAnalysis={d => {
                dispatch({
                  type: "ANALYSIS_SELECT",
                  value: { selectedAnalysis: d.jira_ticket }
                });
                handleForwardStep();
              }}
            />
          )}
        </div>
        <div>
          <Typography
            variant="h2"
            style={{
              position: "absolute",
              float: "right",
              top: 20,
              right: 0,
              color: "white"
            }}
          >
            Cellmine
          </Typography>
        </div>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  inputRoot: {
    marginBottom: 15,
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
const RadioOptions = ({ options, title, selectOption }) => {
  const [value, setValue] = React.useState(null);

  const handleChange = event => {
    if (event.target.value === value) {
      selectOption(null);
      setValue("");
    } else {
      selectOption(event.target.value);
      setValue(event.target.value);
    }
  };
  return (
    <FormControl
      component="fieldset"
      style={{ paddingLeft: 15, color: "white" }}
    >
      <FormLabel component="legend" style={{ color: "white" }}>
        {title}
      </FormLabel>
      <RadioGroup key={title + "-radio"} value={value}>
        {options.map(option => (
          <FormControlLabel
            value={option}
            control={
              <Radio style={{ color: "white" }} onClick={handleChange} />
            }
            label={option}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};
const Search = ({
  data,
  selectOption,
  selectedOption,
  title,
  type,
  filterOptions
}) => {
  const classes = useStyles();

  return (
    <Autocomplete
      classes={classes}
      options={[...data]}
      value={selectedOption}
      getOptionLabel={option => option}
      style={{ width: 300, color: "white" }}
      renderOption={option => option}
      onChange={(event, option) => {
        filterOptions(data, { inputValue: option }, type);
      }}
      filterOptions={(options, params) => filterOptions(options, params, type)}
      renderInput={params => (
        <TextField
          {...params}
          InputLabelProps={{
            style: { color: "white" }
          }}
          label={title}
          variant="outlined"
        />
      )}
    />
  );
};
export default Cellmine;
