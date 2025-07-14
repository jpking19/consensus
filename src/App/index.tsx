import { useCallback, useRef, useState } from "react";
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
  Panel,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import fs from "vite-plugin-fs/browser";

import path from "path";

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
  updateNodeConnectingUser: state.updateNodeConnectingUser,
});

// this places the node origin in the center of a node
const nodeOrigin: NodeOrigin = [0.5, 0];

// TODO proper flow key management
const flowKey = "consensus-flow";
// const conversationsDir = path.join(__dirname, "..", "conversations");
const flowFilePath = "./flows/flow.json";

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
    updateNodeConnectingUser,
  } = useStore(useShallow(selector));
  const { screenToFlowPosition } = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);
  const connectingHandleId = useRef<string | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const onConnectStart: OnConnectStart = useCallback(
    (_, { nodeId, handleId }) => {
      connectingNodeId.current = nodeId;
      connectingHandleId.current = handleId;
      if (nodeId) {
        updateNodeConnectingUser(nodeId, null); // Reset the connecting user
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
          // if (childNode.connectingUser != null) {
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

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      // Save to localStorage for browser persistence
      localStorage.setItem(flowKey, JSON.stringify(flow));
      // Also save to file in conversations directory
      try {
        fs.writeFile(flowFilePath, JSON.stringify(flow, null, 2));
      } catch (err) {
        console.error("Error saving flow to file:", err);
      }
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      let flow = null;
      // Try to load from file first
      try {
        const fileContent = await fs.readFile(flowFilePath);
        flow = JSON.parse(fileContent);
      } catch (err) {
        console.error("Error loading flow from file:", err);
      }
      // Fallback to localStorage if file not found
      if (flow) {
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        // TODO restore viewport
        // setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes]);

  return (
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
    >
      <Background />
      <Panel position="top-right">
        <button className="xy-theme__button" onClick={onSave}>
          save
        </button>
        <button className="xy-theme__button" onClick={onRestore}>
          restore
        </button>
      </Panel>
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}

export default Flow;
