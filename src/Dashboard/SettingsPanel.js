import React, { useState } from "react";
import {
  Paper,
  Button,
  Typography,
  Slider,
  Grid,
  Chip,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary
} from "@material-ui/core";

import BackspaceTwoToneIcon from "@material-ui/icons/BackspaceTwoTone";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { withStyles } from "@material-ui/core/styles";

import { useStatisticsState } from "./DashboardState/statsState";
import { heatmapConfig } from "./Heatmap/config";

const styles = theme => ({
  root: {
    height: "100%",
    width: 300,
    position: "fixed",
    left: 40
  },
  fieldComponent: {
    margin: theme.spacing(8, 3, 8, 3)
  },
  fieldTitle: {
    paddingBottom: 30
  },
  panel: {
    padding: theme.spacing(1, 3, 3, 3),
    margin: theme.spacing(1, 0, 3, 0)
  },
  selectedCells: {
    backgroundColor: "#c1d3e0",
    padding: "10px 15px 15px 15px"
  },
  settings: {
    width: 275,
    height: 300,
    padding: 10,
    background: "none"
  },
  sliderPanel: {
    padding: 15
  },
  slider: {
    marginTop: 50
  }
});
const SettingsPanel = ({ classes }) => {
  const [{ quality, selectedCells }, dispatch] = useStatisticsState();
  const [qualityMenuValue, setQualityMenuValue] = useState(quality);

  function updateContext() {
    if (quality !== qualityMenuValue) {
      dispatch({
        type: "QUALITY_UPDATE",
        value: {
          quality: qualityMenuValue.toString()
        }
      });
    }
  }
  const clearCellSelection = () => {
    dispatch({
      type: "BRUSH",
      value: []
    });
  };
  return (
    <div className={classes.root}>
      <Paper className={classes.settings} elevation={0}>
        <Typography variant="h5">Dashboard Settings</Typography>
        {selectedCells.length !== 0 && (
          <Paper
            className={[classes.panel, classes.selectedCells]}
            variant="outlined"
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

        <Paper
          className={[classes.panel, classes.sliderPanel]}
          variant="outlined"
        >
          <Typography>Quality</Typography>
          <Slider
            className={classes.slider}
            defaultValue={qualityMenuValue}
            onChange={(event, newValue) => setQualityMenuValue(newValue)}
            getAriaValueText={value => value}
            aria-labelledby="discrete-slider"
            step={0.05}
            marks={heatmapConfig.qualitySliderMarks}
            valueLabelDisplay="on"
            min={0}
            max={1.0}
          />
        </Paper>
        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography className={classes.heading}>Heatmap</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse malesuada lacus ex, sit amet blandit leo lobortis
              eget.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Paper>
    </div>
  );
};

export default withStyles(styles)(SettingsPanel);
