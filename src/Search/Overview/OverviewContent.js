import React, { Component, createRef } from "react";

import { withRouter } from "react-router";

import { BrowserRouter, Route, Link } from "react-router-dom";
import styled from "@emotion/styled";
import { withStyles } from "@material-ui/core/styles";

import { Query } from "react-apollo";
import { graphql } from "react-apollo";
import { getProjects } from "../../Queries/queries.js";

import Drawer from "@material-ui/core/Drawer";
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
  return (
    <Query query={getProjects}>
      {({ loading, error, data }) => {
        if (loading) return null;
        if (error) return null;
        const handleChange = event => history.push("/" + event.target.value);
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
                  size="large"
                  aria-label="full width outlined button group"
                >
                  {data.getProjects.map(project => {
                    return (
                      <Button value={project.name}>
                        {" "}
                        <Link to={`/${project.name}`}>{project.name}</Link>
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
