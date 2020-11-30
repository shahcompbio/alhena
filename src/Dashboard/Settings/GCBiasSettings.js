import React, { useState } from "react";
import { FormControl, FormControlLabel, Switch } from "@material-ui/core";

import { useStatisticsState } from "../DashboardState/statsState";

const GCBiasSettings = ({ classes, setAxisOption, isDisabled }) => {
  const [{ gcBiasIsGrouped }, dispatch] = useStatisticsState();
  const [checked, setChecked] = useState(gcBiasIsGrouped);
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
          control={<Switch checked={checked} onChange={toggleSwitch} />}
          label="Group by Experimental Condition"
        />
      </FormControl>
    </div>
  );
};

export default GCBiasSettings;
