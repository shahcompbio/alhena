import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  Switch
} from "@material-ui/core";

const GCBiasSettings = ({ classes, setAxisOption }) => {
  const [checked, setChecked] = useState(true);
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
      >
        <FormControlLabel
          control={<Switch checked={checked} onChange={toggleSwitch} />}
          label="Group by Experimental Condition"
        />
      </FormControl>
    </div>
  );
};

export default GCBiasSettings;
