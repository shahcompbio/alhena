import React, { useState } from "react";
import _ from "lodash";

import { heatmapConfig } from "../Heatmap/config";

import withStyles from '@mui/styles/withStyles';
import { useStatisticsState } from "../DashboardState/statsState";

import {
  Typography,
  Paper,
  Modal,
  Slider,
  Button,
  Divider,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox
} from "@mui/material";

const styles = theme => ({
  closeIcon: {
    float: "right"
  },
  divider: {
    margin: theme.spacing(4, 8, 8, 0)
  },
  button: {
    margin: theme.spacing(3)
  },
  buttonWrapper: {
    textAlign: "center"
  },
  fieldComponent: {
    margin: theme.spacing(8, 0, 6, 0)
  },
  paper: {
    margin: "auto",
    width: 400,
    maxHeight: 600,
    overflow: "auto",
    marginTop: "20vh",
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(10)
  }
});

const MenuPopUp = ({
  classes,
  setPopUpOpen,
  updateHeatmap,
  categoryOptions
}) => {
  const [{ quality }, dispatch] = useStatisticsState();
  const [qualityMenuValue, setQualityMenuValue] = useState(quality);

  const originallySelectedCategories = categoryOptions.selected.reduce(
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
    setSelectedCategories({
      ...selectedCategories,
      [name]: event.target.checked
    });
  };

  function updateContext() {
    if (quality !== qualityMenuValue) {
      dispatch({
        type: "QUALITY_UPDATE",
        value: {
          quality: qualityMenuValue.toString(),
          choosenCategories: selectedCategories
        }
      });
    } else if (!_.isEqual(selectedCategories, originallySelectedCategories)) {
      dispatch({
        type: "HEATMAP_CATEGORY_UPDATE",
        value: selectedCategories
      });
    }
    setPopUpOpen();
  }

  return (
    <div>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={true}
        onClose={setPopUpOpen}
      >
        <Paper className={classes.paper}>
          <Typography variant="h4">Settings</Typography>
          <div className={classes.fieldComponent}>
            <Typography id="discrete-slider" variant="h6" gutterBottom>
              Quality
            </Typography>
            <Slider
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
          </div>
          <div className={classes.fieldComponent}>
            <Typography id="discrete-slider" variant="h6" gutterBottom>
              Categories Displayed
            </Typography>
            <FormControl
              required
              component="fieldset"
              className={classes.formControl}
            >
              <FormGroup>
                {categoryOptions.all.map(category => (
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
          <div className={classes.buttonWrapper}>
            <Button
              variant="contained"
              component="span"
              color="primary"
              className={classes.button}
              onClick={updateContext}
            >
              Save
            </Button>
          </div>
        </Paper>
      </Modal>
    </div>
  );
};

export default withStyles(styles)(MenuPopUp);
