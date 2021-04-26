import React, { useEffect, useState, useRef, useCallback } from "react";
import "./publications.css";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";

import { makeStyles } from "@material-ui/styles";
import Search from "./Search.js";

import { IconButton, Switch } from "@material-ui/core";
import voronoiData from "./illistrator/cords.js";

import all from "./illistrator/light.svg";

import CircularProgressWithLabel from "./CircularProgress.js";

import { useDashboardState } from "../ProjectState/dashboardState";
import imgSA039Mx2SA906b0 from "./illistrator/SA039Mx2SA906b0.png";
import imgSA1035X4XB02879 from "./illistrator/SA1035X4XB02879.png";
import imgCellLine from "./illistrator/CellLine.png";
import imgSA609X3X8MB03073 from "./illistrator/SA609X3X8MB03073.png";
import imgSA609X1XB00290 from "./illistrator/SA609X1XB00290.png";
import imgSA532X1XB00118 from "./illistrator/SA532X1XB00118.png";
import imgSA535X5XB02895 from "./illistrator/SA535X5XB02895.png";
import imgSA609X3X8XB03076 from "./illistrator/SA609X3X8XB03076.png";
import title from "./illistrator/title.png";

import * as d3 from "d3";
import d3Tip from "d3-tip";

import { data } from "./fitness.js";

const lineGen = d3
  .lineRadial()
  .angle(d => d.x)
  .radius(d => d.y);

var progress = 10;
const imagesMapping = {
  SA609X3X8MB03073: imgSA609X3X8MB03073,
  SA532X1XB00118: imgSA532X1XB00118,
  SA039Mx2SA906b0: imgSA039Mx2SA906b0,
  SA535X5XB02895: imgSA535X5XB02895,
  SA609X1XB00290: imgSA609X1XB00290,
  SA609X3X8XB03076: imgSA609X3X8XB03076,
  SA1035X4XB02879: imgSA1035X4XB02879,
  CellLine: imgCellLine
};
const useClasses = makeStyles(theme => ({
  iconContainer: {
    padding: 25,
    marginLeft: 10,
    fontSize: "xxx-large",
    color: "white",
    background: "#293244",
    textAlign: "center",
    height: 50,
    width: 50,
    "&:hover": {
      background: "#151a24"
    }
  }
}));
const Publications = ({ handleForwardStep }) => {
  const [{}, dispatch] = useDashboardState();
  const [context, saveContext] = useState();
  const [voronoi, saveVoronoi] = useState(null);
  const [imgSource, setImgSource] = useState({
    src: imgSA039Mx2SA906b0,
    name: "SA039Mx2SA906b0"
  });
  const [radius, setRadius] = useState({
    prev: 99,
    current: 100
  });
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [paintReady, setPaintReady] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dataTree, setTree] = useState(null);
  const [flatAnalysisList, storeFlatAnalysisList] = useState([]);
  const [sampleList, storeSampleList] = useState([]);
  const [currentInnerNodes, setCurrentInnerNodes] = useState([]);
  const classes = useClasses();
  const dimensions = { width: 1000, height: 750 };
  const ease = d3.easePolyInOut.exponent(4.0);
  const easeDuration = 500;

  const tooltip = d3Tip()
    .attr("class", "d3-tipFitness")
    //  .offset([-100, -10])
    .html(function(d) {
      return "Analysis: " + d.name + " </br>Library: " + d.library;
    });
  function searchTree(element, matchingTitle) {
    if (element.name === matchingTitle) {
      return element;
    } else if (element.children != null) {
      var i;
      var result = null;
      for (i = 0; result == null && i < element.children.length; i++) {
        result = searchTree(element.children[i], matchingTitle);
      }
      return result;
    }
    return null;
  }
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
      const choosenNode = radius.current - radius.prev;
      var nodes = [];
      const modifiedNodes = currentInnerNodes.sort((a, b) => a.angle - b.angle);

      const isClockwise = radius.prev < radius.current;
      const closest = isClockwise
        ? modifiedNodes[0].angle === 0
          ? modifiedNodes[choosenNode]
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

      var bboxList = [];
      setImgSource({
        src: imagesMapping[closest["leaf"]["data"]["name"].replace(" ", "")],
        name: closest["leaf"]["data"]["name"].replace(" ", "")
      });

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

      svg.selectAll(".straightLinks").remove("*");
      svg.selectAll(".straightNodes").remove("*");

      voronoi.call(tooltip);
      d3.select("#img-" + closest["leaf"]["data"]["name"]).attr("opacity", 1);
      const vData =
        voronoiData[closest["leaf"]["data"]["name"].replace(" ", "")];
      const currentDimensions = vData.map(
        entry => entry[Object.keys(entry)[0]]
      );
      const allXCords = currentDimensions.map(entry => entry[0]);
      const allYCords = currentDimensions.map(entry => entry[1]);

      const voronoid = d3
        .voronoi()
        .x(d => d[Object.keys(d)[0]][0])
        .y(d => d[Object.keys(d)[0]][1])
        .extent([
          [Math.min(...allXCords) - 50, Math.min(...allYCords) - 50],
          [Math.max(...allXCords) + 50, Math.max(...allYCords) + 50]
        ]);

      const voronoiUpdate = voronoi
        .selectAll("path")
        .data(voronoid(vData).polygons(), d => {
          if (!d) {
            console.log(d);
          }
          return d;
        });
      voronoi.selectAll("circle").remove("*");

      voronoiUpdate.exit().remove();
      voronoiUpdate.attr("d", d => (d ? "M" + d.join("L") + "Z" : null));
      voronoiUpdate
        .enter()
        .append("path")
        //  .style("stroke", "#2074A0")
        //  .style("stroke-width", 3)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr("d", d => (d ? "M" + d.join("L") + "Z" : null))
        .attr("class", d => {
          if (d) {
            return Object.keys(d.data)[0];
          } else {
            return null;
          }
        })
        .on("mouseover", function(d) {
          const selection = Object.keys(d.data)[0];
          const location = d.data[Object.keys(d.data)];

          const node = searchTree(
            closest["leaf"]["data"],
            selection.replace("s-node-", "")
          );

          if (node !== null) {
            const light =
              node["label"].indexOf("Holiday") !== -1
                ? "#pinkLight"
                : node["label"].indexOf("Rx") !== -1 &&
                  node["label"].indexOf("UnRx") == -1
                ? "#redLight"
                : "#light";
            d3.select(light)
              .attr("class", "showLight")
              .attr(
                "transform",
                "translate(" + location[0] + "," + location[1] + ")"
              );

            tooltip.show(
              {
                name: selection.replace("s-node-", ""),
                library: node["library"],
                location: selection
              },
              this
            );

            tooltip
              .style("top", d => location[1] - 35 + "px")
              .style("left", d => location[0] - 94.18 + "px");
          }
        })
        .on("mouseout", function() {
          d3.selectAll("#light, #pinkLight, #redLight").attr(
            "class",
            "hideLight"
          );
          tooltip.hide();
        })
        .on("mousedown", function(d) {
          const selection = Object.keys(d.data)[0];
          d3.select("#root").classed("blackBackground", false);
          d3.select("#d3-tipFitness").classed("hideLight", true);
          dispatch({
            type: "ANALYSIS_SELECT",
            value: { selectedAnalysis: selection.replace("s-node-", "") }
          });
          handleForwardStep();
        });

      setButtonDisabled(false);
      setRadius({ prev: radius["current"], current: radius["current"] });
    }
  }, [radius]);

  useEffect(() => {
    var offset = { x: 0, y: 0 };

    offset = { x: 0, y: dimensions.height / 2, scale: 1 };

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
  }, []);

  useEffect(() => {
    if (paintReady) {
      setRadius({ prev: 0, current: 0 });
    }
  }, [paintReady]);

  const [ref] = useHookWithRefCallback();
  useEffect(() => {
    d3.xml(all).then(data => {
      const mainNode = document.getElementById("canvasGraph");
      mainNode.insertBefore(data.documentElement, mainNode.childNodes[0]);
      d3.selectAll("#light, #pinkLight, #redLight").attr("class", "hideLight");
    });
  }, [false]);

  function useHookWithRefCallback() {
    const ref = useRef(null);

    const setRef = useCallback(async node => {
      if (node && context === undefined) {
        d3.select("#root").attr("class", "blackBackground");

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

        var voronoiSaved = d3
          .select("#canvasSelection")
          .append("g")
          .attr("class", "voronoi-group");
        saveVoronoi(voronoiSaved);

        function flatten(into, node) {
          if (node == null) return into;
          if (Array.isArray(node)) return node.reduce(flatten, into);
          into.push({ name: node["name"] });
          return flatten(into, node.children);
        }

        var result = flatten([], data["children"]);

        storeSampleList(data["children"]);
        storeFlatAnalysisList([
          ...result.filter(row => row["name"] !== "Cell Line")
        ]);

        setInterval(function() {
          setPaintReady(true);
        }, 1000);
      }
    }, []);

    return [setRef];
  }
  return (
    <div style={{ marginTop: 45, height: "100%" }}>
      {false && <CircularProgressWithLabel progress={progress} />}
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
          <svg
            id="canvasSelection"
            viewBox={"0 0 " + dimensions.width + " " + dimensions.height}
            style={{
              pointerEvents: "none",
              width: dimensions.width + "px",
              height: dimensions.height + "px",
              position: "absolute",
              zIndex: 10
            }}
          />
          <img
            alt="dashboard selection tool"
            src={imgSource.src}
            width={1000}
            height={750}
            id={"img-" + imgSource.id}
            style={{ zIndex: 2, position: "absolute" }}
          />
        </div>
      </div>
      <div>
        <img
          alt="dashboard selection tool"
          src={title}
          width={500}
          height={125}
          style={{ position: "absolute", float: "right", top: 20, right: 0 }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          zIndex: 100,
          right: 100,
          top: 0,
          height: "100%",
          marginLeft: 50
        }}
      >
        <div style={{ marginTop: "40vh" }}>
          <IconButton
            classes={{
              root: classes.iconContainer
            }}
            style={{ marginRight: 150 }}
            disabled={isButtonDisabled}
          >
            <ArrowUpwardIcon
              fontSize="large"
              onClick={() => {
                setButtonDisabled(true);
                setRadius({
                  current: radius["current"] - 1,
                  prev: radius["current"]
                });
              }}
            />
          </IconButton>
          <IconButton
            disabled={isButtonDisabled}
            classes={{
              root: classes.iconContainer
            }}
          >
            <ArrowDownwardIcon
              fontSize="large"
              onClick={() => {
                setButtonDisabled(true);
                setRadius({
                  current: radius["current"] + 1,
                  prev: radius["current"]
                });
              }}
            />
          </IconButton>
        </div>
        <div style={{ marginTop: "10vh" }}>
          <Search
            analysisList={flatAnalysisList}
            dispatch={dispatch}
            handleForwardStep={handleForwardStep}
            sampleList={sampleList}
            goToSample={selectedSample => {
              const numberOfNodesForward = currentInnerNodes
                .sort((a, b) => a.angle - b.angle)
                .map(node => node.leaf.data.name)
                .indexOf(selectedSample);
              if (numberOfNodesForward !== 0) {
                setButtonDisabled(true);
                setRadius({
                  current: radius["current"] + numberOfNodesForward,
                  prev: radius["prev"]
                });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Publications;
