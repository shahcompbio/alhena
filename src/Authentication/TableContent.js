import React, { useState } from "react";
import { withStyles } from "@material-ui/styles";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";

import Checkbox from "@material-ui/core/Checkbox";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import FormControl from "@material-ui/core/FormControl";

import clsx from "clsx";

const rowLabels = {
  username: "Username",
  roles: "Readable Dashboards",
  full_name: "Name",
  email: "Email",
  name: "Name",
  count: "Analyses Count"
};

const editableRows = { roles: true };

const styles = theme => ({
  select: {
    "&:before": {
      borderColor: "#ffffff"
    }
  }
});

const TableContent = ({
  classes,
  history,
  modifiedData,
  handleRowClick,
  selected,
  tabIndex,
  allRoles,
  setSelectedUserRoles,
  isEditing
}) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const isSelected = name => selected === name;
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const tableConfig =
    tabIndex === 0 ? { rowType: "username" } : { rowType: "name" };

  const isSelectedForEditing = (name, row) =>
    selected === name && isEditing && editableRows.hasOwnProperty(row);

  const tableHeadings =
    modifiedData.length > 0
      ? Object.keys(modifiedData[0]).filter(heading => heading !== "__typename")
      : [];
  const colorClass = tabIndex === 0 ? classes.checkBox0 : classes.checkBox1;

  return [
    <Table className={classes.table} size="small">
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox"></TableCell>
          <TableHeadings
            classes={classes}
            tableHeadings={tableHeadings}
            colorClass={colorClass}
          />
        </TableRow>
      </TableHead>
      <TableBody>
        {modifiedData.length === 0
          ? []
          : modifiedData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const name = row[tableConfig.rowType];

                const labelId = `enhanced-table-checkbox-${index}`;
                const isItemSelected = isSelected(name);

                return (
                  <TableRow
                    className={colorClass}
                    classes={{ selected: classes.selected }}
                    key={"permissions-row-" + name}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        className={
                          tabIndex === 0 ? classes.checkBox0 : classes.checkBox1
                        }
                        id="check"
                        checked={isItemSelected}
                        onClick={event => handleRowClick(name)}
                        inputProps={{ "aria-labelledby": labelId }}
                      />
                    </TableCell>
                    {tableHeadings.map((heading, headingIndex) => {
                      var aligned = headingIndex === 0 ? "left" : "right";

                      return (
                        <TableCell
                          align={aligned}
                          component="th"
                          scope="row"
                          id={labelId}
                          className={[classes.tableCell, colorClass]}
                          key={labelId + heading + row[tableConfig.rowType]}
                        >
                          {isSelectedForEditing(
                            row[tableConfig.rowType],
                            heading
                          ) ? (
                            <DropDownEdit
                              setNewUserRoles={roles =>
                                setSelectedUserRoles([...roles])
                              }
                              currentSelection={row[heading]}
                              allRoles={allRoles}
                              classes={classes}
                            />
                          ) : Array.isArray(row[heading]) ? (
                            row[heading].join(", ")
                          ) : (
                            row[heading]
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
      </TableBody>
    </Table>,
    <TablePagination
      component="div"
      count={modifiedData.length}
      rowsPerPage={rowsPerPage}
      page={page}
      rowsPerPageOptions={[]}
      backIconButtonProps={{
        "aria-label": "previous page"
      }}
      nextIconButtonProps={{
        "aria-label": "next page"
      }}
      className={[classes.tablePagination, colorClass]}
      onChangePage={handleChangePage}
    />
  ];
};
const TableHeadings = ({ classes, tableHeadings, colorClass }) =>
  tableHeadings.map((heading, headingIndex) => {
    var aligned = headingIndex === 0 ? "left" : "right";
    return (
      <TableCell
        align={aligned}
        key={"permissions-heading" + heading}
        className={clsx(classes.tableCell, classes.tableHeader, colorClass)}
      >
        {rowLabels[heading]}
      </TableCell>
    );
  });
const DropDownEdit = ({
  currentSelection,
  allRoles,
  setNewUserRoles,
  classes
}) => {
  const [selectedRoles, setSelectedRoles] = useState([...currentSelection]);
  return (
    <FormControl required style={{ width: "100%" }}>
      <Select
        multiple
        value={selectedRoles}
        onChange={event => {
          setSelectedRoles(event.target.value);
          setNewUserRoles(event.target.value);
        }}
        className={classes.select}
        input={
          <Input
            id="select-multiple-placeholder"
            style={{ color: "#ffffff" }}
          />
        }
      >
        {allRoles.map(role => (
          <MenuItem value={role} key={role}>
            {role}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export default withStyles(styles)(TableContent);
