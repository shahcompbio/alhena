import React, { useState, useEffect } from "react";
import clsx from "clsx";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import { amber, green } from "@material-ui/core/colors";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import WarningIcon from "@material-ui/icons/Warning";
import { makeStyles } from "@material-ui/core/styles";

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

  return (
    <Snackbar
      autoHideDuration={2000}
      open={isOpen}
      onClose={() => {
        setOpen(false);
        setError(null);
      }}
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
