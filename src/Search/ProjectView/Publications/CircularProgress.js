import React from "react";
import PropTypes from "prop-types";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Backdrop from "@material-ui/core/Backdrop";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles(theme => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
    width: "100%",
    height: "100%"
  }
}));

const CircularProgressWithLabel = ({ progress }) => {
  const classes = useStyles();
  return (
    <Backdrop className={classes.backdrop} open={true}>
      <Box
        position="relative"
        display="inline-flex"
        style={{
          zIndex: 1000,
          position: "absolute"
        }}
      >
        <CircularProgress variant="indeterminate" size={150} />
      </Box>
    </Backdrop>
  );
};
export default CircularProgressWithLabel;
