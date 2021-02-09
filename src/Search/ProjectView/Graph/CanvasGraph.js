import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useLayoutEffect
} from "react";
import * as d3 from "d3";

import { createRoot, hierarchyColouring } from "./appendUtils.js";
import {
  getSelectionPath,
  originalRadiusCanvas,
  setSmallerPanelFont,
  setLargerPanelFont
} from "./utils";
import { config } from "../config.js";

import { useDashboardState } from "../ProjectState/dashboardState";

import { useAppState } from "../../../util/app-state";

import { initContext } from "../../../Dashboard/utils.js";

const spacingOffset = 200;
const getScreenType = width => ({
  isBigScreen: width > 1700,
  isMedScreen: width >= 1330 && width <= 1700,
  isSmallScreen: width < 1330,
  is1DPR: window.devicePixelRatio === 1
});

const CanvasGraph = ({
  isLoading,
  data,
  filters,
  handleFilterChange,
  handleForwardStep
}) => {
  const [
    { filterMouseover, dimensions, selectedAnalysis },
    dispatch
  ] = useDashboardState();
  const [context, saveContext] = useState();
  const [nodes, setNodes] = useState();
  const [links, setLinks] = useState();
  const [currScale, setCurrScale] = useState(1);

  const [allCircleCords, setAllCircleCords] = useState([]);
  const screenType = getScreenType(dimensions.width);

  useEffect(() => {
    if (filterMouseover && context) {
      if (filterMouseover.value === null) {
        //clear
        clearAll(context);
        drawLinks(context, links, [], 0);
        drawNodes(context, nodes, [], 0, null);
      } else {
        const graph = d3.select("#canvasGraphSelection");
        const filterSelection = graph.select(
          "#canvasGraphSelection .voronoi-" + filterMouseover.value
        );

        if (!filterSelection.empty()) {
          filterSelection.dispatch("mouseover");
        }
      }
    }
  }, [filterMouseover]);

  const voronoid = screenType.is1DPR
    ? d3
        .voronoi()
        .x(d => d.x)
        .y(d => d.y)
        .extent([
          [-dimensions.width, -dimensions.height],
          [dimensions.width, dimensions.height]
        ])
    : d3
        .voronoi()
        .x(d => d.x * 0.5 + dimensions.width / 6)
        .y(d => d.y * 0.5 + dimensions.height / 4)
        .extent([
          [-dimensions.width, -dimensions.height],
          [dimensions.width, dimensions.height]
        ]);
  useEffect(() => {
    if (dimensions.width !== 0 && dimensions.height !== 0 && !context) {
      const graph = d3.select("#canvasGraph");
      const canvas = graph
        .select("canvas")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);

      //  setCurrScale(1);

      const context = initContext(canvas, dimensions.width, dimensions.height);
      saveContext(context);

      d3.select("#canvasGraphSelection")
        .attr("width", dimensions.width + "px")
        .attr("height", dimensions.height + "px");
    }
    if (context && dimensions.width !== 0 && dimensions.height !== 0) {
      const canvas = d3.select("#canvasGraph canvas").node();

      let scale = window.devicePixelRatio;
      canvas.style.width = dimensions.width + "px";
      canvas.style.height = dimensions.height + "px";
      canvas.width = dimensions.width * scale;
      canvas.height = dimensions.height * scale;
    }
  }, [dimensions]);

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
      //if (currScale !== 0.9) {
      context.setTransform(
        window.devicePixelRatio,
        0,
        0,
        window.devicePixelRatio,
        0,
        0
      );

      context.translate(dimensions.width / 3, dimensions.height / 2);

      if (screenType.is1DPR) {
        if (screenType.isBigScreen) {
          context.scale(0.15, 0.15);
        } else if (screenType.isMedScreen) {
          //med screen 1dpr
          context.scale(0.1, 0.1);
        } else {
          context.scale(0.1, 0.1);
        }
      } else {
        if (screenType.isMedScreen || screenType.isBigScreen) {
          //med screen 2dpr
          if (data[0].children.length > 100) {
            context.scale(0.12, 0.12);
          } else {
            context.scale(0.1, 0.1);
          }
        } else if (screenType.isSmallScreen) {
          //small screen 2 dpr
          context.scale(0.08, 0.08);
        }
      }

      context.save();
      //}
      setCurrScale(0.9);

      var filterOffset = filters.length > 0 ? spacingOffset : 0;

      drawLinks(context, links, [], filterOffset);

      const allCords = drawNodes(context, nodes, [], filterOffset);

      context.restore();

      context.fill();
      setAllCircleCords([...allCords]);
    }
  }, [data, context, dimensions]);

  const drawLinks = (context, links, selectionText, filterOffset) => {
    context.strokeStyle = "white";
    context.lineWidth = 10;
    context.rotate(1.5708);
    links.forEach(link => {
      context.beginPath();
      if (selectionText.length === 0) {
        context.strokeStyle = "white";
      } else if (selectionText.indexOf(link.target.data.target) !== -1) {
        context.lineWidth = 15;
        context.strokeStyle = "white";
      } else {
        context.strokeStyle = "#bdc3c7";
      }

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
        context.shadowBlur = 15;
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
          context.strokeStyle = "grey";
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

      if (screenType.is1DPR) {
        voronoi.attr(
          "transform",
          "translate(" +
            dimensions.width / 6 +
            "," +
            dimensions.height / 4 +
            ") rotate(-90 " +
            rootNode.x +
            " " +
            rootNode.y +
            ")"
        );
      } else {
        voronoi.attr(
          "transform",
          "rotate(-90 " + rootNode.x + " " + rootNode.y + ")"
        );
      }

      voronoi
        .selectAll("path")
        .data(voronoid(allCircleCords).polygons(), d => {
          if (!d) {
            console.log(d);
          }
          return d ? d.data.element.data.target : null;
        })
        .enter()
        .append("path")
        //  .style("stroke", "#2074A0")
        //.style("stroke-width", 3)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr("d", d => (d ? "M" + d.join("L") + "Z" : null))
        .attr("class", d => {
          return d ? "voronoi-" + d.data.element.data.target : "";
        })
        .on("mouseover", (data, index, element) => {
          var currNode = data.data.element;
          var filterOffset;

          if (currNode.parent !== null) {
            var nodeSelectionText = getSelectionPath(currNode, ",");
            console.log(nodeSelectionText);

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

      screenType.is1DPR
        ? setSmallerPanelFont(context, screenType)
        : setLargerPanelFont(context, screenType);

      context.fillStyle = "grey";
      context.shadowColor = "grey";
      context.shadowBlur = 7;
      context.lineWidth = 5;

      const yIncrementVar = 40;
      const xIncrementVar = 130;

      const rootNode = allCircleCords.filter(
        node => node.element.depth === 0
      )[0];

      const rootRadius = originalRadiusCanvas(rootNode["element"]);

      var xPos = 0,
        yPos = 0;
      if (screenType.is1DPR) {
        if (screenType.isSmallScreen) {
          xPos = (2 * dimensions.width) / 3 / 2 - rootRadius / 16;
          yPos = dimensions.height / 2;
        } else if (screenType.isMedScreen) {
          xPos = (2 * dimensions.width) / 3 / 2;
          yPos = dimensions.height / 2;
        } else {
          xPos = (2 * dimensions.width) / 3 / 2 - rootRadius / 8;
          yPos = dimensions.height / 2;
        }
      } else {
        if (screenType.isSmallScreen) {
          xPos = (2 * dimensions.width) / 3 - rootRadius / 8;
          yPos = dimensions.height;
        } else {
          xPos = (2 * dimensions.width) / 3 - rootRadius / 8 - 10;
          yPos = dimensions.height;
        }
      }

      context.fillText(sampleText, xPos, yPos - yIncrementVar);
      context.fillText(libraryText, xPos, yPos);
      context.fillText(analysisText, xPos, yPos + yIncrementVar);

      context.shadowBlur = 0;
      context.fillStyle = "black";
      context.fillText(sampleText, xPos, yPos - yIncrementVar);

      if (hoverNode.height === 1) {
        context.fillText(libraryText, xPos, yPos);
      } else if (hoverNode.height === 0) {
        context.fillText(libraryText, xPos, yPos);
        context.fillText(analysisText, xPos, yPos + yIncrementVar);
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
        /*  const graph = d3.select("#canvasGraph");
        const canvas = graph
          .select("canvas")
          .attr("width", dimensions.width)
          .attr("height", dimensions.height);


        const context = initContext(
          canvas,
          dimensions.width,
          dimensions.height
        );
        saveContext(context);

        d3.select("#canvasGraphSelection")
          .attr("width", dimensions.width + "px")
          .attr("height", dimensions.height + "px");*/
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
