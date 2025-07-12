import {
  type EdgeChange,
  type NodeChange,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  type XYPosition,
  type InternalNode,
} from "@xyflow/react";
import { create } from "zustand";
import { nanoid } from "nanoid/non-secure";

import type { BeliefNode, BeliefEdge } from "./types";

export type RFState = {
  nodes: BeliefNode[];
  edges: BeliefEdge[];
  onNodesChange: OnNodesChange<BeliefNode>;
  onEdgesChange: OnEdgesChange<BeliefEdge>;
  updateNodeLabel: (nodeId: string, label: string) => void;
  addChildNode: (
    parentNode: InternalNode,
    position: XYPosition,
    parentHandleId: string | null
  ) => void;
};

const useStore = create<RFState>((set, get) => ({
  nodes: [
    {
      id: "root",
      type: "belief",
      data: { label: "React Flow Mind Map" },
      position: { x: 0, y: 0 },
    },
  ],
  edges: [],
  onNodesChange: (changes: NodeChange<BeliefNode>[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange<BeliefEdge>[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  updateNodeLabel: (nodeId: string, label: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // it's important to create a new node here, to inform React Flow about the changes
          return {
            ...node,
            data: { ...node.data, label },
          };
        }

        return node;
      }),
    });
  },
  addChildNode: (
    parentNode: InternalNode,
    position: XYPosition,
    parentHandleId: string | null
  ) => {
    // TODO need to support node without a parent
    let parentAbsolutePosition = {
      x: parentNode.internals.positionAbsolute.x,
      y: parentNode.internals.positionAbsolute.y,
    };
    const newNode: BeliefNode = {
      id: nanoid(),
      type: "belief",
      data: { label: "New Node" },
      position: {
        x: position.x - parentAbsolutePosition.x,
        y: position.y - parentAbsolutePosition.y,
      },
      height: 50, // Default height for the node
      parentId: parentNode.id,
    };

    set({
      nodes: [...get().nodes, newNode],
    });

    // TODO needs to account for the source of the connection
    // Adding new node from the
    if (parentHandleId !== null) {
      const newEdge: BeliefEdge = {
        id: nanoid(),
        type: "beliefEdge",
        source: newNode.id,
        target: parentNode.id,
        targetHandle: parentHandleId,
        animated: true,
      };

      set({
        edges: [...get().edges, newEdge],
      });
    }
  },
}));

export default useStore;
