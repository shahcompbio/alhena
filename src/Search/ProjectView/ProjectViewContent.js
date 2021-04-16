import React, { useState, useRef, useEffect } from "react";
import Search from "./Filter/Search.js";

import { useAppState } from "../../util/app-state";
import { withStyles } from "@material-ui/styles";

import CanvasGraph from "./Graph/CanvasGraph.js";
import Table from "./TableView/Table.js";

import Slide from "@material-ui/core/Slide";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import Grid from "@material-ui/core/Grid";

import { Query } from "react-apollo";

import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useDashboardState } from "./ProjectState/dashboardState";

const styles = {
  root: { flexGrow: 1 },
  hide: {
    display: "none"
  },
  title: {
    color: "white",
    filter: "url(#textGlow)",
    paddingTop: 50,
    paddingLeft: 50
  },
  activeWhite: {
    cursor: "pointer",
    color: "white !important"
  },
  disabled: { cursor: "pointer" },
  stepper: { margin: "auto", position: "absolute", bottom: 50, left: "50vw" },
  tableWrapper: {
    marginTop: "15vh"
  }
};
const getAllAnalyses = gql`
  query Sunburst($filter: [Term]!, $user: ApiUser!, $dashboardName: String!) {
    analyses(filters: $filter, auth: $user, dashboardName: $dashboardName) {
      error
      defaultProjectView
      analysesRows {
        project
        sample_id
        library_id
        jira_id
      }
      analysesStats {
        label
        value
      }
      analysesList {
        label
        values
        type
      }
      analysesTree {
        source
        children {
          ... on ParentType {
            source
            target
            children {
              ... on ParentType {
                source
                target
                children {
                  ... on ParentType {
                    source
                    target
                    children {
                      ... on ChildType {
                        source
                        target
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const SET_CACHE_SETTING = gql`
  query chacheSetting($type: String!, $value: Int!, $auth: ApiUser!) {
    setCache(type: $type, value: $value, auth: $auth) {
      confirmed
    }
  }
`;
const slideTimeOut = 1500;
const ProjectViewContent = ({ client, classes, handleForwardStep }) => {
  const [{ selectedDashboard }] = useDashboardState();

  const [{ authKeyID, uid }, dispatch] = useAppState();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [activeStep, setActiveStep] = useState(null);
  const [filters, setFilters] = useState([]);

  const [graphDim, setDim] = useState(0);
  const dimRef = useRef(0);

  const getDirection = index => (index === 0 ? "right" : "left");

  const handleFilterChange = (filter, type) => {
    var options = selectedOptions;

    if (filter && type.localeCompare("clear") !== 0) {
      options[filter.label] = {
        value: filter.label,
        label: filter.value
      };
      setSelectedOptions(options);
      setFilters([...filters, filter]);
    } else {
      var newFilters = filters.filter((value, i) => value.label !== filter);
      delete selectedOptions[filter];

      setSelectedOptions(selectedOptions);
      setFilters([...newFilters]);
    }
  };

  return selectedDashboard !== null ? (
    <Query
      query={getAllAnalyses}
      variables={{
        filter: [...filters],
        dashboardName: selectedDashboard,
        user: { authKeyID: authKeyID, uid: uid }
      }}
    >
      {({ loading, error, data }) => {
        if (error) {
          //  dispatch({
          //    type: "LOGOUT"
          //  });
          return null;
        }
        if (loading) {
          return (
            <div>
              <Slide
                direction={getDirection(0)}
                in={true}
                mountOnEnter
                timeout={slideTimeOut}
                key={"slideTableContent"}
              >
                <Grid
                  item
                  xs={6}
                  sm={3}
                  className={classes.tableWrapper}
                  key={"grid-table"}
                >
                  <Table
                    columns={[]}
                    rows={[]}
                    handleForwardStep={null}
                    key={"project-view-table"}
                  />
                </Grid>
              </Slide>
              <Slide
                timeout={slideTimeOut}
                direction={getDirection(1)}
                in={false}
                mountOnEnter
                key={"slideGraph"}
              >
                <Grid
                  container
                  className={classes.root}
                  spacing={2}
                  key={"grid-container"}
                >
                  <Grid
                    item
                    xs={6}
                    sm={3}
                    style={{ height: "50vh" }}
                    key={"grid-search"}
                  >
                    <Search
                      key={"search"}
                      selectedOptions={null}
                      filters={null}
                      dashboards={[]}
                      handleFilterChange={null}
                      handleForwardStep={null}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} key={"grid-content"} ref={dimRef}>
                    <CanvasGraph
                      isLoading={true}
                      key={"packing-circles"}
                      filters={[]}
                      analyses={{}}
                      data={null}
                      handleFilterChange={null}
                      handleForwardStep={null}
                    />
                  </Grid>
                </Grid>
              </Slide>
            </div>
          );
        } else {
          if (data["analyses"] && data["analyses"]["error"]) {
            dispatch({
              type: "LOGOUT"
            });
            return null;
          } else {
            const step =
              activeStep !== null
                ? activeStep
                : data["analyses"]["defaultProjectView"];

            return (
              <div>
                <Slide
                  direction={getDirection(0)}
                  in={step === 0}
                  mountOnEnter
                  unmountOnExit
                  timeout={slideTimeOut}
                  key={"slideTableContent"}
                >
                  <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    className={classes.tableWrapper}
                    key={"grid-table"}
                  >
                    <Table
                      key={"project-view-table"}
                      columns={data["analyses"]["analysesList"]}
                      rows={data["analyses"]["analysesRows"]}
                      handleForwardStep={handleForwardStep}
                    />
                  </Grid>
                </Slide>
                <Slide
                  timeout={slideTimeOut}
                  direction={getDirection(1)}
                  in={step === 1}
                  mountOnEnter
                  key={"slideGraph"}
                >
                  <Grid
                    container
                    className={classes.root}
                    spacing={2}
                    key={"grid-container"}
                  >
                    <Grid
                      item
                      xs={6}
                      sm={3}
                      style={{ height: "50vh", zIndex: 1000 }}
                      key={"grid-search"}
                    >
                      <Search
                        key={"search"}
                        selectedOptions={selectedOptions}
                        filters={data.analyses.analysesList}
                        handleFilterChange={(selection, type) =>
                          handleFilterChange(selection, type)
                        }
                        handleForwardStep={handleForwardStep}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} key={"grid-content"} ref={dimRef}>
                      <CanvasGraph
                        graphDim={graphDim}
                        isLoading={false}
                        key={"packing-circles"}
                        filters={filters}
                        data={data.analyses.analysesTree.children}
                        handleFilterChange={(filters, type) =>
                          handleFilterChange(filters, type)
                        }
                        handleForwardStep={handleForwardStep}
                      />
                    </Grid>
                  </Grid>
                </Slide>
                <div className={classes.stepper} key={"project-view-stepper"}>
                  {[0, 1].map((label, index) => {
                    return step === index ? (
                      <RadioButtonCheckedIcon className={classes.activeWhite} />
                    ) : (
                      <FiberManualRecordIcon
                        className={
                          index === step
                            ? classes.activeWhite
                            : classes.disabled
                        }
                        onClick={() => {
                          const newActiveStep = step === 0 ? 1 : 0;
                          client.query({
                            query: SET_CACHE_SETTING,
                            variables: {
                              type: "isSpiderSelectionDefault",
                              value: newActiveStep,
                              auth: { authKeyID: authKeyID, uid: uid }
                            }
                          });
                          setActiveStep(newActiveStep);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          }
        }
      }}
    </Query>
  ) : null;
};

export default withStyles(styles)(ProjectViewContent);
