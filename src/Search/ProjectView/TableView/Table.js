import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import DataGrid from "react-data-grid";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { matchSorter } from "match-sorter";

import Autocomplete from "@mui/material/Autocomplete";

import { useDashboardState } from "../ProjectState/dashboardState";
import table from "./table.css";

const Table = ({ handleForwardStep, columns, rows, project }) => {
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
        paddingLeft: 5,
        backgroundColor: "#e5b151"
      }}
    >
      {column["name"]}
    </p>
  );

  const RowRender = ({ row, rowIdx, column }) =>
    column["key"] === "sample_id" ? (
      <a
        id={"link-" + row["dashboard_id"] + "-" + row["sample_id"]}
        style={{
          color: "black",
          fontSize: 18,
          paddingLeft: 5,
          cursor: "pointer",
          textDecoration: "underline"
        }}
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
          color: "black",
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
    <Grid
      container
      direction="column"
      justifyContent="flex-start"
      alignItems="center"
    >
      <Grid
        item
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography
          variant={"h3"}
          sx={{
            float: "left",
            color: "black",
            m: 0,
            p: 0,
            ml: "50px !important",
            fontFamily: "MyFont"
          }}
        >
          {project}
        </Typography>
        <Autocomplete
          sx={{
            marginRight: "100vw-1200px/2 !important",
            marginBottom: "10px !important"
          }}
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
                className: table.input
              }}
            />
          )}
        />
      </Grid>
      <div
        style={{
          height: 700,
          width: "85vw",
          marginLeft: 50,
          "& div[role=grid]": { borderRadius: 5 },
          "& div": { backgroundColor: "#90909380", padding: 0 },
          "& div[role=columnheader]": { padding: 0 }
        }}
        className={table.table}
        id={"searchTable"}
      >
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
          className={table.root}
          style={{
            height: "100%",
            width: "100%",
            padding: 0,
            border: "0px !important",
            "& div[role=columnheader]": { padding: 0 },
            "& div": { backgroundColor: "#90909380", padding: 0 }
          }}
          hideFooter
          draggable={true}
          scrollBarSize={30}
        />
      </div>
    </Grid>
  );
};
export default Table;
