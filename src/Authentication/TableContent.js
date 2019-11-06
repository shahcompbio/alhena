import React, { useState } from "react";
import { Query } from "react-apollo";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import TablePagination from "@material-ui/core/TablePagination";

import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import FormControl from "@material-ui/core/FormControl";

import DashboardPopup from "./DashboardPopup.js";

import clsx from "clsx";

const rowLabels = {
  username: "Username",
  roles: "Readable Dashboards",
  full_name: "Name",
  email: "Email",
  name: "Dashboard",
  count: "Analyses Count"
};
const editableRows = { roles: true };

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
    tabIndex === 0
      ? { rowType: "username" }
      : { rowType: "name", colour: "#ffffffc4" };

  const isSelectedForEditing = (name, row) =>
    selected === name && isEditing && editableRows.hasOwnProperty(row);

  const tableHeadings =
    modifiedData.length > 0
      ? Object.keys(modifiedData[0]).filter(heading => heading !== "__typename")
      : [];
  return [
    <Table className={classes.table} size="small">
      <TableHead>
        <TableRow className={classes.tableRow}>
          <TableCell padding="checkbox"></TableCell>
          {tableHeadings.map((heading, headingIndex) => {
            var aligned = headingIndex === 0 ? "left" : "right";

            return (
              <TableCell
                align={aligned}
                key={"permissions-heading" + heading}
                className={clsx(classes.tableCell, classes.tableHeader)}
              >
                {heading}
              </TableCell>
            );
          })}
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
                    className={classes.tableRow}
                    classes={{ selected: classes.selected }}
                    key={"permissions-row-" + name}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        style={{ color: tableConfig.colour }}
                        color={"default"}
                        checked={isItemSelected}
                        className={classes.checkBox}
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
                          className={classes.tableCell}
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
      className={classes.tablePagination}
      onChangePage={handleChangePage}
    />
  ];
};
const DropDownEdit = ({ currentSelection, allRoles, setNewUserRoles }) => {
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
        input={<Input id="select-multiple-placeholder" />}
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
export default TableContent;
