import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";

import MenuPopUp from "./MenuPopUp.js";

const MenuToolBar = ({ handleRequery, categoryOptions }) => {
  const [popUpOpen, setPopUpOpen] = useState(false);

  return (
    <div>
      <Typography style={{ float: "left" }} variant="h5">
        Cellscape
      </Typography>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={() => setPopUpOpen(true)}
        style={{ float: "right" }}
      >
        <MenuIcon />
      </Button>
      {popUpOpen && (
        <MenuPopUp
          setPopUpOpen={() => setPopUpOpen(false)}
          updateHeatmap={(quality, selectedCategories) =>
            handleRequery(quality, selectedCategories)
          }
          categoryOptions={categoryOptions}
        />
      )}
    </div>
  );
};

export default MenuToolBar;
