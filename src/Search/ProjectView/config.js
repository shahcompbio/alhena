export const config = {
  rootSize: 3000,
  depthTohierarchy: {
    1: "sample_id",
    2: "library_id",
    3: "jira_id"
  },
  hierarchyToDepth: {
    project: 0,
    sample_id: 1,
    library_id: 2,
    jira_id: 3
  },
  filterHeirarchy: ["sample_id", "library_id", "jira_id"],
  filtersOffSet: 700
};
