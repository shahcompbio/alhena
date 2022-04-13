import React from "react";

import { Tab, Tabs } from "@mui/material";
import { styled } from "@mui/system";

const StyledTabs = styled(Tabs)({
  overflow: "visible",
  alignItems: "baseline",
  marginLeft: "-70px !important",
  color: "#2e344a",
  "& .MuiTabs-scroller": {
    "& .MuiButtonBase-root-MuiTab-root.Mui-selected": {
      color: "#2e344a"
    },
    overflow: "visible !important"
  },
  "& .MuiTabs-indicator": {
    display: "none"
  }
});

const StyledTab = styled(Tab, {
  shouldForwardProp: prop => prop
})(({ isselected, tabProps, tabStyle, theme }) => {
  const defaultBgColor = "grey";
  return {
    text: {
      fontSize: 30
    },
    opacity: 1,
    marginLeft: "10px !important",
    overflow: "initial !important",
    minHeight: "64px !important",
    minWidth: "250px !important",
    //margin: "10px",
    transition: "0.5s",
    fontWeight: "bold !important",
    color: isselected ? "#2e334a" : "#7e7f84",
    //background: "blue",
    //backgroundColor: "rgb(224 227 230) !important",
    alignItems: "baseline !important",
    zIndex: "3 !important",

    "&:before": {
      boxShadow: "3px 3px 8px 0 rgba(0,0,0,0.38)",
      content: '" "',
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      borderRadius: 10,
      //backgroundColor: isSelected ? "#fbfbfb" : bgColor,
      //  zIndex: "2 !important",
      //transform: "skewY(-4deg)",
      transformOrigin: "100%"
    },
    "&:after": {
      pointerEvents: "none",
      transition: "0.5s",
      content: '" "',
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      transform: "translateX(100%)",
      display: "block",
      width: 8,
      zIndex: 2,
      background:
        // eslint-disable-next-line max-len
        "linear-gradient(to top right, rgba(0,0,0,0.2), rgba(0,0,0,0.2) 45%, transparent, transparent 64%)"
    },
    ".MuiTab-selected": {
      color: "#2e344a !important",

      fontWeight: "bold !important",
      backgroundColor: tabStyle.selectedBgColor + " !important",
      alignItems: "baseline !important",
      zIndex: "3 !important",
      "&:before": {
        boxShadow: "3px 3px 8px 0 rgba(0,0,0,0.38)"
      },
      "&:after": {
        width: theme.spacing(3.5)
      }
    },
    ".MuiTab-wrapper": {
      marginLeft: isselected ? -200 : -150,
      zIndex: "2 !important",
      backgroundColor: tabStyle.bgColor,
      fontSize: "20px !important",
      textAlign: "left",
      marginTop: theme.spacing(1),
      textTransform: "initial !important"
    }
  };
});

const SeperatedTabs = ({ tabs, tabStyle, tabProps, ...props }) => {
  return (
    <StyledTabs {...props} orientation="vertical" textColor={"black"}>
      {tabs.map((tab, index) => {
        const isSelected = props.value === index;

        return (
          <StyledTab
            label={tab.label}
            key={tab.label}
            tabProps={tabProps}
            tabStyle={tabStyle}
            isselected={isSelected}
            color={"#2e344a"}
            {...tab}
            style={{
              color: isSelected ? "#2e344a !important" : "#9d9d9d !important",
              backgroundColor: isSelected ? "#fbfbfb" : "#ececec",
              borderRadius: 5
            }}
          />
        );
      })}
    </StyledTabs>
  );
};
export default SeperatedTabs;
