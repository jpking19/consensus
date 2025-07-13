import { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  ConnectionLineType,
  type NodeOrigin,
  type OnConnectEnd,
  type OnConnectStart,
  useReactFlow,
  useStoreApi,
  Controls,
  Panel,
  type InternalNode,
} from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

// we have to import the React Flow styles for it to work
import "@xyflow/react/dist/style.css";

import useStore, { type RFState } from "./store";
import BeliefNode from "./BeliefNode";
import BeliefEdge from "./BeliefEdge";

const nodeTypes = {
  belief: BeliefNode,
};

const edgeTypes = {
  beliefEdge: BeliefEdge,
};

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  addNode: state.addNode,
  addChildNode: state.addChildNode,
  addParentNode: state.addParentNode,
});

// this places the node origin in the center of a node
const nodeOrigin: NodeOrigin = [0.5, 0];

function Flow() {
  const store = useStoreApi();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addNode,
    addChildNode,
    addParentNode,
  } = useStore(useShallow(selector));
  const { screenToFlowPosition } = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);
  const connectingHandleId = useRef<string | null>(null);
  const connectingUser = useRef<"left" | "right" | "both" | null>(null);

  const onConnectStart: OnConnectStart = useCallback(
    (_, { nodeId, handleId }) => {
      connectingNodeId.current = nodeId;
      connectingHandleId.current = handleId;
      connectingUser.current = null; // Reset the connecting user
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
          if (connectingUser.current != null) {
            const childNode = nodeLookup.get(connectingNodeId.current);
            const { clientX, clientY } =
              "changedTouches" in event ? event.changedTouches[0] : event;

            // Convert the screen position to flow position relative to the child node
            const parentNodePosition = screenToFlowPosition({
              x: clientX,
              y: clientY,
            });

            console.log("Adding parent node at position", parentNodePosition);
            if (childNode && parentNodePosition) {
              addParentNode(
                childNode,
                parentNodePosition,
                connectingUser.current
              );
            }
          }
        }
      }
    },
    [screenToFlowPosition]
  );

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      connectingUser.current = event.key === "ArrowLeft" ? "left" : "right";
      // TODO can add a visual indicator for the user
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

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      nodeOrigin={nodeOrigin}
      colorMode="dark"
      fitView
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}

export default Flow;
