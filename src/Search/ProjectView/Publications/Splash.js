import React, { useEffect, useState, useRef, useCallback } from "react";

import { makeStyles } from "@material-ui/styles";

import { useDashboardState } from "../ProjectState/dashboardState";

import { ReactComponent as SvgHex } from "./hex.svg";

import { ReactComponent as SvgHex2 } from "./hex2.svg";

import splash from "./Splash.png";

import * as d3 from "d3";

const useClasses = makeStyles(theme => ({}));
const Splash = ({ handleForwardStep }) => {
  const [context, saveContext] = useState();

  const dimensions = { width: 1900, height: 1000 };
  const [imgSource, setImgSource] = useState({
    src: splash,
    name: "splash"
  });

  const ease = d3.easePolyInOut.exponent(4.0);
  const easeDuration = 500;

  const [ref] = useHookWithRefCallback();

  function useHookWithRefCallback() {
    const ref = useRef(null);

    const setRef = useCallback(async node => {
      if (node && context === undefined) {
        d3.select("#hex")
          .on("mouseover", function() {
            d3.select(this).attr("opacity", 1);
          })
          .on("mouseout", function() {
            d3.select(this).attr("opacity", 0);
          })
          .on("mousedown", function() {
            //go to cellmine
          })
          .attr("opacity", 0);

        d3.select("#hex2")
          .on("mouseover", function() {
            d3.select(this).attr("opacity", 1);
          })
          .on("mousedown", function() {
            handleForwardStep();
          })
          .on("mouseout", function() {
            d3.select(this).attr("opacity", 0);
          })
          .attr("opacity", 0);
      }
    }, []);

    return [setRef];
  }

  return (
    <div style={{ marginTop: 5, height: "100%" }}>
      <div
        style={{
          width: dimensions.width + "px",
          height: dimensions.height + "px",
          position: "relative"
        }}
        ref={ref}
      >
        <div
          id="canvasGraph"
          style={{
            width: dimensions.width + "px",
            height: dimensions.height + "px",
            position: "relative",
            pointerEvents: "all"
          }}
        >
          <img
            alt="splash page image"
            src={imgSource.src}
            width={1900}
            height={1000}
            id={"img-" + imgSource.id}
            style={{ zIndex: 2, position: "absolute", pointerEvents: "none" }}
          />
          <svg
            id="placeHolder"
            style={{ position: "absolute" }}
            viewBox={"0 0 " + dimensions.width + " " + dimensions.height}
          >
            <SvgHex />
            <SvgHex2 />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Splash;
