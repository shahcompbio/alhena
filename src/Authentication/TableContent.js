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
import Switch from "@material-ui/core/Switch";

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
  table: {
    width: "90%",
    margin: "auto",
    minWidth: 650
    //marginTop: 25
  },
  select: {
    "&:before": {
      borderColor: "#ffffff"
    }
  },
  editingRow: { height: 60 },
  tableRowIndex0: {
    backgroundColor: theme.palette.primary.dark,
    color: "white",
    "&$selected, &$selected:hover": {
      backgroundColor: "#ffffff"
    }
  },
  checkBox0: {
    color: "white !important",
    "$selected &": {
      color: "white"
    }
  },
  checkBox1: {
    color: "#000000 !important",
    "$selected &": {
      color: "#000000"
    }
  },
  otherCol: {
    //width: "15%"
  },
  adminCol: { width: "10%" },
  roleCol: { width: "25%" },
  checkBoxCol: {
    //width: "5%"
  },
  tableRowIndex1: {
    backgroundColor: theme.palette.primary.main,
    color: "#000000",
    "&$selected, &$selected:hover": {
      backgroundColor: "rgba(232, 232, 232, 0.43)"
    }
  },
  selected: {},
  tableCell: {
    whiteSpace: "normal",
    wordWrap: "break-word",
    maxWidth: "100px",
    fontSize: 18
  },
  selectedTableCell: {
    height: 60,
    fontSize: 20,
    whiteSpace: "normal",
    wordWrap: "break-word",
    maxWidth: "200px",
    backgroundColor: "#11151d40"
  },
  tableHeader: {
    fontSize: 18,
    padding: 15,
    fontWeight: "bold"
    //backgroundColor: "#ffffff94"
  },
  tablePagination: {
    fontWeight: "bold"
  },
  toolbar: {},
  hide: {
    display: "none"
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
        console.log(row[heading]);
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
  const getWidthClass = heading =>
    heading === "role"
      ? classes.roleCol
      : heading === "isAdmin"
      ? classes.adminCol
      : "";
  return (
    <span>
      <Table className={classes.table} size="small" key={"table-" + tabIndex}>
        <TableHead key={"tableHead-" + tabIndex}>
          <TableRow key={"tableHeaderRow-" + tabIndex}>
            <TableCell
              key={"tableHeaderRowCell-" + tabIndex}
              padding="checkbox"
            ></TableCell>
            <TableHeadings
              key={"tableHeadings"}
              classes={classes}
              tableHeadings={tableHeadings}
              colorClass={colorClass}
              isUsers={tabIndex === 1}
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
                  const isItemSelected = selected === name;
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
                          className={clsx(colorClass, classes.checkBoxCol)}
                          key={"tableBodyCheckbox-" + name}
                          id="check"
                          checked={isItemSelected}
                          onClick={event => handleRowClick(name)}
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      </TableCell>
                      {tableHeadings.map((heading, headingIndex) => {
                        const widthClass = getWidthClass(heading);
                        return (
                          <TableCell
                            key={"tableBodyCell-" + heading + name}
                            align={headingIndex === 0 ? "left" : "right"}
                            component="th"
                            scope="row"
                            id={labelId}
                            className={clsx(rowClass, colorClass, widthClass)}
                          >
                            <div key={"tableCellWrapper-" + name}>
                              {isSelectedForEditing(
                                row[tableConfig.rowType],
                                heading
                              ) ? (
                                heading === "isAdmin" ? (
                                  <RadioEdit
                                    classes={classes}
                                    checked={row[heading]}
                                    onChange={event =>
                                      setSelectedUserAdmin(event.target.checked)
                                    }
                                  />
                                ) : (
                                  <DropDownEdit
                                    setUserField={options =>
                                      setSelectedUserRoles([...options])
                                    }
                                    currentSelection={row[heading]}
                                    isMultiple={Array.isArray(row[heading])}
                                    allOptions={allRoles}
                                    classes={classes}
                                    user={row["username"]}
                                  />
                                )
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
      </Table>
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
        onChangePage={(event, newPage) => setPage(newPage)}
      />
    </span>
  );
};

const TableHeadings = ({ classes, tableHeadings, colorClass, isUsers }) =>
  tableHeadings.map((heading, headingIndex) => {
    const roleClass = isUsers
      ? ""
      : heading === "role"
      ? classes.roleCol
      : classes.otherCol;
    var aligned = headingIndex === 0 ? "left" : "right";
    return (
      <TableCell
        align={aligned}
        key={"tableHeaderCell" + heading}
        className={clsx(
          classes.tableCell,
          classes.tableHeader,
          colorClass,
          roleClass
        )}
      >
        {rowLabels[heading]}
      </TableCell>
    );
  });
const RadioEdit = ({ classes, checked, onChange }) => {
  const [isChecked, setIsChecked] = useState(checked);
  return (
    <Switch
      checked={isChecked}
      onChange={event => {
        setIsChecked(!isChecked);
        onChange(event);
      }}
      inputProps={{ "aria-label": "secondary checkbox" }}
    />
  );
};

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
