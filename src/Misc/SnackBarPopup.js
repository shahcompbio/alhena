import React, { useState } from "react";
import clsx from "clsx";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import { amber, green } from "@mui/material/colors";
import Snackbar from "@mui/material/Snackbar";
import SnackbarContent from "@mui/material/SnackbarContent";
import WarningIcon from "@mui/icons-material/Warning";
import makeStyles from "@mui/styles/makeStyles";

import errorMessages from "./ErrorCodes.js";
const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
};

const useSnackBarStyles = makeStyles(theme => ({
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  info: {
    backgroundColor: theme.palette.primary.main
  },
  warning: {
    backgroundColor: amber[700]
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  message: {
    display: "flex",
    alignItems: "center"
  }
}));

const SnackbarContentWrapper = ({
  className,
  errorNumber,
  setError,
  variant
}) => {
  const [isOpen, setOpen] = useState(true);
  const classes = useSnackBarStyles();
  const Icon = variantIcon[variant];

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  return (
    <Snackbar
      autoHideDuration={2000}
      open={isOpen}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right"
      }}
    >
      <SnackbarContent
        className={clsx(classes[variant], className)}
        aria-describedby="client-snackbar"
        message={
          <span id="client-snackbar" className={classes.message}>
            <Icon className={clsx(classes.icon, classes.iconVariant)} />
            {errorMessages[errorNumber]}
          </span>
        }
      />
    </Snackbar>
  );
};
export default SnackbarContentWrapper;
