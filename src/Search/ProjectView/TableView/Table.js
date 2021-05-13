import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { DataGrid } from "@material-ui/data-grid";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import { matchSorter } from "match-sorter";

import Autocomplete, {
  createFilterOptions
} from "@material-ui/lab/Autocomplete";

import { withStyles } from "@material-ui/styles";
import { useDashboardState } from "../ProjectState/dashboardState";

const styles = {
  root: {
    height: 600,
    color: "white",
    cursor: "pointer",
    fontWeight: "normal",
    resize: "horizontal",
    overflowX: "overlay",
    overflowY: "scroll",
    borderRight: "1px solid"
  },
  input: { color: "#23bbbb !important" },
  wrapper: { height: 750, width: 1200 },
  header: { backgroundColor: "#afafafd9" },
  search: {
    float: "right",
    marginLeft: 900,
    marginBottom: 10,
    right: 0
  }
};

const Table = ({ handleForwardStep, classes, columns, rows }) => {
  const [{}, dispatch] = useDashboardState();
  const [searchValue, setValue] = useState(null);
  const [tableRows, setTableRows] = useState([]);
  useEffect(() => {
    if (rows && rows.length > 0) {
      setTableRows([...rows]);
    }
  }, [rows]);

  const filterOptions = (options, { inputValue }) => {
    return matchSorter(options, inputValue, {
      keys: ["project", "sample_id", "library_id", "jira_id"]
    });
  };
  return (
    <Grid container direction="column" justify="flex-start" alignItems="center">
      <Autocomplete
        className={classes.search}
        value={searchValue}
        onChange={(event, newValue) => {
          if (typeof newValue === "string") {
            setValue({
              title: newValue
            });
          } else {
            setValue(newValue);
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filterOptions(options, params);
          if (filtered.length !== tableRows.length) {
            setTableRows([...filtered]);
          }
          return filtered;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        id="search"
        options={rows}
        getOptionLabel={option => {
          return null;
        }}
        PopperComponent={() => null}
        renderOption={option => {
          return;
        }}
        style={{ width: 300 }}
        freeSolo
        renderInput={params => (
          <TextField
            {...params}
            label="Search"
            variant="outlined"
            InputProps={{
              className: classes.input
            }}
          />
        )}
      />
      <div className={classes.wrapper}>
        <DataGrid
          rows={tableRows.map(row => ({ ...row, id: row["jira_id"] }))}
          columns={columns.map(field => ({
            field: field["type"],
            headerName: field["label"],
            width:
              field["type"] === "jira_id"
                ? 700
                : field["type"] === "sample_id"
                ? 200
                : 150,
            flex: field["type"] === "sample" ? 1 : 0.2,
            renderCell: params => {
              return field["type"] === "sample_id" ? (
                <a
                  id={
                    "link-" +
                    params.getValue("jira_id") +
                    "-" +
                    params.getValue("sample_id")
                  }
                  style={{ color: "white" }}
                  href={"javascript:;"}
                  onMouseEnter={function(event, row) {
                    d3.select("#" + event.target.id).style(
                      "font-weight",
                      "bold"
                    );
                  }}
                  onMouseLeave={function(event, row) {
                    d3.select("#" + event.target.id).style(
                      "font-weight",
                      "normal"
                    );
                  }}
                  onClick={() => {
                    dispatch({
                      type: "ANALYSIS_SELECT",
                      value: { selectedAnalysis: params.getValue("jira_id") }
                    });
                    handleForwardStep();
                  }}
                >
                  {params.getValue("sample_id")}
                </a>
              ) : (
                <p style={{ cursor: "text" }}>
                  {params.getValue(field["type"])}
                </p>
              );
            },
            headerClassName: classes.header
          }))}
          rowHeight={40}
          className={classes.root}
          hideFooter
          draggable={true}
          scrollBarSize={30}
        />
      </div>
    </Grid>
  );
};

export default withStyles(styles)(Table);
