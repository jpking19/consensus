import {
  type Edge,
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

import type { BeliefNode } from "./types";

export type RFState = {
  nodes: BeliefNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange<BeliefNode>;
  onEdgesChange: OnEdgesChange;
  updateNodeLabel: (nodeId: string, label: string) => void;
  addChildNode: (parentNode: InternalNode, position: XYPosition) => void;
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
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  updateNodeLabel: (nodeId: string, label: string) => {
    set({
      nodes: get().nodes.map((node) => {
        console.log(
          "Updating node",
          node.id,
          "compared to id",
          nodeId,
          "to label",
          label
        );
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
  addChildNode: (parentNode: InternalNode, position: XYPosition) => {
    // TODO need to support node without a parent
    const newNode: BeliefNode = {
      id: nanoid(),
      type: "belief",
      data: { label: "New Node" },
      position,
      parentId: parentNode.id,
    };

    // TODO needs to account for the source of the connection
    const newEdge = {
      id: nanoid(),
      source: parentNode.id,
      target: newNode.id,
    };

    set({
      nodes: [...get().nodes, newNode],
      edges: [...get().edges, newEdge],
    });
  },
}));

export default useStore;
