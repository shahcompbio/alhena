import React, { useState, useEffect } from "react";
import {
  Paper,
  Button,
  Typography,
  Slider,
  Grid,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  InputLabel,
  Select
} from "@mui/material";

const HeatmapSettings = ({ classes, updateCategories, categoryOptions }) => {
  const [selectedCategories, setSelectedCategories] = useState(categoryOptions);

  const handleCategoryChange = name => event => {
    const newSelection = {
      ...selectedCategories,
      [name]: event.target.checked
    };
    setSelectedCategories(newSelection);
    updateCategories(newSelection);
  };

  useEffect(() => {
    if (categoryOptions.length > 0 && selectedCategories.length === 0) {
      const originallySelectedCategories = categoryOptions.reduce(
        (final, selected) => {
          final[selected.category] = true;
          return final;
        },
        {}
      );
      setSelectedCategories(originallySelectedCategories);
    }
  }, [categoryOptions]);
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
                  checked={
                    selectedCategories.length === 0
                      ? true
                      : selectedCategories[category.category]
                  }
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
export default HeatmapSettings;
