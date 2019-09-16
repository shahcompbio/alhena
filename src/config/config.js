export const config = {
  DisplayConfig: {
    viewBoxX: window.innerWidth,
    viewBoxY: window.innerHeight * 3,
    XOffset: window.innerWidth / 10,
    yOffset: window.innerHeight / 4,
    sunburstXOffset: window.innerWidth / 4,
    sunburstYOffset: window.innerHeight / 2,
    filtersOffSet: 700
  },
  FilterConfig: {
    filterHeirarchy: ["sample_id", "library_id", "jira_id"]
  },
  AnimationConfig: {
    filterHeirarchy: ["project", "sample_id", "library_id", "jira_id"],
    stages: {
      none: [
        {
          from: ["none", "project", "sample_id", "library_id", "jira_id"],
          stages: [0]
        },
        {
          from: ["library_id", "jira_id"],
          stages: [3]
        }
      ],
      project: [
        { from: ["none", "project", "sample_id"], stages: [0] },
        { from: ["library_id", "jira_id"], stages: [2] }
      ],
      sample_id: [
        { from: ["none", "project"], stages: [0] },
        { from: ["library_id", "jira_id"], stages: [2] }
      ],
      library_id: [
        { from: ["none", "project", "sample_id"], stages: [0, 1, 2] }
      ],
      jira_id: [{ from: ["none", "project"], stages: [0, 1, 2] }]
    }
  }
  /*
  stage 0 - general clustered layout
  for both proj and for sample

  stage 1 -  usually includes stage 0 and stage 1
  goop dots together
  plus zoom

//complicated stages
  stage 2 -
  from sunburst, turn sunburst into 1 circel
  and goo balls out of it

  */
};
