import React, { useState } from "react";
import { withStyles } from "@material-ui/styles";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";

import ListItemText from "@material-ui/core/ListItemText";
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
  isAdmin: "Admin",
  count: "Analyses Count"
};

const editableRows = { roles: true, isAdmin: true };

const styles = theme => ({
  select: {
    "&:before": {
      borderColor: "#ffffff"
    }
  }
});
const adminMapping = { false: "", true: "Yes" };
const TableContent = ({
  classes,
  history,
  data,
  handleRowClick,
  selected,
  tabIndex,
  allRoles,
  setSelectedUserRoles,
  setSelectedUserAdmin,
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
    data.length > 0
      ? Object.keys(data[0]).filter(heading => heading !== "__typename")
      : [];

  const colorClass = tabIndex === 0 ? classes.checkBox0 : classes.checkBox1;

  const editTextRows = (row, heading, allRolesLength) => {
    if (Array.isArray(row[heading])) {
      if (heading === "roles") {
        return row[heading].length === allRolesLength
          ? "All"
          : row[heading].join(", ");
      } else {
        return row[heading].join(", ");
      }
    } else {
      return adminMapping.hasOwnProperty(row[heading])
        ? adminMapping[row[heading]]
        : row[heading];
    }
  };

  return [
    <Table className={classes.table} size="small" key={"table-" + tabIndex}>
      <TableHead key={"tableHead-" + tabIndex}>
        <TableRow key={"tableHeaderRow-" + tabIndex}>
          <TableCell
            key={"tableHeaderRowCell-" + tabIndex}
            padding="checkbox"
          ></TableCell>
          <TableHeadings
            classes={classes}
            tableHeadings={tableHeadings}
            colorClass={colorClass}
          />
        </TableRow>
      </TableHead>
      <TableBody key={"tableBody-" + tabIndex}>
        {data.length === 0
          ? []
          : data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const name = row[tableConfig.rowType];

                const labelId = `enhanced-table-checkbox-${index}`;
                const isItemSelected = isSelected(name);
                const rowClass = isItemSelected
                  ? classes.selectedTableCell
                  : classes.tableCell;
                return (
                  <TableRow
                    className={colorClass}
                    classes={{ selected: classes.selected }}
                    key={"tableBodyRowCheck-" + name}
                  >
                    <TableCell
                      padding="checkbox"
                      className={rowClass}
                      key={"tableBodyCellCheck-" + name}
                    >
                      <Checkbox
                        className={
                          tabIndex === 0 ? classes.checkBox0 : classes.checkBox1
                        }
                        key={"tableBodyCheckbox-" + name}
                        id="check"
                        checked={isItemSelected}
                        onClick={event => handleRowClick(name)}
                        inputProps={{ "aria-labelledby": labelId }}
                      />
                    </TableCell>
                    {tableHeadings.map((heading, headingIndex) => {
                      return (
                        <TableCell
                          key={"tableBodyCell-" + name}
                          align={headingIndex === 0 ? "left" : "right"}
                          component="th"
                          scope="row"
                          id={labelId}
                          className={[rowClass, colorClass]}
                        >
                          <div>
                            {isSelectedForEditing(
                              row[tableConfig.rowType],
                              heading
                            ) ? (
                              <DropDownEdit
                                setUserField={options =>
                                  heading === "isAdmin"
                                    ? setSelectedUserAdmin(
                                        options === "Yes" ? true : false
                                      )
                                    : setSelectedUserRoles([...options])
                                }
                                currentSelection={
                                  Array.isArray(row[heading])
                                    ? row[heading]
                                    : adminMapping.hasOwnProperty(row[heading])
                                }
                                isMultiple={Array.isArray(row[heading])}
                                allOptions={
                                  heading === "isAdmin"
                                    ? ["Yes", "No"]
                                    : allRoles
                                }
                                classes={classes}
                                user={row["username"]}
                              />
                            ) : (
                              editTextRows(row, heading, allRoles.length)
                            )}
                          </div>
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
      count={data.length}
      rowsPerPage={rowsPerPage}
      page={page}
      rowsPerPageOptions={[]}
      backIconButtonProps={{
        "aria-label": "previous page"
      }}
      nextIconButtonProps={{
        "aria-label": "next page"
      }}
      className={clsx(classes.tablePagination, colorClass)}
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
        key={"tableHeaderCell" + heading}
        className={clsx(classes.tableCell, classes.tableHeader, colorClass)}
      >
        {rowLabels[heading]}
      </TableCell>
    );
  });
const DropDownEdit = ({
  currentSelection,
  isMultiple,
  allOptions,
  setUserField,
  classes,
  user
}) => {
  const [selectedField, setSelectedField] = useState(currentSelection);
  return (
    <FormControl
      required
      style={{ width: "100%" }}
      key={"userPermisionsFormControl" + user}
    >
      <Select
        multiple={isMultiple}
        key={"userSelect" + user}
        value={selectedField || []}
        onChange={event => {
          setSelectedField(event.target.value);
          setUserField(event.target.value);
        }}
        className={classes.select}
        input={
          <Input
            id="select-multiple-placeholder-user"
            style={{ color: "#ffffff" }}
          />
        }
      >
        {allOptions.map(name => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export default withStyles(styles)(TableContent);
