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
  addChildNode: state.addChildNode,
});

// this places the node origin in the center of a node
const nodeOrigin: NodeOrigin = [0.5, 0];

function Flow() {
  const store = useStoreApi();
  const { nodes, edges, onNodesChange, onEdgesChange, addChildNode } = useStore(
    useShallow(selector)
  );
  const { screenToFlowPosition } = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback((event) => {
    const { nodeLookup } = store.getState();
    const targetIsPane = (event.target as Element).classList.contains(
      "react-flow__pane"
    );

    if (targetIsPane && connectingNodeId.current) {
      const parentNode = nodeLookup.get(connectingNodeId.current);
      const { clientX, clientY } =
        "changedTouches" in event ? event.changedTouches[0] : event;
      const childNodePosition = screenToFlowPosition({
        x: clientX,
        y: clientY,
      });

      if (parentNode && childNodePosition) {
        addChildNode(parentNode, childNodePosition);
      }
    }
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
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
