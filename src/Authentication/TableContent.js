import React, { useState } from "react";
import { withStyles } from "@mui/styles";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";

import Checkbox from "@mui/material/Checkbox";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Input from "@mui/material/Input";
import FormControl from "@mui/material/FormControl";
import Switch from "@mui/material/Switch";

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
    minWidth: 650,
    padding: 10
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
  checkBox: {
    color: "#443d3d !important",
    "$selected &": {
      color: "#443d3d"
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
  adminCol: { width: "8%" },
  roleCol: { width: "23%" },
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
    height: 150,
    fontSize: 20,
    whiteSpace: "normal",
    wordWrap: "break-word",
    maxWidth: "200px"
    //  backgroundColor: "blue"
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
  const colorClass = classes.checkBox;

  const editTextRows = (row, heading, allRolesLength, isItemSelected) => {
    if (Array.isArray(row[heading])) {
      const longForm = row[heading].filter(d => d !== "").join(", ");
      if (heading === "roles") {
        if (row[heading].length === allRolesLength) {
          return "All";
        } else {
          if (longForm.length <= 15 || isItemSelected) {
            return longForm;
          } else {
            return longForm.substring(0, 15) + "...";
          }
        }
      } else {
        return longForm + "...";
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
      <Table
        sx={{
          width: "90%",
          margin: "auto",
          minWidth: 650,
          padding: 10,
          marginTop: "25px !important"
        }}
        size="small"
        key={"table-" + tabIndex}
      >
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
                                editTextRows(
                                  row,
                                  heading,
                                  allRoles.length,
                                  isItemSelected
                                )
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
        onPageChange={(event, newPage) => setPage(newPage)}
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
        sx={{ fontSize: 16, fontWeight: "bold" }}
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
