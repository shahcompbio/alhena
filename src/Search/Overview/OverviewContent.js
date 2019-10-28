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
                <ButtonGroup
                  fullWidth
                  color="secondary"
                  size="large"
                  aria-label="full width secondary outlined button group"
                >
                  {data.getProjects.map(project => {
                    return (
                      <Button value={project.name}>
                        {" "}
                        <Link
                          to={`/${project.name}`}
                          style={{ color: "white", textDecoration: "none" }}
                        >
                          {project.name}
                        </Link>
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

export default withStyles(styles)(withRouter(OverviewContent));