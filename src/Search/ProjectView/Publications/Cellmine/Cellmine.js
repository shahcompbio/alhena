import React, { useState, useEffect } from "react";

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
import { PackingCircles } from "@shahlab/planetarium";

import { matchSorter } from "match-sorter";

const getDataByKey = (data, key) => [
  ...new Set(data.map(row => row[key]).flat(1))
];

const Cellmine = ({ data }) => {
  const [selected, setSelected] = useState({});

  const [modifiedData, setModifiedData] = useState([]);

  useEffect(() => {
    if (data.length > 0) {
      setModifiedData(data);
    }
  }, [data]);

  console.log(modifiedData);
  console.log(data);
  const handleFilterChange = (data, value, type) => {
    setSelected({ ...selected, [type]: value });
  };
  const filter = (data, keys, { inputValue }) => {
    return matchSorter(data, inputValue, {
      keys: [...keys]
    });
  };

  const filterOptions = (options, params, key) => {
    if (params.inputValue === null) {
      const newSelected = { ...selected, [key]: null };
      setSelected({ ...newSelected });
      const searchParams = Object.keys(newSelected)
        .map(key => newSelected[key])
        .filter(key => key !== null);
      if (searchParams.length === 0) {
        setModifiedData([...data]);
      } else {
        const filtered = filter(data, Object.keys(newSelected), searchParams);
        if (filtered.length !== modifiedData.length) {
          setModifiedData([...filtered]);
        }
      }
    } else if (params.inputValue !== "") {
      const newSelected = { ...selected, [key]: params.inputValue };
      setSelected({ ...newSelected });

      const filtered = filter(modifiedData, [key], params);

      if (filtered.length !== modifiedData.length) {
        setModifiedData([...filtered]);
      }
      return getDataByKey(filtered, key);
    } else {
      return getDataByKey(modifiedData, key);
    }
  };

  return (
    <Grid
      container
      direction="column"
      justify="flex-start"
      alignItems="flex-start"
    >
      <Grid
        item
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        <Grid style={{ margin: 15 }}>
          <Typography variant="h5" component="h2">
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
            data={[...getDataByKey(modifiedData, "pathology_disease_name")]}
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
        </Grid>
        {modifiedData.length && (
          <PackingCircles
            modifiedData={modifiedData}
            chartDim={{
              height: 800,
              width: 950
            }}
          />
        )}
      </Grid>
    </Grid>
  );
};
/*          <RadioOptions
            options={[...getDataByKey(modifiedData, "taxonomy_id")]}
            filterOptions={filterOptions}
            type="taxonomy_id"
            title="Taxonomy"
            selectOption={option => {
              return filterOptions(
                modifiedData,
                { inputValue: option },
                "taxonomy_id"
              );
            }}
          />*/
const useStyles = makeStyles(theme => ({
  inputRoot: {
    marginBottom: 15,
    "& .MuiAutocomplete-popupIndicator": { color: "black" },
    color: "black",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "black"
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "black"
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "black"
    },
    "& .MuiInputLabel-formControl": {
      color: "black"
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
    <FormControl component="fieldset">
      <FormLabel component="legend">{title}</FormLabel>
      <RadioGroup key={title + "-radio"} value={value}>
        {options.map(option => (
          <FormControlLabel
            value={option}
            control={<Radio onClick={handleChange} />}
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
      options={data}
      value={selectedOption}
      getOptionLabel={option => option}
      style={{ width: 300 }}
      renderOption={option => option}
      onChange={(event, option) => {
        filterOptions(data, { inputValue: option }, type);
      }}
      filterOptions={(options, params) => filterOptions(options, params, type)}
      renderInput={params => (
        <TextField
          {...params}
          InputLabelProps={{
            style: { color: "#black" }
          }}
          label={title}
          variant="outlined"
        />
      )}
    />
  );
};
export default Cellmine;
