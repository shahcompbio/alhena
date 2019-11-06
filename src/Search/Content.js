import React from "react";
import { Route, Switch } from "react-router-dom";

import ProjectViewContent from "./ProjectView/ProjectViewContent.js";
import OverviewContent from "./Overview/OverviewContent.js";
import NoMatch from "./NoMatch.js";

import Grid from "@material-ui/core/Grid";

import { withStyles } from "@material-ui/styles";

const styles = ({ theme }) => ({
  root: { flexGrow: 1 },
  hide: {
    display: "none"
  }
});

const Content = ({ classes, history }) => {
  return (
    <Grid>
      <Switch>
        <Route exact path="/dashboards" render={() => <OverviewContent />} />
        <Route path={`/dashboards/:project`} component={ProjectViewContent} />
        <Route component={NoMatch} />
      </Switch>
    </Grid>
  );
};

export default withStyles(styles)(Content);
