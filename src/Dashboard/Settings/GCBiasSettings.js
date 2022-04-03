import React, { useState } from "react";
import { FormControl, FormControlLabel, Switch } from "@mui/material";

import { useStatisticsState } from "../DashboardState/statsState";

import makeStyles from "@mui/styles/makeStyles";
const useStyles = makeStyles(theme => ({
  fieldComponent: {
    margin: theme.spacing(2, 0, 0, 0)
  },
  formControl: {
    width: "100%",
    margin: theme.spacing(0, 0, 2, 0) + " !important"
  },
  dropDownLabel: { backgroundColor: "white", padding: "3px !important;" },
  toggle: {
    color: theme.palette.secondary.main + " !important",
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      color: theme.palette.secondary.main + " !important",

      backgroundColor: theme.palette.secondary.main + " !important"
    },
    "& .Mui-checked": {
      color: theme.palette.secondary.main + " !important"
    }
  }
}));

const GCBiasSettings = ({ setAxisOption, isDisabled }) => {
  const [{ gcBiasIsGrouped }] = useStatisticsState();
  const [checked, setChecked] = useState(gcBiasIsGrouped);
  const classes = useStyles();

  const toggleSwitch = () => {
    setAxisOption(!checked);
    setChecked(!checked);
  };
  return (
    <div className={classes.fieldComponent}>
      <FormControl
        variant="outlined"
        key="gcbiasFormControll"
        className={classes.formControl}
        disabled={isDisabled}
      >
        <FormControlLabel
          control={
            <Switch
              checked={checked}
              onChange={toggleSwitch}
              className={classes.toggle}
            />
          }
          label="Group by Experimental Condition"
        />
      </FormControl>
    </div>
  );
};

export default GCBiasSettings;
