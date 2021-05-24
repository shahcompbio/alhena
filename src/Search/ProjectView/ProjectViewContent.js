import React, { useState, useRef } from "react";
import Search from "./Filter/Search.js";

import { useAppState } from "../../util/app-state";
import { withStyles } from "@material-ui/styles";

import CanvasGraph from "./Graph/CanvasGraph.js";
import Fitness from "./Publications/Fitness/Fitness.js";
import Cellmine from "./Publications/Cellmine/Cellmine.js";

import { Query } from "react-apollo";
import gql from "graphql-tag";
import { useDashboardState } from "./ProjectState/dashboardState";
import { Grid } from "@material-ui/core";

import fetchFileData from "./Publications/Cellmine/data/api";

const styles = {
  root: { flexGrow: 1, background: "#586773" },
  hide: {
    display: "none"
  },
  title: {
    color: "white",
    filter: "url(#textGlow)",
    paddingTop: 50,
    paddingLeft: 50
  }
};

const ProjectViewContent = ({ classes, handleForwardStep }) => {
  const [{ selectedDashboard }] = useDashboardState();

  const [{ authKeyID, uid }, dispatch] = useAppState();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [filters, setFilters] = useState([]);

  const [graphDim, setDim] = useState(0);
  const dimRef = useRef(0);
  const packingData = fetchFileData();
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

  return (
    <Grid container className={classes.root} spacing={2} key={"grid-container"}>
      <Grid item xs={12} sm={6} key={"grid-content"} ref={dimRef}>
        <Cellmine data={packingData} />
      </Grid>
    </Grid>
  );
};
/*   <Grid container className={classes.root} spacing={2} key={"grid-container"}>
      <Grid item xs={12} sm={6} key={"grid-content"} ref={dimRef}>
        <Fitness
          isLoading={true}
          key={"packing-circles"}
          filters={[]}
          analyses={{}}
          handleFilterChange={null}
          handleForwardStep={() => handleForwardStep()}
        />
      </Grid>
    </Grid>
  ) : (
    <Grid container className={classes.root} spacing={2} key={"grid-container"}>
      <Grid item xs={12} sm={6} key={"grid-content"} ref={dimRef}>
        <Cellmine data={packingData} />
      </Grid>
    </Grid>
  );*/

/*        {selectedDashboard !== "fitness" ? (
          <Fitness
            graphDim={graphDim}
            isLoading={false}
            key={"packing-circles"}
            filters={filters}
            handleFilterChange={(filters, type) =>
              handleFilterChange(filters, type)
            }
            handleForwardStep={() => handleForwardStep()}
          />
        ) : (
          <Cellmine data={packingData} />
        )}*/
export default withStyles(styles)(ProjectViewContent);
