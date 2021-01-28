export const config = {
  rootSize: 3000,
  depthTohierarchy: {
    1: "pseudobulk_group",
    2: "alhena_id"
  },
  hierarchyToDepth: {
    project: 0,
    pseudobulk_group: 1,
    alhena_id: 2
  },
  filterHeirarchy: ["pseudobulk_group", "alhen_id"],
  filtersOffSet: 700
};
