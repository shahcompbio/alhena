import React from "react";

import withStyles from "@mui/styles/withStyles";

import { useDashboardState } from "../ProjectView/ProjectState/dashboardState";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";

import _ from "lodash";

const useStyles = makeStyles({
  button: {
    color: "#2d2264",
    border: "1px solid #8988b8",
    "&:hover": {
      //  color: "#cfb630",
      //  textShadow: "0 0 1px #ffbf00",
      background: "blue",
      fontSize: 20
    },
    fontWeight: "bold",
    fontSize: 16
  }
});
const OverviewContent = ({ classes, handleForwardStep }) => {
  const [{ dashboards }, dispatch] = useDashboardState();
  const classes2 = useStyles();

  const selectProject = project => {
    handleForwardStep();

    dispatch({
      type: "DASHBOARD_SELECT",
      value: { selectedDashboard: project }
    });
  };

  return dashboards.length > 0 ? (
    <div
      sx={{
        flexGrow: 1
      }}
    >
      <Grid
        direction="column"
        justifyContent="center"
        alignItems="center"
        container
        spacing={2}
        key={"grid"}
        sx={{ minHeight: "100vh" }}
      >
        <Grid item style={{ textAlign: "center", padding: 50 }}>
          <Typography
            variant="h4"
            color="secondary"
            style={{ marginBottom: 50, color: "#2B303A" }}
          >
            Select from the following available projects:
          </Typography>

          {_.chunk(dashboards, 3).map(projectGroup => {
            return (
              <ButtonGroup
                fullWidth
                color="secondary"
                size="large"
                aria-label="full width secondary outlined button group"
              >
                {projectGroup.map(project => (
                  <Button
                    sx={{
                      color: "#423e59",
                      border: "1px solid #E28413",
                      "&:hover": {
                        border: "1px solid #E28413",
                        background: "#ebcdbe",
                        fontSize: 20
                      },
                      fontWeight: "bold",
                      fontSize: 16
                    }}
                    key={"button" + project}
                    value={project}
                    onClick={() => selectProject(project)}
                  >
                    {project}
                  </Button>
                ))}
              </ButtonGroup>
            );
          })}
        </Grid>
      </Grid>
    </div>
  ) : null;
};

export default OverviewContent;
