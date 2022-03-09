import React, { useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";

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
