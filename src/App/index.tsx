import { useCallback, useEffect, useRef, useState } from "react";
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
import type { BeliefNode as BeliefNodeType } from "./types";
import SplashScreen from "./SplashScreen";
import TopBar from "./TopBar";

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

  // Splash page state
  const [showSplash, setShowSplash] = useState(() => {
    return !localStorage.getItem("consensus-splash-dismissed");
  });

  const { screenToFlowPosition } = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);
  const connectingHandleId = useRef<string | null>(null);
  const leftPressed = useKeyPress(["ArrowLeft", "a"]);
  const rightPressed = useKeyPress(["ArrowRight", "d"]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

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

          if (!childNode) {
            console.error("onConnectEnd: Child node not found");
            return;
          }

          const user = (childNode.data as BeliefNodeType["data"])
            .connectingUser;
          if (connectingHandleId.current.includes("root")) {
            console.error("Cannot connect from root support handle");
            // TODO probably show some stronger visual feedback here
            return;
          }

          if (childNode?.parentId) {
            console.error(
              "Cannot add parent to node that already has a parent"
            );
            // TODO probably show some stronger visual feedback here
            return;
          }

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

        if (connectingNodeId.current === parentNodeId) {
          console.error("Cannot connect node to itself");
          // TODO probably show some stronger visual feedback here
          return;
        }

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
      if (event.ctrlKey || leftPressed || rightPressed) {
        const { clientX, clientY } = event;
        const targetIsPane = (event.target as Element).classList.contains(
          "react-flow__pane"
        );
        if (targetIsPane) {
          const flowPosition = screenToFlowPosition({ x: clientX, y: clientY });
          if (leftPressed) {
            addNode(flowPosition, "left");
          } else if (rightPressed) {
            addNode(flowPosition, "right");
          } else {
            addNode(flowPosition, "both");
          }
        }
      }
    },
    [screenToFlowPosition, leftPressed, rightPressed]
  );

  const deletePressed = useKeyPress(["Delete", "Backspace"]);
  useEffect(() => {
    onDelete();
  }, [deletePressed]);

  const dismissSplash = () => {
    localStorage.setItem("consensus-splash-dismissed", "true");
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onDismiss={dismissSplash} />;
  }

  return (
    <>
      <TopBar
        onShowSplash={() => setShowSplash(true)}
        rfInstance={rfInstance}
        setNodes={setNodes}
        setEdges={setEdges}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange as any}
        onEdgesChange={onEdgesChange as any}
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
