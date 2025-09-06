import { useCallback, useEffect, useRef, useState } from "react";
import Dagre from "@dagrejs/dagre";
import {
  ReactFlow,
  Background,
  MiniMap,
  type NodeOrigin,
  type OnConnectEnd,
  type OnConnectStart,
  useReactFlow,
  useStoreApi,
  Controls,
  type ReactFlowInstance,
  useKeyPress,
} from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { DevTools } from "../components/devtools";

import useStore, { type RFState } from "./store";
import BeliefNode from "./BeliefNode";
import BeliefEdge from "./BeliefEdge";
import SupportConnection from "./SupportConnection";

const nodeTypes = {
  belief: BeliefNode,
};

const edgeTypes = {
  beliefEdge: BeliefEdge,
};

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  addNode: state.addNode,
  addChildNode: state.addChildNode,
  addParentNode: state.addParentNode,
  addEdge: state.addEdge,
  onDelete: state.onDelete,
  updateNodeConnectingUser: state.updateNodeConnectingUser,
});

import type { Node, Edge } from "@xyflow/react";

type LayoutOptions = {
  direction: "TB" | "BT" | "LR" | "RL";
};

const getLayoutedElements = (
  nodes: BeliefNode[],
  edges: BeliefEdge[],
  options: LayoutOptions
) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });

  let dagreIdMap = new Map<string, string>();
  // Iterate through nodes (parents always come first) and convert list into a binary tree

  const buildTree = (nodes: BeliefNode[]): BeliefNode[] => {
    const nodeMap = new Map<string, BeliefNode>();
    nodes.forEach((node) => {
      nodeMap.set(node.id, {
        ...node,
        children: [],
      });
    });

    const roots: BeliefNode[] = [];
    nodeMap.forEach((node) => {
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const roots = buildTree(nodes);
  console.log("Dagre roots", roots);

  // Loop through the tree and assign dagre IDs
  // const assignDagreIds = (node: BeliefNode, level: number) => {
  //   let side =
  //     level === 0 ? "root" : node.data.user === "left" ? "left" : "right";
  //   dagreIdMap.set(`dagre-${level}-${side}-${node.id}`, node.id);
  //   node.id = `dagre-${level}-${side}-${node.id}`;
  //   node.children.forEach((child) => assignDagreIds(child, level + 1));
  // };
  // roots.forEach((root) => assignDagreIds(root, 0));

  // console.log("Dagre ID map", dagreIdMap);
  // console.log("Dagre nodes", roots);

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      id: node.id,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    })
  );

  Dagre.layout(g);

  // console.log("Dagre graph", g);

  return {
    nodes: nodes.map((node) => {
      // offset by parent position if exists
      const nodeWithPosition = g.node(node.id);
      if (node.parentId) {
        const parentNodeWithPosition = g.node(node.parentId);
        node.position = {
          x:
            nodeWithPosition.x -
            (parentNodeWithPosition.x - parentNodeWithPosition.width / 2), // -
          //(node.measured?.width ?? 0) / 2,
          y:
            nodeWithPosition.y -
            (parentNodeWithPosition.y - parentNodeWithPosition.height / 2), // -
          //(node.measured?.height ?? 0) / 2,
        };
      } else {
        node.position = {
          x: nodeWithPosition.x - nodeWithPosition.width / 2,
          y: nodeWithPosition.y - nodeWithPosition.height / 2,
        };
      }

      // const position = g.node(node.id);
      // console.log("Dagre position for node", node.id, position.x, position.y);
      // // We are shifting the dagre node position (anchor=center center) to the top left
      // // so it matches the React Flow node anchor point (top left).
      // const x = position.x - (node.measured?.width ?? 0) / 2;
      // const y = position.y - (node.measured?.height ?? 0) / 2;

      // TODO reset ID i suppose
      // return { ...node, position: { x, y } };
      return node;
    }),
    edges,
  };
};

// this places the node origin in the center of a node
const nodeOrigin: NodeOrigin = [0.5, 0];

function Flow() {
  const store = useStoreApi();
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    addNode,
    addChildNode,
    addParentNode,
    addEdge,
    onDelete,
    updateNodeConnectingUser,
  } = useStore(useShallow(selector));
  const { screenToFlowPosition } = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);
  const connectingHandleId = useRef<string | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [flowName, setFlowName] = useState("");
  const [savedFlows, setSavedFlows] = useState<string[]>([]);
  const [selectedFlow, setSelectedFlow] = useState("");

  // Load saved flow names from localStorage on mount
  useEffect(() => {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("consensus-flow-")
    );
    setSavedFlows(keys.map((key) => key.replace("consensus-flow-", "")));
  }, []);

  const onConnectStart: OnConnectStart = useCallback(
    (_, { nodeId, handleId }) => {
      connectingNodeId.current = nodeId;
      connectingHandleId.current = handleId;
      if (nodeId && handleId) {
        if (handleId.includes("source")) {
          // Acceptance Handle
          // Set connecting user so we can track if connection is still valid
          updateNodeConnectingUser(
            nodeId,
            handleId.includes("left") ? "left" : "right"
          );
        } else {
          // Support Handle
          // Reset the connecting user, to require left/right input
          updateNodeConnectingUser(nodeId, null);
        }
      }
    },
    []
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      const { nodeLookup } = store.getState();
      const targetIsPane = (event.target as Element).classList.contains(
        "react-flow__pane"
      );
      const targetIsAcceptanceHandle = (
        event.target as Element
      ).classList.contains("source");

      if (targetIsPane && connectingNodeId.current) {
        if (
          connectingHandleId.current ==
            `source-${connectingNodeId.current}-left` ||
          connectingHandleId.current ==
            `source-${connectingNodeId.current}-right`
        ) {
          const parentNode = nodeLookup.get(connectingNodeId.current);
          const { clientX, clientY } =
            "changedTouches" in event ? event.changedTouches[0] : event;

          // Convert the screen position to flow position relative to the parent node
          const childNodePosition = screenToFlowPosition({
            x: clientX,
            y: clientY,
          });

          console.log("Adding child node at position", childNodePosition);
          if (parentNode && childNodePosition) {
            addChildNode(
              parentNode,
              childNodePosition,
              connectingHandleId.current
            );
          }
        } else if (
          connectingHandleId.current == `target-${connectingNodeId.current}`
        ) {
          // Check if user has pressed left or right arrow key
          const childNode = nodeLookup.get(connectingNodeId.current);
          const user = (childNode.data as BeliefNode["data"]).connectingUser;
          if (!user) {
            console.error("No user specified for adding parent node");
            // TODO probably show some stronger visual feedback here
            return;
          }

          const { clientX, clientY } =
            "changedTouches" in event ? event.changedTouches[0] : event;

          // Convert the screen position to flow position relative to the child node
          const parentNodePosition = screenToFlowPosition({
            x: clientX,
            y: clientY,
          });

          console.log("Adding parent node at position", parentNodePosition);
          if (childNode && parentNodePosition) {
            addParentNode(childNode, parentNodePosition);
          }
        }
      } else if (targetIsAcceptanceHandle && connectingNodeId.current) {
        // Handle connection to acceptance handle
        const childNode = nodeLookup.get(connectingNodeId.current);
        const parentNodeId = (event.target as Element).getAttribute(
          "data-nodeId"
        );
        const parentNode = nodeLookup.get(parentNodeId!);
        const targetHandleId = (event.target as Element).getAttribute(
          "data-handleId"
        );

        if (childNode && parentNode && targetHandleId) {
          addEdge(childNode, parentNode, targetHandleId);
        }
      }
    },
    [screenToFlowPosition]
  );

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (
      (event.key === "ArrowLeft" || event.key === "a") &&
      connectingNodeId.current
    ) {
      updateNodeConnectingUser(connectingNodeId.current, "left");
    } else if (
      (event.key === "ArrowRight" || event.key === "d") &&
      connectingNodeId.current
    ) {
      updateNodeConnectingUser(connectingNodeId.current, "right");
    } else if (event.key === "Escape" && connectingNodeId.current) {
      updateNodeConnectingUser(connectingNodeId.current, null);
      connectingNodeId.current = null;
      connectingHandleId.current = null;
    }
  }, []);

  const onClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.ctrlKey) {
        const { clientX, clientY } = event;
        const targetIsPane = (event.target as Element).classList.contains(
          "react-flow__pane"
        );
        if (targetIsPane) {
          const flowPosition = screenToFlowPosition({ x: clientX, y: clientY });
          addNode(flowPosition);
        }
      }
    },
    [screenToFlowPosition]
  );

  // Save flow with user-provided name
  const onSave = useCallback(() => {
    if (rfInstance && flowName) {
      const flow = rfInstance.toObject();
      localStorage.setItem(`consensus-flow-${flowName}`, JSON.stringify(flow));
      setSavedFlows((prev) =>
        prev.includes(flowName) ? prev : [...prev, flowName]
      );
      alert(`Flow saved as '${flowName}'`);
    } else {
      alert("Please enter a name for your flow before saving.");
    }
  }, [rfInstance, flowName]);

  // Restore flow from selected name
  const onRestore = useCallback(() => {
    if (selectedFlow) {
      const flow = JSON.parse(
        localStorage.getItem(`consensus-flow-${selectedFlow}`) || "null"
      );
      if (flow) {
        // Arrange the nodes in a top-bottom layout on restore
        let options: LayoutOptions = { direction: "TB" };
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(flow.nodes || [], flow.edges || [], options);

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        // TODO restore viewport if needed
      } else {
        alert("No flow found for selected name.");
      }
    } else {
      alert("Please select a flow to restore.");
    }
  }, [selectedFlow, setNodes, setEdges]);

  const deletePressed = useKeyPress(["Delete", "Backspace"]);
  useEffect(() => {
    onDelete();
  }, [deletePressed]);

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          placeholder="Enter flow name"
          style={{ padding: 4 }}
        />
        <button onClick={onSave} style={{ padding: 4 }}>
          Save Flow
        </button>
        <select
          value={selectedFlow}
          onChange={(e) => setSelectedFlow(e.target.value)}
          style={{ padding: 4 }}
        >
          <option value="">Select saved flow</option>
          {savedFlows.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button onClick={onRestore} style={{ padding: 4 }}>
          Restore Flow
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionLineComponent={SupportConnection}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={setRfInstance}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeOrigin={nodeOrigin}
        colorMode="dark"
        disableKeyboardA11y
        fitView
        deleteKeyCode={[]}
      >
        <Background />
        <Controls />
        <MiniMap />
        <DevTools position="top-left" />
      </ReactFlow>
    </>
  );
}

export default Flow;
