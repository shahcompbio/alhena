export const config = {
  DisplayConfig: {
    viewBoxX: window.innerWidth,
    viewBoxY: window.innerHeight * 3,
    XOffset: window.innerWidth / 10,
    yOffset: window.innerHeight / 4,
    filtersOffSet: 700,
    rootSize: 3000
  },
  FilterConfig: {
    filterHeirarchy: ["sample_id", "library_id", "jira_id"]
  }
};
