import React, { useState, useMemo } from "react";
import * as d3 from "d3";

import { makeStyles } from "@material-ui/styles";

import Button from "@material-ui/core/Button";
import ClearIcon from "@material-ui/icons/Clear";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import TableCell from "@material-ui/core/TableCell";
import TableSortLabel from "@material-ui/core/TableSortLabel";

import GetAppIcon from "@material-ui/icons/GetApp";

import { Query } from "react-apollo";
import gql from "graphql-tag";
import CircularProgress from "@material-ui/core/CircularProgress";

import * as d3Dsv from "d3-dsv";

import MUIDataTable from "mui-datatables";

const METADATA_QUERY = gql`
  query metaDataTable($analysis: String!) {
    metaDataTable(analysis: $analysis) {
      lysisBuffer
      lysisTime
      protease
      presoakTime
      pcrCycles
      sampleType
      experimentalCondition
      stain
      tagAmount
    }
  }
`;
const formatCols = ["experimental_condition", "jira_ticket"];
const labelFormatMapping = {
  lysisBuffer: "Lysis Buffer",
  lysisTime: "Lysis Time",
  protease: "Protease",
  presoakTime: "Presoak Time",
  pcrCycles: "PRC Cycles",
  sampleType: "Sample Type",
  experimentalCondition: "Experimental Condition",
  stain: "Stain",
  tagAmount: "Tag Amount"
};
const useStyles = makeStyles({
  root: {
    head: { backgroundColor: "rgba(255, 7, 0, 0.55)" },
    backgroundColor: "rgba(255, 7, 0, 0.55)",
    ".MuiTableHead-root": {
      backgroundColor: "rgba(255, 7, 0, 0.55)"
    }
  },
  head: {
    backgroundColor: "rgba(255, 7, 0, 0.55)"
  }
});
const formatDecimal = [num => num.toExponential(2), d3.format(",.4f")];

const MetaDataTable = ({ analysis }) => {
  const classes = useStyles();
  const [filterText, setFilterText] = useState("");
  const columns = Object.keys(labelFormatMapping);

  return (
    <Query
      query={METADATA_QUERY}
      variables={{
        analysis
      }}
    >
      {({ loading, error, data }) => {
        if (error) return null;
        if (loading && Object.keys(data).length === 0) {
          return <CircularProgress />;
        }
        const { metaDataTable } = data;
        return (
          <Grid
            item
            style={{
              overflowY: "hidden",
              height: 450,
              width: 1000
            }}
          >
            <MUIDataTable
              title={"Meta Data"}
              classes={{ head: classes.head }}
              subHeader
              fixedHeader
              noHeader
              defaultSortAsc
              overflowY
              columns={columns.map((col, formatIndex) => {
                return {
                  name: col,
                  label: labelFormatMapping[col],
                  selector: labelFormatMapping[col],
                  sortable: true,
                  right: false,
                  customHeadRender: (
                    columnMeta,
                    handleToggleColumn,
                    sortOrder
                  ) => {
                    console.log(columnMeta);
                    return (
                      <TableCell style={{ backgroundColor: "blue" }}>
                        <TableSortLabel>value</TableSortLabel>
                      </TableCell>
                    );
                  },
                  cell: row => (
                    <span style={{ backgroundColor: "blue" }}>{row[col]}</span>
                  )
                };
              })}
              data={metaDataTable}
              options={{
                viewColumns: false,
                selectableRowsHideCheckboxes: true,
                search: false,
                print: false,
                filter: false,
                elevation: 0,
                pagination: false
              }}
            />
          </Grid>
        );
      }}
    </Query>
  );
};

const FilterComponent = ({ data, analysis }) => (
  <div style={{ display: "flex", width: "100%", marginBottom: 15 }}>
    <Button
      variant="outlined"
      label="Download"
      id="tsv-download"
      onClick={() => {
        const dataSource = new Blob([d3Dsv.tsvFormat(data)], {
          type: "text/tsv"
        });
        const tsvURL = window.URL.createObjectURL(dataSource);
        const tempLink = document.createElement("a");
        tempLink.href = tsvURL;
        tempLink.setAttribute("download", analysis + "metadata.tsv");
        tempLink.click();
      }}
      color="secondary"
      style={{ marginLeft: 15, right: 0, position: "absolute" }}
    >
      <GetAppIcon />
    </Button>
  </div>
);
export default MetaDataTable;
