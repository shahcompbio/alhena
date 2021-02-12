import React, { useEffect, useState, useRef, useCallback } from "react";
import "./publications.css";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";

import {
  FormGroup,
  FormControlLabel,
  IconButton,
  TextField,
  Switch,
  SvgIcon
} from "@material-ui/core";

//import { ReactSVG } from "react-svg";
import lineageMixtureA from "./illistrator/mixtureA.svg";
import sA535X5XB02895 from "./illistrator/SA535X5XB02895.svg";
import sa1035 from "./illistrator/sa1035.svg";
import all from "./illistrator/all.svg";

import { useDashboardState } from "../ProjectState/dashboardState";
//import { ReactComponent as UpArrow } from "./upArrow-2.svg";
//import { ReactComponent as DownArrow } from "./downArrow-2.svg";

import * as d3 from "d3";
import d3Tip from "d3-tip";

import { data } from "./fitness.js";

const spacingOffset = 200;
const getScreenType = width => ({
  isBigScreen: width > 1700,
  isMedScreen: width >= 1330 && width <= 1700,
  isSmallScreen: width < 1330,
  is1DPR: window.devicePixelRatio === 1
});
const lineGen = d3
  .lineRadial()
  .angle(d => d.x)
  .radius(d => d.y);

const Publications = ({ handleForwardStep }) => {
  const [{ selectedAnalysis }, dispatch] = useDashboardState();
  const [context, saveContext] = useState();
  const [checked, setChecked] = useState(false);
  const [radius, setRadius] = useState({
    prev: 99,
    current: 100
  });

  const [paintReady, setPaintReady] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dataTree, setTree] = useState(null);
  const [currentInnerNodes, setCurrentInnerNodes] = useState([]);

  const dimensions = { width: 1000, height: 700 };
  const ease = d3.easePolyInOut.exponent(4.0);
  const easeDuration = 500;

  const tooltip = d3Tip()
    .attr("class", "d3-tipFitness")
    .offset([-10, 0])
    .html(function(d) {
      return "<strong>" + d.name + "</strong> ";
    });

  function getOriginalPt(x, y, matrix) {
    var x1 = x * matrix.a + y * matrix.b + matrix.e,
      y1 = x * matrix.c + y * matrix.d + matrix.f;
    return { x: x1, y: y1 };
  }

  useEffect(() => {
    //first time around to center
    if (radius.prev === 0 && radius.current === 0) {
      var originalPoints = [];
      const center = dataTree
        .descendants()
        .filter(leaf => leaf["depth"] === 0)[0];

      const readableLine = {
        x1: center.x + offset.x,
        y1: center.y + offset.y,
        x2: center.x + offset.x + dimensions.width / 3,
        y2: center.y + offset.y
      };

      var svg = d3.select("#svg");

      d3.selectAll("#nodes circle")
        .filter(leaf => leaf["depth"] === 1)
        .each(function(d, i) {
          var circle = d3.select(this);
          const bb = circle.node().getBBox();

          const translate = this.transform.baseVal.consolidate()["matrix"];

          const point =
            d["children"].length === 1
              ? getOriginalPt(bb.x, bb.y, translate)
              : getOriginalPt(
                  bb.x + bb.width / 2,
                  bb.y + bb.height / 2,
                  translate
                );

          const x1 = point["x"] + offset.x;
          const y1 = point["y"] + offset.y;

          const dx1 = readableLine.x1 - readableLine.x2;
          const dy1 = readableLine.y1 - readableLine.y2;
          const dx2 = readableLine.x1 - x1;
          const dy2 = readableLine.y1 - y1;
          const a1 = Math.atan2(dy1, dx1);
          const a2 = Math.atan2(dy2, dx2);

          //  const sign = a1 > a2 ? 1 : -1;
          const rad = a1 - a2;
          //    const K = -sign * Math.PI * 2;
          const angle =
            ((rad > 0 ? rad : 2 * Math.PI + rad) * 360) / (2 * Math.PI);

          originalPoints = [
            ...originalPoints,
            { x1: x1, y1: y1, leaf: d, angle: angle }
          ];
        });

      setCurrentInnerNodes([...originalPoints]);
      setRadius({ prev: 100, current: 101 });
    }

    //all consecutive times around
    if (radius.prev !== radius.current && dataTree) {
      var nodes = [];
      const modifiedNodes = currentInnerNodes.sort((a, b) => a.angle - b.angle);

      const isClockwise = radius.prev < radius.current;
      const closest = isClockwise
        ? modifiedNodes[0].angle === 0
          ? modifiedNodes[1]
          : modifiedNodes[0]
        : modifiedNodes[modifiedNodes.length - 1];

      const newAngles = modifiedNodes.map((node, index) => {
        const angle =
          closest.angle === node.angle && isClockwise
            ? 0
            : isClockwise
            ? node.angle - closest.angle
            : node.angle + (360 - closest.angle);

        return {
          ...node,
          angle: angle < 0 ? 360 + angle : angle === 360 ? 0 : angle
        };
      });
      setCurrentInnerNodes([...newAngles]);

      const angle = closest.angle + currentAngle;

      d3.select("#links")
        .transition()
        .duration(easeDuration)
        .ease(ease)
        .attr(
          "transform",
          `rotate(${angle},` +
            offset.x +
            `,` +
            offset.y +
            `) translate(` +
            offset.x +
            `,` +
            offset.y +
            `) scale(` +
            offset.scale +
            `)`
        );

      function getLinkText(tree) {
        if (!tree.hasOwnProperty("children")) {
          return "#link-" + tree.data.name + ", ";
        } else {
          return tree["children"].reduce(
            (str, child) => str + getLinkText(child),
            "#link-" + tree.data.name + ", "
          );
        }
      }
      function getChildren(tree) {
        if (!tree.hasOwnProperty("children")) {
          return tree.data.name + ",";
        } else {
          return tree["children"].reduce(
            (str, child) => str + getChildren(child),
            tree.data.name + ","
          );
        }
      }

      d3.select("#nodes")
        .transition()
        .duration(easeDuration)
        .ease(ease)
        .attr(
          "transform",
          `rotate(${angle},` +
            offset.x +
            `,` +
            offset.y +
            `) translate(` +
            offset.x +
            `,` +
            offset.y +
            `) scale(` +
            offset.scale +
            `)`
        );

      setCurrentAngle(angle);

      const selectionLinkText = getChildren(closest["leaf"]);
      const linkSelection = getLinkText(closest["leaf"]);
      const selectionList = selectionLinkText
        .substr(0, selectionLinkText.length - 1)
        .split(",");

      d3.selectAll(".highlightNode").classed("highlightNode", false);
      d3.selectAll(".highlightLink").classed("highlightLink", false);

      if (radius.current !== 101) {
        /*  d3.selectAll("#SA535X5XB02895, #SA039Mx2SA906b0")
          .transition()
          .duration(easeDuration)
          .ease(ease)
          .attr(
            "transform",
            `rotate(${-35},` + offset.x + `,` + offset.y + `)`
          );*/
        //  .attr("transform", "rotate(48.2,0,350)");
      }
      var bboxList = [];

      var nodeTransform;
      d3.select("#nodes").each(function(d) {
        nodeTransform = this.transform.baseVal.consolidate()["matrix"];
      });

      var dataChildrenCopy = data["children"].filter(
        child => child["name"] === closest["leaf"]["data"]["name"]
      );
      const curr = { name: "flare", children: [...dataChildrenCopy] };
      var cluster = data => {
        const root = d3
          .hierarchy(data)
          .sort((a, b) => d3.ascending(a.data.alhena_id, b.data.alhena_id));
        root.dx = 50;
        root.dy = dimensions.width / 2 / (root.height + 1);
        return d3.tree().nodeSize([root.dx, root.dy])(root);
      };

      var nodes = cluster(curr);

      var svg = d3.select("#svg");

      const selectionNodeText = selectionList
        .map((selection, i) => "#node-" + selection)
        .join(", ");

      const selectionLink = selectionList
        .map((selection, i) => "#link-" + selection)
        .join(", ");

      d3.selectAll(".hidden").classed("hidden", false);

      d3.selectAll(selectionNodeText)
        .transition()
        .delay(easeDuration - 100)
        .attr("class", "hidden");

      d3.selectAll(selectionLink)
        .transition()
        .delay(easeDuration - 100)
        .attr("class", "hidden");

      d3.select("#links")
        .selectAll("path")
        .data(dataTree.links())
        .join("path")
        .attr("id", d =>
          d.target.depth === 0 ? "rootNode" : "link-" + d.target.data.name
        )
        .attr(
          "d",
          d3
            .lineRadial()
            .angle(d => (d.x * Math.PI) / 180)
            .radius(d => d.y)
        )
        .attr("d", d => lineGen([d.source, d.target]));

      d3.select("#nodes")
        .selectAll("circle")
        .data(dataTree.descendants())
        .join("circle")
        .attr(
          "transform",
          d => `
    rotate(${(d.x * 180) / Math.PI - 90})
    translate(${d.y},0)
  `
        )
        .attr("id", d => {
          return d.depth === 0
            ? "rootNode"
            : "node-" +
                (d.data.name === undefined ? d.data.alhena_id : d.data.name);
        });

      const t = 700;

      function elbow(d, i) {
        return (
          "M" +
          d.source.y +
          "," +
          d.source.x +
          "V" +
          d.target.x +
          "H" +
          d.target.y
        );
      }
      svg.selectAll(".straightLinks").remove("*");
      svg.selectAll(".straightNodes").remove("*");

      d3.selectAll(".illistrator-show").classed("illistrator-show", false);

      const illistratorSVG = d3.select(
        "#" + closest["leaf"]["data"]["name"].replace(/\s/g, "")
      );

      illistratorSVG.call(tooltip);
      const currNodes = illistratorSVG
        .selectAll("*[id^=s-node]")
        .on("mouseover", function(d) {
          const selection = d3.select(this).attr("id");
          tooltip.show({ name: selection.replace("s-node-", "") }, this);
        })
        .on("mouseout", tooltip.hide);

      console.log(currNodes);
      /*  const factor = 0.3;
      const centerY = 350;
      var tx = 0 * (factor - 1),
        ty = -350 * (factor - 1);
      console.log(closest["leaf"]);
      console.log(angle);
      //
      const all = d3.select("#all");
      const parentList = [
        "#SA535X5XB02895",
        "#SA039Mx2SA906b0",
        "#SA1035X4XB02879"
      ];

      const parentString = parentList.join(",");
      console.log(parentString);
      const me = d3.select("#b-1").node();

      var x1 = me.getBBox().x + me.getBBox().width / 2; //the center x about which you want to rotate
      var y1 = me.getBBox().y + me.getBBox().height / 2; //the center y about which you want to rotate

      d3.selectAll("#SA535X5XB02895, #SA039Mx2SA906b0, #SA1035X4XB02879")
        .attr("transform", function(d, i) {
          console.log(d);
          console.log(i);
          if (parentList[i] !== "#" + closest["leaf"]["data"]["name"]) {
            return `rotate(${angle}, ${x1},${y1})`;
            /*translate(` +
            tx +
            `,` +
            ty +
            `) scale(` +
            factor +
            `)
          } else {
            console.log("hello");
            return `rotate(${angle}, ${x1},${y1})`;
          }
        })
        .attr("class", function(d, i) {
          if (parentList[i] !== "#" + closest["leaf"]["data"]["name"]) {
            return "dim-lineage";
          } else {
            return;
          }
        });*/
      //  .attr("transform", `rotate(${angle},` + 0 + `,` + 350 + `)`)
      //  .attr(
      //    "transform",
      //    "translate(" + tx + "," + ty + ") scale(" + factor + ")"
      //  ).
      //  .attr("class", "dim-lineage");
      console.log(offset);
      if (!illistratorSVG.empty()) {
        //  illistratorSVG.classed("dim-lineage", false);
        const factor = 1.3;
        const centerY = 350;
        var tx = 0 * (factor - 1),
          ty = -350 * (factor - 1);

        illistratorSVG
          .transition()
          .delay(easeDuration)
          .ease(d3.easeLinear)
          /*  .attr(
            "transform",
            "translate(" + tx + "," + ty + ") scale(" + factor + ")"
          )*/
          .attr("class", "illistrator-show");
      }
      //  .classed("illistrator-show", true);
      if (closest["leaf"]["data"]["name"] !== "SA1101" && false) {
        const links = svg
          .append("g")
          .classed("straightLinks", true)
          .attr("transform", "translate(" + offset.x + "," + offset.y + ")")
          .attr("fill", "none")
          .selectAll("path")
          .data(nodes.links())
          .join("path")
          .attr("d", elbow)
          .attr("id", d => "#S-link-" + d.source.data.name);

        links
          .transition()
          .delay(easeDuration - 150)
          .attr("stroke", "#555")
          .attr("stroke-width", 1.5)
          .attr("transform", "scale(1.5,1.5)");

        const circles = svg
          .append("g")
          .classed("item-hints", true)
          .classed("straightNodes", true)
          .attr("transform", "translate(" + offset.x + "," + offset.y + ")")
          .selectAll("circle")
          .data(nodes.descendants())
          .join("circle")
          .attr("id", d => {
            return "#S-node-" + d.data.name;
          })
          .attr("cx", d => d.y)
          .attr("cy", d => d.x)
          .on("mouseover", tooltip.show)
          .on("mouseout", tooltip.hide);

        circles.call(tooltip);

        circles
          .transition()
          .delay(easeDuration - 150)
          .attr("fill", d => "#999")
          .attr("r", 5)
          .attr("transform", "scale(1.5,1.5)");

        svg.select("#dashboardTitle").remove("*");
        svg
          .append("text")
          .attr("id", "dashboardTitle")
          .text(function(d) {
            return closest["leaf"]["data"]["name"];
          })
          .attr("x", (3 * dimensions.width) / 4)
          .attr("y", dimensions.height / 2);

        d3.selectAll(".straightNodes circle").each(function(d, i) {
          const bb = d3
            .select(this)
            .node()
            .getBBox();
          bboxList = [...bboxList, bb];
        });

        const allSelectedNodes = bboxList.sort((a, b) => a.x - b.x);

        const getDepth = ({ children }) =>
          1 + (children ? Math.max(...children.map(getDepth)) : 0);

        const depth = getDepth(closest["leaf"]);

        const timepointScale = d3
          .scaleLinear()
          .domain([1, depth])
          .range([
            allSelectedNodes[1].x * 1.5,
            allSelectedNodes[allSelectedNodes.length - 1].x * 1.5
          ]);

        const axis = d3.select(".timepointAxis");
        axis.selectAll("*").remove();

        axis.append("g").call(
          d3
            .axisBottom(timepointScale)
            .tickFormat(function(d) {
              return d + "X";
            })
            .ticks(depth)
            .tickPadding(15)
            .tickSize(10, 0)
        );
      }
      /*  console.log(closest["leaf"]["data"]["name"]);
      console.log(closest["leaf"]["data"]["name"] === "SA1101");
      //  console.log(selectionLinkText);
      //  console.log(selectionNodeText);
      if (closest["leaf"]["data"]["name"] === "SA1101") {
        //  d3.select(selectionNodeText).classed("hidden", true);
        //  d3.select(selectionLinkText).classed("hidden", true);

        d3.select(".timepointAxis").classed("hidden", true);
        d3.select("#dashboardTitle").classed("hidden", true);
        const node = d3.select("#g-sa1101");
        d3.select("#g-sa1101").attr("display", "all");

        node
          .transition()
          .delay(100)
          .ease(d3.easeLinear)
          .attr("class", "svg-override-show");

        console.log(d3.select("#g-sa1101"));
        const neonNode = d3.selectAll("#neon-node-SA1101AX30 path");
        neonNode.attr("pointerEvents", "all");
        neonNode
          .on("mouseover", function(d) {
            //    d3.select(this).style("transform", "scale(1.1,1.1)");
          })
          .on("click", function() {
            d3.select("#root").classed("blackBackground", false);
            dispatch({
              type: "ANALYSIS_SELECT",
              value: { selectedAnalysis: "SA1101bX60" }
            });

            handleForwardStep();
          });
        //  d3.select("#neon-node-SA1101AX30").remove("*");
      } else {
        d3.select("#g-sa1101").attr("display", "none");
        d3.select(".timepointAxis").classed("hidden", false);
        d3.select("#dashboardTitle").classed("hidden", false);
        d3.select("#lineage").classed("svg-hidden", true);
      }*/

      setRadius({ prev: radius["current"], current: radius["current"] });
    }
  }, [radius]);

  useEffect(() => {
    var offset = { x: 0, y: 0 };
    if (checked) {
      offset = { x: dimensions.width / 2, y: dimensions.height / 2, scale: 1 };
    } else {
      offset = { x: 0, y: dimensions.height / 2, scale: 1 };
    }
    d3.select("#links")
      .transition()
      .duration(easeDuration)
      .ease(ease)
      .attr(
        "transform",
        "rotate(" +
          currentAngle +
          "," +
          offset.x +
          `,` +
          offset.y +
          ") translate(" +
          offset.x +
          "," +
          offset.y +
          ") scale(" +
          offset.scale +
          ")"
      );
    d3.select("#nodes")
      .transition()
      .duration(easeDuration)
      .ease(ease)
      .attr(
        "transform",
        "rotate(" +
          currentAngle +
          "," +
          offset.x +
          `,` +
          offset.y +
          ") translate(" +
          offset.x +
          "," +
          offset.y +
          ") scale(" +
          offset.scale +
          ")"
      );
    setOffset({ ...offset });
  }, [checked]);

  useEffect(() => {
    if (paintReady) {
      setRadius({ prev: 0, current: 0 });
    }
  }, [paintReady]);

  const [ref] = useHookWithRefCallback();

  function useHookWithRefCallback() {
    const ref = useRef(null);
    const setRef = useCallback(async node => {
      if (node && context === undefined) {
        const radius = 400;
        const tree = d3
          .tree()
          //  .cluster()
          .size([2 * Math.PI, radius - 100])
          .separation((a, b) => {
            return (
              (a.parent.data.alhena_id === b.parent.data.alhena_id ? 1 : 2) /
              a.depth
            );
          });

        const root = tree(
          d3
            .hierarchy(data)
            .sort((a, b) => d3.ascending(a.data.alhena_id, b.data.alhena_id))
        );

        setTree(root);

        const svg = d3.select("#svg");
        //    .attr("viewBox", [0, 0, dimensions.width, dimensions.height]);

        svg
          .append("g")
          .attr("class", "timepointAxis")
          .attr("transform", "translate(0," + (dimensions.height - 70) + ")");
        svg
          .append("g")
          .attr("id", "links")
          .attr(
            "transform",
            "translate(" + 0 + "," + dimensions.height / 2 + ")"
          )
          .attr("fill", "none")
          .attr("stroke", "#555")
          .attr("stroke-width", 1.5)
          .selectAll("path")
          .data(root.links())
          .join("path")
          .attr("id", d =>
            d.target.depth === 0 ? "rootNode" : "link-" + d.target.data.name
          )
          .attr(
            "d",
            d3
              .lineRadial()
              .angle(d => (d.x * Math.PI) / 180)
              .radius(d => d.y)
          )
          .attr("d", d => lineGen([d.source, d.target]))
          /*  .attr(
            "d",
            d3
              .linkRadial()
              .angle(d => d.x)
              .radius(d => d.y)
          )*/
          .attr("stroke-opacity", d => (d.source.depth === 0 ? 0.4 : 0.7));

        svg
          .append("g")
          .attr("id", "nodes")
          .attr(
            "transform",
            "translate(" + 0 + "," + dimensions.height / 2 + ")"
          )
          .selectAll("circle")
          .data(root.descendants())
          .join("circle")
          .attr(
            "transform",
            d => `
      rotate(${(d.x * 180) / Math.PI - 90})
      translate(${d.y},0)
    `
          )
          .attr("id", d => {
            return d.depth === 0
              ? "rootNode"
              : "node-" +
                  (d.data.name === undefined ? d.data.alhena_id : d.data.name);
          })
          .attr("opacity", d => (d.depth === 0 ? 0 : 0.7))
          .attr("fill", d => "#999")
          .attr("r", 2.5);
        //d3.xml([lineageMixtureA, sA535X5XB02895])
        /*  const lineages = await Promise.all([
          d3.xml(lineageMixtureA),
          d3.xml(sA535X5XB02895),
          d3.xml(sa1035)
        ]);*/

        d3.xml(all).then(data => {
          const mainNode = document.getElementById("canvasGraph");
          mainNode.insertBefore(data.documentElement, mainNode.childNodes[0]);
          //    mainNode.appendChild(data.documentElement);
        });

        /*    const mainNode = document.getElementById("canvasGraph");
        lineages.map(data => {
          mainNode.appendChild(data.documentElement);
        });*/

        d3.select("#root").attr("class", "blackBackground");
        setInterval(function() {
          setPaintReady(true);
        }, 1000);
      }
    }, []);

    return [setRef];
  }

  return (
    <div style={{ marginTop: 45, height: "100%" }}>
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
            position: "absolute",
            pointerEvents: "all"
          }}
        >
          <svg
            id="svg"
            viewBox={"0 0 " + dimensions.width + " " + dimensions.height}
            style={{
              pointerEvents: "none",
              width: dimensions.width + "px",
              height: dimensions.height + "px",
              position: "absolute",
              zIndex: 1
            }}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: "80%",
          top: "45vh"
        }}
      >
        <IconButton
          style={{
            padding: 25,
            fontSize: "xxx-large",
            fill: "rgb(251, 247, 235)",
            color: "rgb(218, 215, 206)",
            textShadow:
              "rgb(222 198 121) 1px 1px 10px, rgb(220 179 49) 1px 1px 10px",
            textAlign: "center"
          }}
        >
          <ArrowUpwardIcon
            fontSize="large"
            onClick={() => {
              setRadius({
                current: radius["current"] - 1,
                prev: radius["current"]
              });
            }}
          />
        </IconButton>
        <IconButton style={{ color: "white" }}>
          <ArrowDownwardIcon
            fontSize="large"
            onClick={() => {
              setRadius({
                current: radius["current"] + 1,
                prev: radius["current"]
              });
            }}
          />
        </IconButton>
      </div>
    </div>
  );
};
/*          <ReactSVG
            wrapper="span"
            src={lineage}
            id="lineage"
            viewBox={"0 0 " + dimensions.width + " " + dimensions.height}
            style={{
              width: dimensions.width + "px",
              height: dimensions.height + "px",
              //  position: "absolute",
              pointerEvents: "all"
            }}
            className="svg-hidden"
          />*/

/*<ReactSVG
  wrapper="span"
  src={lineage}
  id="lineage"
  viewBox={"0 0 " + dimensions.width + " " + dimensions.height}
  style={{
    width: dimensions.width + "px",
    height: dimensions.height + "px",
    position: "absolute"
  }}
/>*
/*        <svg
          id="selectionLayer"
          style={{
            width: dimensions.width + "px",
            height: dimensions.height + "px",
            position: "relative"
          }}
        />*/
/*{" "}
<div style={{ paddingTop: 100 }}>
  <TextField
    id="outlined-helperText"
    label="Search Groups"
    defaultValue=""
  />
</div>
*/
export default Publications;
