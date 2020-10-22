import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useLayoutEffect
} from "react";
import * as d3 from "d3";

import { createRoot, hierarchyColouring } from "./appendUtils.js";
import { getSelectionPath, originalRadiusCanvas } from "./utils";
import { config } from "../config.js";

import _ from "lodash";

import { useDashboardState } from "../ProjectState/dashboardState";

import { useAppState } from "../../../util/app-state";

import { initContext } from "../../../Dashboard/utils.js";
const graphDimension = 800;
const spacingOffset = 200;
const margin = {
  left: 50,
  top: 100
};

const CanvasGraph = ({
  isLoading,
  data,
  filters,
  handleFilterChange,
  handleForwardStep
}) => {
  const [{}, dispatch] = useDashboardState();
  const [{ dimensions }] = useAppState();

  const [context, saveContext] = useState();
  const [nodes, setNodes] = useState();
  const [links, setLinks] = useState();
  const [currScale, setCurrScale] = useState(1);

  const [allCircleCords, setAllCircleCords] = useState([]);

  const graphRef = useRef(null);
  const voronoid = d3
    .voronoi()
    .x(d => d.x * 0.5 + dimensions.width / 6)
    .y(d => d.y * 0.5 + dimensions.height / 4)
    .extent([
      [-dimensions.width, -dimensions.height],
      [dimensions.width, dimensions.height]
    ]);

  useEffect(() => {
    if (data && context) {
      var modifiedData = data;
      if (filters.length > 0) {
        modifiedData = data[0].children;
      }
      var root = createRoot(d3.hierarchy(modifiedData[0]));
      var nodes = root.descendants();
      var links = root.links();

      setNodes([...nodes]);
      setLinks([...links]);

      context.restore();
      clearAll(context);
      if (currScale !== 0.9) {
        context.translate(dimensions.width / 3, dimensions.height / 2);
        //  context.translate(300, 300);
        if (dimensions.width > 2000) {
          context.scale(0.2, 0.2);
        } else {
          context.scale(0.1, 0.1);
        }
        //  context.scale(0.9, 0.9);
        context.save();
      }
      setCurrScale(0.9);

      var filterOffset = filters.length > 0 ? spacingOffset : 0;

      drawLinks(context, links, [], filterOffset);

      const allCords = drawNodes(context, nodes, [], filterOffset);

      context.restore();

      context.fill();
      setAllCircleCords([...allCords]);
    }
  }, [data, context]);

  const drawLinks = (context, links, selectionText, filterOffset) => {
    context.strokeStyle = "white";
    context.lineWidth = 10;
    context.rotate(1.5708);
    links.forEach(link => {
      if (selectionText.length === 0) {
        context.strokeStyle = "white";
      } else if (selectionText.indexOf(link.target.data.target) !== -1) {
        context.lineWidth = 15;
        context.strokeStyle = "white";
      } else {
        context.strokeStyle = "#bdc3c7";
      }
      context.beginPath();
      d3
        .linkRadial()
        .angle(d => d.x)
        .radius(d => {
          const compactVersion = d.height === 0 ? 250 : 0;
          if (selectionText.indexOf(d.data.target) !== -1) {
            return d.y + 200 - filterOffset - compactVersion;
          } else {
            return d.y - filterOffset - compactVersion;
          }
        })
        .context(context)(link);
      context.stroke();
    });
    context.rotate(-1.5708);
  };

  const drawNodes = (
    context,
    allNodes,
    selectionText,
    filterOffset,
    currNode
  ) => {
    var allCords = [];
    allNodes.forEach(node => {
      context.rotate(node.x);
      var radius = originalRadiusCanvas(node);
      context.beginPath();
      var xPos = node.y - filterOffset;
      context.strokeStyle = "white";
      if (node.height === 0) {
        xPos -= 250;
      }
      if (selectionText.length !== 0) {
        context.shadowBlur = 0;
      }
      //main node
      if (node.depth === 0) {
        var gradient = context.createLinearGradient(0, 0, 0, dimensions.height);
        gradient.addColorStop(0, "#fff9de");
        gradient.addColorStop(1, "#f0f0d6");
        context.shadowBlur = 10;
        context.shadowColor = "white";
        context.fillStyle = gradient;
        xPos += 100 + filterOffset;
      } else if (selectionText.indexOf(node.data.target) !== -1) {
        //if hovered over
        if (node.depth === currNode.depth) {
          radius = 70;
        } else {
          radius = 30;
        }
        context.strokeStyle = hierarchyColouring[node.height];
        context.fillStyle = hierarchyColouring[node.height];
        context.shadowBlur = 0;
        xPos += 200;
      } else {
        if (selectionText.length === 0) {
          //nothing selected
          context.fillStyle = "white";
        } else {
          //not hovered over
          context.fillStyle = "grey";
        }
      }
      context.arc(xPos, 0, radius, 0, Math.PI * 2, true);

      var coordinates = getCordsFromTransform(node, context.getTransform());
      allCords = [...allCords, coordinates];

      context.fill();
      context.stroke();
      context.rotate(-node.x);
    });
    return allCords;
  };

  useEffect(() => {
    if (allCircleCords.length > 0) {
      if (!d3.select("#canvasGraphSelection g").empty()) {
        d3.select("#canvasGraphSelection g").remove();
      }
      const rootNode = allCircleCords.filter(
        node => node.element.depth === 0
      )[0];

      d3.select("#canvasGraphSelection")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + dimensions.width + "," + dimensions.height);

      var voronoi = d3
        .select("#canvasGraphSelection")
        .append("g")
        .attr("class", "voronoi-group");
      var devicePixelRatio = window.devicePixelRatio || 1;

      if (devicePixelRatio === 1) {
        voronoi.attr(
          "transform",
          "scale(2,2) translate(" +
            -dimensions.width * 0.1 +
            "," +
            -dimensions.height * 0.1 +
            ")"
        );
      } else {
        voronoi.attr(
          "transform",
          "rotate(-90 " + rootNode.x + " " + rootNode.y + ")"
        );
      }
      console.log(devicePixelRatio);
      console.log(window);
      /*   .attr(
          "transform",
          `rotate(-90)scale(0.5,0.5)translate(-` +
            (dimensions.width - dimensions.width / 6) +
            `,` +
            (dimensions.height - dimensions.height / 4) +
            `)`
        );*/

      voronoi
        .selectAll("path")
        .data(voronoid(allCircleCords).polygons(), d => {
          return d.data.element.data.target;
        })
        .enter()
        .append("path")
        //  .style("stroke", "#2074A0")
        //.style("stroke-width", 3)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr("d", d => (d ? "M" + d.join("L") + "Z" : null))
        .attr("class", d => {
          return d ? d.data.element.data.target + "-voronoi" : "";
        })
        .on("mouseover", (data, index, element) => {
          var currNode = data.data.element;
          var filterOffset;

          if (currNode.parent !== null) {
            var nodeSelectionText = getSelectionPath(currNode, ",");
            const selectionLayer = d3.select("#canvasGraphSelection");
            var previousSelectionClasses = selectionLayer.attr("class");

            const prevSelectedList =
              previousSelectionClasses === null
                ? []
                : previousSelectionClasses
                    .split(",")
                    .filter(nodeName => nodeName !== "");

            if (nodeSelectionText !== prevSelectedList) {
              selectionLayer.classed(previousSelectionClasses, true);

              const selectionText = nodeSelectionText.split(",");
              clearAll(context);
              filterOffset = filters.length > 0 ? spacingOffset : 0;

              drawLinks(context, links, selectionText, filterOffset);
              drawNodes(context, nodes, selectionText, filterOffset, currNode);
              changePanelText(context, selectionText, currNode);
              context.fill();
            }
          } else {
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(
              0,
              0,
              dimensions.width * 2,
              dimensions.height * 2
            );
            context.fill();
            context.restore();
            filterOffset = filters.length > 0 ? spacingOffset : 0;
            drawLinks(context, links, [], filterOffset);
            drawNodes(context, nodes, [], filterOffset);
            changePanelText(context, [], currNode);
            context.fill();
          }
        })
        .on("mousedown", (data, index, element) => {
          if (data.data.element.height === 0) {
            dispatch({
              type: "ANALYSIS_SELECT",
              value: { selectedAnalysis: data.data.element.data.target }
            });

            handleForwardStep();
          } else {
            var currNode = data.data.element;
            if (currNode.parent !== null && filters.length === 0) {
              handleFilterChange(
                {
                  value: currNode.data.target,
                  label: config.depthTohierarchy[currNode.depth]
                },
                "update"
              );
            }
          }
        })
        .on("mouseout", function() {
          clearAll(context);

          drawLinks(context, links, [], 0);
          drawNodes(context, nodes, [], 0, null);
        });
    }
  }, [allCircleCords]);

  const clearAll = context => {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, dimensions.width * 2, dimensions.height * 2);
    context.fill();
    context.restore();
  };
  const changePanelText = (context, selection, hoverNode) => {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);

    var sampleText,
      libraryText,
      analysisText = "";
    if (selection.length === 0) {
      sampleText = "";
      libraryText = "";
      analysisText = "";
    } else {
      if (hoverNode.height === 2) {
        //sample
        sampleText = "Sample   | " + hoverNode.data.target;
        libraryText = "Library  | " + hoverNode.data.children.length;
        analysisText = "Analysis | " + hoverNode.data.children.length;
      } else if (hoverNode.height === 1) {
        //library
        sampleText = "Sample   | " + hoverNode.data.source;
        libraryText = "Library  | " + hoverNode.data.target;
        analysisText = "Analysis | " + hoverNode.data.children.length;
      } else {
        //analysis
        sampleText = "Sample   | " + hoverNode.parent.data.source;
        libraryText = "Library  | " + hoverNode.data.source;
        analysisText = "Analysis | " + hoverNode.data.target;
      }
      context.font = "20px Lucida Console, Monaco, monospace";
      context.fillStyle = "grey";
      context.shadowColor = "grey";
      context.shadowBlur = 7;
      context.lineWidth = 5;

      const yIncrementVar = 40;
      const xIncrementVar = 130;
      context.fillText(
        sampleText,
        (2 * dimensions.width) / 3 - xIncrementVar,
        dimensions.height - yIncrementVar
      );
      context.fillText(
        libraryText,
        (2 * dimensions.width) / 3 - xIncrementVar,
        dimensions.height
      );
      context.fillText(
        analysisText,
        (2 * dimensions.width) / 3 - xIncrementVar,
        dimensions.height + yIncrementVar
      );

      context.shadowBlur = 0;
      context.fillStyle = "black";
      context.fillText(
        sampleText,
        (2 * dimensions.width) / 3 - xIncrementVar,
        dimensions.height - yIncrementVar
      );

      if (hoverNode.height === 1) {
        context.fillText(
          libraryText,
          (2 * dimensions.width) / 3 - xIncrementVar,
          dimensions.height
        );
      } else if (hoverNode.height === 0) {
        context.fillText(
          libraryText,
          (2 * dimensions.width) / 3 - xIncrementVar,
          dimensions.height
        );
        context.fillText(
          analysisText,
          (2 * dimensions.width) / 3 - xIncrementVar,
          dimensions.height + yIncrementVar
        );
      }
    }
    context.stroke();
    context.restore();
  };

  function getCordsFromTransform(element, transform) {
    return {
      x: Math.round(
        element.x * transform.a + element.y * transform.c + transform.e / 2
      ),
      y: Math.round(
        element.x * transform.b + element.y * transform.d + transform.f / 2
      ),
      element: element
    };
  }

  const [ref] = useHookWithRefCallback();

  function useHookWithRefCallback() {
    const ref = useRef(null);
    const setRef = useCallback(node => {
      if (node && context === undefined) {
        const graph = d3.select("#canvasGraph");
        const canvas = graph
          .select("canvas")
          .attr("width", dimensions.width)
          .attr("height", dimensions.height);
        /*    .attr(
            "transform",
            "translate(-" + dimensions.width / 4 + "," + margin.top + ")"
          );*/

        const context = initContext(
          canvas,
          dimensions.width,
          dimensions.height
        );
        saveContext(context);

        d3.select("#canvasGraphSelection")
          .attr("width", dimensions.width + "px")
          .attr("height", dimensions.height + "px");
      }
    }, []);

    return [setRef, data];
  }

  return (
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
        <canvas />
      </div>
      <svg
        id="canvasGraphSelection"
        viewBox={
          "0 0 " +
          dimensions.width / window.devicePixelRatio +
          " " +
          dimensions.height / window.devicePixelRatio
        }
        style={{
          width: dimensions.width + "px",
          height: dimensions.height + "px",
          position: "relative"
        }}
      />
    </div>
  );
};
export default CanvasGraph;
