import React, { useState, useEffect } from "react";
import {
  Paper,
  Button,
  Typography,
  Slider,
  Grid,
  Chip,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary
} from "@material-ui/core";

import BackspaceTwoToneIcon from "@material-ui/icons/BackspaceTwoTone";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import _ from "lodash";

import { withStyles } from "@material-ui/core/styles";

import { useDashboardState } from "../Search/ProjectView/ProjectState/dashboardState";

import { useStatisticsState } from "./DashboardState/statsState";
import { heatmapConfig } from "./Heatmap/config";

const styles = theme => ({
  fieldComponent: {
    margin: theme.spacing(0, 3, 8, 3)
  },
  fieldTitle: {
    paddingBottom: 30
  },
  expansionPanelRoot: {
    boxShadow:
      "0px 2px 1px -1px rgba(255, 255, 255, 0.85), 0px -1px 0px 0px rgb(255, 255, 255), 0px 1px 3px 0px rgba(204, 196, 196, 0)"
  },
  expansionPanelSummary: {
    padding: "0 14px 0 14px"
  },
  expanded: { margin: "0px !important" },
  panel: {
    padding: theme.spacing(3, 3, 3, 3),
    margin: theme.spacing(0, 0, 0, 0),
    width: "100%",
    background: "white"
  },
  selectedCells: {
    backgroundColor: "#e6eaec",
    padding: theme.spacing(3, 3, 3, 3),
    margin: theme.spacing(2, 0, 2, 0)
  },
  markLabel: {
    color: "rgba(225, 225, 225, 0.54)"
  },
  metaDataPanel: {
    background: "none"
  },
  buttonWrapper: {
    textAlign: "center"
  },
  button: {
    margin: theme.spacing(3)
  },
  fieldComponent: {
    margin: theme.spacing(2, 0, 2, 0)
  },
  settings: {
    padding: 10,
    width: 300,
    background: "none",
    height: "100%",
    position: "fixed"
  },
  sliderPanel: {
    padding: 20
  },
  slider: {
    marginTop: 10
  },
  titlePadding: {
    paddingBottom: 15,
    paddingTop: 15
  },
  whiteText: {
    color: "white"
  }
});
const SettingsPanel = ({ classes, categoryStats }) => {
  //  const [{ selectedDashboard, selectedAnalysis }] = useDashboardState();
  const selectedAnalysis = "Jira-123";
  const [{ quality, selectedCells }, dispatch] = useStatisticsState();
  const [qualityMenuValue, setQualityMenuValue] = useState(quality);

  function updateCategories(selectedCategory) {
    dispatch({
      type: "HEATMAP_CATEGORY_UPDATE",
      value: selectedCategory
    });
  }

  function dispatchQualityUpdate() {
    dispatch({
      type: "QUALITY_UPDATE",
      value: {
        quality: qualityMenuValue.toString()
      }
    });
  }

  const clearCellSelection = () => {
    dispatch({
      type: "BRUSH",
      value: []
    });
  };
  return (
    <Paper className={classes.settings} elevation={0}>
      <MetaData classes={classes} count={500} analysis={selectedAnalysis} />
      {selectedCells.length !== 0 && (
        <Paper
          className={[classes.panel, classes.selectedCells]}
          variant="outlined"
          elevation={0}
        >
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {selectedCells.length} cells selected
            </Typography>
            <Button onClick={() => clearCellSelection()}>
              <BackspaceTwoToneIcon fontSize="medium" />
            </Button>
          </Grid>
        </Paper>
      )}
      <ExpansionPanel
        classes={{
          root: classes.expansionPanelRoot
        }}
      >
        <ExpansionPanelSummary
          classes={{ root: classes.expansionPanelSummary }}
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h7">Quality Filter</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Slider
            className={classes.slider}
            color={"secondary"}
            defaultValue={qualityMenuValue}
            onChange={(event, newValue) => setQualityMenuValue(newValue)}
            onChangeCommitted={() => dispatchQualityUpdate()}
            getAriaValueText={value => value}
            aria-labelledby="discrete-slider"
            step={0.05}
            marks={heatmapConfig.qualitySliderMarks}
            valueLabelDisplay="on"
            min={0}
            max={1.0}
          />
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel
        classes={{
          root: classes.expansionPanelRoot
        }}
      >
        <ExpansionPanelSummary
          classes={{ root: classes.expansionPanelSummary }}
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h7">Heatmap</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <HeatmapSettings
            classes={classes}
            updateCategories={updateCategories}
            categoryOptions={categoryStats}
          />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </Paper>
  );
};
const MetaData = ({ classes, count, analysis }) => (
  <Paper
    elevation={0}
    className={[classes.panel, classes.metaDataPanel]}
    variant="outlined"
  >
    <Grid
      container
      direction="column"
      justify="space-between"
      alignItems="start"
    >
      <Typography
        variant="h5"
        fontWeight="fontWeightRegular"
        style={{ color: "#a2a2a2" }}
      >
        Analysis: {analysis}
      </Typography>
      <Typography
        variant="h5"
        fontWeight="fontWeightRegular"
        style={{ color: "#a2a2a2" }}
      >
        Library: ABC123
      </Typography>
      <Typography
        variant="h5"
        fontWeight="fontWeightRegular"
        style={{ color: "#a2a2a2" }}
      >
        {count} cells
      </Typography>
    </Grid>
  </Paper>
);

const HeatmapSettings = ({ classes, updateCategories, categoryOptions }) => {
  const originallySelectedCategories = categoryOptions.reduce(
    (final, selected) => {
      final[selected.category] = true;
      return final;
    },
    {}
  );
  const [selectedCategories, setSelectedCategories] = useState(
    originallySelectedCategories
  );

  const handleCategoryChange = name => event => {
    const newSelection = {
      ...selectedCategories,
      [name]: event.target.checked
    };
    setSelectedCategories(newSelection);
    updateCategories(newSelection);
  };
  return (
    <div className={classes.fieldComponent}>
      <Typography id="discrete-slider" variant="h7" gutterBottom>
        Categories
      </Typography>
      <FormControl required component="fieldset">
        <FormGroup>
          {categoryOptions.map(category => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedCategories[category.category]}
                  onChange={handleCategoryChange(category.category)}
                  value={category.category}
                />
              }
              label={category.category}
            />
          ))}
        </FormGroup>
      </FormControl>
    </div>
  );
};
export default withStyles(styles)(SettingsPanel);
