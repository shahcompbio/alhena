import React, { useState, useEffect } from "react";
import makeStyles from "@mui/styles/makeStyles";

import {
  Grid,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Button,
  Paper
} from "@mui/material";

import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const useStyles = makeStyles(theme => ({
  root: {
    //  margin: "auto",
    //  padding: "10px"
    //width: "100%"
  },
  paper: {
    width: 350,
    height: 230,
    overflow: "auto"
  },
  button: {
    margin: theme.spacing(0.5, 0)
  }
}));

const not = (a, b) => a.filter(value => b.indexOf(value) === -1);
const intersection = (a, b) => a.filter(value => b.indexOf(value) !== -1);

const TransferList = ({
  allIndices,
  setSelectedIndices,
  alreadyChoosen,
  searchValue
}) => {
  const classes = useStyles();
  const [checked, setChecked] = useState([]);

  const [left, setLeft] = useState(
    alreadyChoosen !== undefined
      ? [...not(allIndices, alreadyChoosen)]
      : [...allIndices]
  );

  const [right, setRight] = useState(
    alreadyChoosen !== undefined ? [...alreadyChoosen] : []
  );

  useEffect(() => {
    const newList =
      searchValue !== ""
        ? allIndices.filter(row =>
            row.toLowerCase().includes(searchValue.toLowerCase())
          )
        : allIndices;

    setLeft([...not(newList, right)]);
  }, [searchValue]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = value => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    const newRight = [...right, ...left];
    setRight([...newRight]);
    setLeft([]);
    setSelectedIndices([...newRight]);
  };

  const handleCheckedRight = () => {
    const newRight = [...right, ...leftChecked];
    setRight([...newRight]);
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
    setSelectedIndices([...newRight]);
  };

  const handleCheckedLeft = () => {
    const newRight = not(right, rightChecked);
    setLeft([...left, ...rightChecked]);
    setRight([...newRight]);
    setChecked(not(checked, rightChecked));
    setSelectedIndices([...newRight]);
  };

  const handleAllLeft = () => {
    setLeft([...left, ...right]);
    setRight([]);
    setSelectedIndices([]);
  };

  const Row = ({ data, index, style }) => {
    const value = data[index];
    const labelId = `transfer-list-item-${value}-label`;
    return (
      <ListItem
        key={value + "item"}
        role="listitem"
        dense
        disableGutters
        button
        style={style}
        onClick={handleToggle(value)}
      >
        <ListItemIcon>
          <Checkbox
            checked={checked.indexOf(value) !== -1}
            tabIndex={-1}
            disableRipple
            inputProps={{ "aria-labelledby": labelId }}
          />
        </ListItemIcon>
        <ListItemText id={labelId} primary={`${value}`} />
      </ListItem>
    );
  };
  const customList = items => (
    <Paper className={classes.paper}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={items.length}
            itemData={items}
            itemSize={45}
            style={{ padding: 0 }}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </Paper>
  );

  return (
    <Grid
      container
      spacing={2}
      justifyContent="center"
      alignItems="center"
      className={classes.root}
    >
      <Grid item>{customList(left)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleAllRight}
            disabled={left.length === 0}
            aria-label="move all right"
          >
            ≫
          </Button>
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </Button>
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </Button>
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleAllLeft}
            disabled={right.length === 0}
            aria-label="move all left"
          >
            ≪
          </Button>
        </Grid>
      </Grid>
      <Grid item>{customList(right)}</Grid>
    </Grid>
  );
};
export default TransferList;
