import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import DataGrid from "react-data-grid";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { matchSorter } from "match-sorter";

import Autocomplete from "@material-ui/lab/Autocomplete";

import { withStyles } from "@material-ui/styles";
import { useDashboardState } from "../ProjectState/dashboardState";

const styles = {
  root: {
    height: 600,
    color: "white",
    backgroundColor: "#afafafd9",
    cursor: "pointer",
    fontWeight: "normal",
    resize: "horizontal",
    overflowX: "overlay",
    overflowY: "scroll",
    borderRight: "1px solid"
  },
  title: {
    float: "left",
    color: "white",
    margin: 0,
    padding: 0,
    marginLeft: 50
  },
  input: { color: "#23bbbb !important" },
  wrapper: {
    height: 750,
    width: 1200,
    "& div[role=grid]": { borderRadius: 5 },
    "& div": { backgroundColor: "#90909380", padding: 0 }
  },
  header: { backgroundColor: "#afafafd9" },
  search: {
    marginRight: "100vw-1200px/2",
    marginBottom: 10
  }
};

const Table = ({ handleForwardStep, classes, columns, rows, project }) => {
  const [{}, dispatch] = useDashboardState();
  const [searchValue, setValue] = useState(null);
  const [tableRows, setTableRows] = useState([]);

  useEffect(() => {
    if (rows && rows.length > 0) {
      setTableRows([...rows]);
    }
  }, [rows]);

  const HeaderRender = ({ column }) => (
    <p
      style={{
        cursor: "text",
        fontSize: 18,
        color: "black",
        margin: 0,
        paddingLeft: 10,
        backgroundColor: "#8aa3a7"
      }}
    >
      {column["key"]}
    </p>
  );

  const RowRender = ({ row, rowIdx, column }) =>
    column["key"] === "sample_id" ? (
      <a
        id={"link-" + row["dashboard_id"] + "-" + row["sample_id"]}
        style={{ color: "white", fontSize: 18, paddingLeft: 5 }}
        href={"javascript:;"}
        onMouseEnter={function(event, row) {
          d3.select("#" + event.target.id).style("font-weight", "bold");
        }}
        onMouseLeave={function(event, row) {
          d3.select("#" + event.target.id).style("font-weight", "normal");
        }}
        onClick={() => {
          dispatch({
            type: "ANALYSIS_SELECT",
            value: { selectedAnalysis: row["dashboard_id"] }
          });
          handleForwardStep();
        }}
      >
        {row["sample_id"]}
      </a>
    ) : (
      <p
        style={{
          cursor: "text",
          fontSize: 18,
          color: "white",
          margin: 0,
          paddingLeft: 5,
          userSelect: "all"
        }}
      >
        {row[column["key"]]}
      </p>
    );

  const filterOptions = (options, { inputValue }, columns) =>
    matchSorter(options, inputValue, {
      keys: ["project", ...columns.map(col => col["type"])]
    });

  return (
    <Grid container direction="column" justify="flex-start" alignItems="center">
      <Grid
        item
        container
        direction="row"
        justify="space-between"
        alignItems="center"
      >
        <Typography variant={"h3"} className={classes.title}>
          {project}
        </Typography>
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
            const filtered = filterOptions(options, params, columns);
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
      </Grid>
      <div className={classes.wrapper}>
        <DataGrid
          rows={tableRows.map(row => ({ ...row, id: row["dashboard_id"] }))}
          rowCount={tableRows.length}
          rowGetter={i => tableRows[i]}
          minHeight={600}
          columns={columns.map(field => ({
            key: field["type"],
            name: field["label"],
            resizable: true,
            formatter: RowRender,
            headerRenderer: HeaderRender,
            width: field["type"] === "dashboard_id" ? "40%" : null
          }))}
          rowHeight={40}
          headerRowHeight={50}
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
