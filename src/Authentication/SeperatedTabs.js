import React from "react";
import { makeStyles } from "@mui/styles";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const useTabsStyles = makeStyles(() => ({
  root: {
    overflow: "visible",
    alignItems: "baseline",
    marginLeft: "-70px !important"
  },
  scroller: {
    overflow: "visible!important"
  },
  indicator: {
    display: "none"
  },
  flexContainer: {
    marginTop: 45
  }
}));
const useTabStyles = makeStyles(({ palette, spacing, breakpoints }) => {
  const defaultBgColor = palette.grey[500];
  const defaultSelectedBgColor = palette.background.default;
  const defaultMinWidth = {
    md: 120
  };
  return {
    text: ({}) => ({
      fontSize: 30
    }),
    root: ({
      bgColor = defaultBgColor,
      minWidth = defaultMinWidth,
      isSelected
    }) => ({
      opacity: 1,
      marginLeft: "10px !important",
      overflow: "initial !important",
      minHeight: "64px !important",
      minWidth: "250px !important",

      transition: "0.5s",
      color: "black !important",
      fontWeight: "bold !important",
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
        backgroundColor: isSelected ? "white" : bgColor,
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
      }
    }),
    selected: ({ selectedBgColor = defaultSelectedBgColor }) => ({
      color: "black !important",
      fontWeight: "bold !important",
      backgroundColor: selectedBgColor + " !important",
      alignItems: "baseline !important",
      zIndex: "3 !important",
      "&:before": {
        boxShadow: "3px 3px 8px 0 rgba(0,0,0,0.38)"
      },
      "&:after": {
        width: spacing(3.5)
      }
    }),
    wrapper: ({ isSelected, bgColor = defaultBgColor }) => ({
      marginLeft: isSelected ? -200 : -150,
      zIndex: "2 !important",
      backgroundColor: bgColor,
      fontSize: "20px !important",
      textAlign: "left",
      marginTop: spacing(1),
      textTransform: "initial !important"
    })
  };
});

const SeperatedTabs = ({ tabs, tabStyle, tabProps, ...props }) => {
  const tabsClasses = useTabsStyles(props);

  return (
    <Tabs {...props} orientation="vertical" classes={tabsClasses}>
      {tabs.map((tab, index) => {
        const isSelected = props.value === index;
        const tabClasses = useTabStyles({
          ...tabProps,
          ...tabStyle,
          isSelected
        });
        return (
          <Tab
            key={tab.label}
            {...tab}
            classes={tabClasses}
            style={{
              color: "black"
            }}
          ></Tab>
        );
      })}
    </Tabs>
  );
};
export default SeperatedTabs;
