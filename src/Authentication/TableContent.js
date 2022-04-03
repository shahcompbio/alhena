import React, { useState } from "react";
import styled from "styled-components";

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

const StyledCheckBox = styled(Checkbox)(({ theme }) => ({
  color: "#443d3d !important",
  "$selected &": {
    color: "#443d3d"
  }
}));

const adminMapping = { false: "", true: "Yes" };
const TableContent = ({
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
              tableHeadings={tableHeadings}
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
                  return (
                    <TableRow key={"tableBodyRowCheck-" + name}>
                      <TableCell
                        padding="checkbox"
                        sx={
                          isItemSelected
                            ? {
                                height: 150,
                                fontSize: 18,
                                whiteSpace: "normal",
                                wordWrap: "break-word",
                                maxWidth: "200px"
                              }
                            : {
                                whiteSpace: "normal",
                                wordWrap: "break-word",
                                maxWidth: "100px",
                                fontSize: 16
                              }
                        }
                        key={"tableBodyCellCheck-" + name}
                      >
                        <StyledCheckBox
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
                            key={"tableBodyCell-" + heading + name}
                            align={headingIndex === 0 ? "left" : "right"}
                            component="th"
                            scope="row"
                            id={labelId}
                            sx={{ fontSize: "16px" }}
                          >
                            <div key={"tableCellWrapper-" + name}>
                              {isSelectedForEditing(
                                row[tableConfig.rowType],
                                heading
                              ) ? (
                                heading === "isAdmin" ? (
                                  <RadioEdit
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
        sx={{ fontWeight: "bold" }}
        onPageChange={(event, newPage) => setPage(newPage)}
      />
    </span>
  );
};

const TableHeadings = ({ tableHeadings }) =>
  tableHeadings.map((heading, headingIndex) => {
    var aligned = headingIndex === 0 ? "left" : "right";
    return (
      <TableCell
        align={aligned}
        key={"tableHeaderCell" + heading}
        sx={{
          whiteSpace: "normal",
          wordWrap: "break-word",
          maxWidth: "100px",
          fontSize: 20,
          fontWeight: "bold"
        }}
      >
        {rowLabels[heading]}
      </TableCell>
    );
  });
const RadioEdit = ({ checked, onChange }) => {
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
        sx={{
          "&:before": {
            borderColor: "#ffffff"
          }
        }}
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
export default TableContent;
