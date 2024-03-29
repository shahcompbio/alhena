import React from "react";
import { makeStyles } from "@material-ui/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

const useTabsStyles = makeStyles(() => ({
  root: {
    overflow: "visible"
  },
  scroller: {
    overflow: "visible!important"
  },
  indicator: {
    display: "none"
  }
}));
const useTabStyles = makeStyles(({ palette, spacing, breakpoints }) => {
  const defaultBgColor = palette.grey[500];
  const defaultSelectedBgColor = palette.background.default;
  const defaultMinWidth = {
    md: 120
  };
  return {
    root: ({
      bgColor = defaultBgColor,
      minWidth = defaultMinWidth,
      isSelected
    }) => ({
      opacity: 1,
      overflow: "initial",
      minHeight: 64,
      minWidth: 250,
      color: palette.background.default,
      background: "rbga(0,0,0,0)",
      transition: "0.5s",

      "&:before": {
        content: '" "',
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        borderRadius: 10,
        marginLeft: isSelected ? -30 : -10,
        backgroundColor: bgColor,
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
      color: palette.background.default,
      fontWeight: "bold",

      zIndex: 3,
      "&:before": {
        backgroundColor: selectedBgColor,
        boxShadow: "3px 3px 8px 0 rgba(0,0,0,0.38)"
      },
      "&:after": {
        width: spacing(3.5)
      }
    }),
    wrapper: ({ isSelected }) => ({
      marginLeft: isSelected ? -175 : -150,
      zIndex: 2,
      fontSize: "20px",
      marginTop: spacing(1),
      textTransform: "initial"
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
            {...tabProps}
            {...tab}
            classes={tabClasses}
            style={{
              color: "black"
            }}
          />
        );
      })}
    </Tabs>
  );
};
export default SeperatedTabs;
