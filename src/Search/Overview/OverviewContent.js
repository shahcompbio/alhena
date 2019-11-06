import React from "react";

import { withRouter } from "react-router";
import { Link } from "react-router-dom";

import { withStyles } from "@material-ui/core/styles";
import { useAppState } from "../../util/app-state";

import { Query } from "react-apollo";
import { getProjects } from "../../Queries/queries.js";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Typography from "@material-ui/core/Typography";

const styles = theme => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3
  },
  container: {
    minHeight: "100vh"
  }
});

const OverviewContent = ({ classes, history }) => {
  const [{ authKeyID, uid }, dispatch] = useAppState();

  return (
    <Query
      query={getProjects}
      variables={{
        user: { authKeyID: authKeyID, uid: uid }
      }}
    >
      {({ loading, error, data }) => {
        if (loading) return null;
        if (error) return null;
        if (data.getProjects.length === 1) {
          history.push("/dashboards/" + data.getProjects[0].name);
        }
        return (
          <div className={classes.content}>
            <Grid
              direction="column"
              justify="center"
              alignItems="center"
              container
              spacing={2}
              key={"grid"}
              className={classes.container}
            >
              <Grid item style={{ textAlign: "center" }}>
                <Typography
                  variant="h5"
                  color="secondary"
                  style={{ marginBottom: 50 }}
                >
                  Select a dashboard
                </Typography>
                <ButtonGroup
                  fullWidth
                  color="secondary"
                  size="large"
                  aria-label="full width secondary outlined button group"
                >
                  {data.getProjects.map(project => {
                    return (
                      <Button
                        key={"button" + project.name}
                        value={project.name}
                        onClick={() => {
                          history.push("/dashboards/" + project.name);
                        }}
                      >
                        {project.name}
                      </Button>
                    );
                  })}
                </ButtonGroup>
              </Grid>
            </Grid>
          </div>
        );
      }}
    </Query>
  );
};

//<Link
//    to={`/${project.name}`}
//    style={{ color: "white", textDecoration: "none" }}
//  ></Link>
export default withStyles(styles)(withRouter(OverviewContent));
