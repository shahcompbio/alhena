import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
//import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const useStyles = makeStyles(theme => ({
  root: {
    margin: "auto"
  },
  paper: {
    width: 200,
    height: 230,
    overflow: "auto"
  },
  button: {
    margin: theme.spacing(0.5, 0)
  }
}));

const not = (a, b) => a.filter(value => b.indexOf(value) === -1);
const intersection = (a, b) => a.filter(value => b.indexOf(value) !== -1);

const TransferList = ({ options, setSelectedIndices, alreadyChoosen }) => {
  const classes = useStyles();
  const [checked, setChecked] = React.useState([]);
  const [left, setLeft] = React.useState(
    alreadyChoosen !== undefined
      ? [...not(options, alreadyChoosen)]
      : [...options]
  );
  const [right, setRight] = React.useState(
    alreadyChoosen !== undefined ? [...alreadyChoosen] : []
  );

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
        key={value}
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
        <ListItemText id={labelId} primary={`${value + 1}`} />
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
      justify="center"
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
