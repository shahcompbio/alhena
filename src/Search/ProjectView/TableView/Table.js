import * as React from "react";
import { DataGrid } from "@material-ui/data-grid";

import { withStyles } from "@material-ui/styles";
import { useDashboardState } from "../ProjectState/dashboardState";

const styles = {
  root: { color: "white" },
  wrapper: { height: 500, width: 500 }
};

const Table = ({ handleForwardStep, classes, columns, rows }) => {
  const [{}, dispatch] = useDashboardState();
  return (
    <div className={classes.wrapper}>
      <DataGrid
        rows={rows.map(row => ({ ...row, id: row["jira_id"] }))}
        columns={columns.map(field => ({
          field: field["type"],
          headerName: field["label"],
          width: 500 / columns.length
        }))}
        onRowClick={({ row }) => {
          dispatch({
            type: "ANALYSIS_SELECT",
            value: { selectedAnalysis: row["jira_id"], metaData: { ...row } }
          });

          handleForwardStep();
        }}
        className={classes.root}
        pageSize={5}
      />
    </div>
  );
};

export default withStyles(styles)(Table);
