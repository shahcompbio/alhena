import * as React from "react";
import { DataGrid } from "@material-ui/data-grid";

import { withStyles } from "@material-ui/styles";
import { useDashboardState } from "../ProjectState/dashboardState";

const styles = {
  root: { color: "white" },
  wrapper: { height: 530, width: 1200 },
  header: { backgroundColor: "#afafafd9" }
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
          width: field["type"] === "jira_id" ? 800 : 150,
          headerClassName: classes.header
        }))}
        onRowClick={({ row }) => {
          dispatch({
            type: "ANALYSIS_SELECT",
            value: { selectedAnalysis: row["jira_id"] }
          });

          handleForwardStep();
        }}
        className={classes.root}
        pageSize={8}
      />
    </div>
  );
};

export default withStyles(styles)(Table);
