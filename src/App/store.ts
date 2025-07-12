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
  updateNodeUserAcceptance: (nodeId: string, side: "left" | "right") => void;
  updateNodeChildPosition: (nodeId: string, currentWidth: number) => void;
  addNode: (position: XYPosition) => void;
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
      data: { label: "" },
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
  updateNodeUserAcceptance: (nodeId: string, side: "left" | "right") => {
    set({
      nodes: get().nodes.map((node) => {
        console.log("updateNodeUserAcceptance", nodeId, side);
        if (node.id === nodeId) {
          // it's important to create a new node here, to inform React Flow about the changes
          return {
            ...node,
            data: {
              ...node.data,
              [`${side}Acceptance`]: !node.data[`${side}Acceptance`],
            },
          };
        }
        return node;
      }),
    });
  },
  updateNodeChildPosition: (nodeId: string, changeInWidth: number) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.parentId === nodeId) {
          // it's important to create a new node here, to inform React Flow about the changes
          return {
            ...node,
            position: {
              x: node.position.x - changeInWidth / 2, // offset the child node position
              y: node.position.y,
            },
          };
        }
        return node;
      }),
    });
  },
  addNode: (position: XYPosition) => {
    const newNode: BeliefNode = {
      id: nanoid(),
      type: "belief",
      data: { label: "" },
      position,
    };

    set({
      nodes: [...get().nodes, newNode],
    });
  },
  addChildNode: (
    parentNode: InternalNode,
    position: XYPosition,
    parentHandleId: string | null
  ) => {
    let parentAbsolutePosition = {
      x: parentNode.internals.positionAbsolute.x,
      y: parentNode.internals.positionAbsolute.y,
    };
    const newNode: BeliefNode = {
      id: nanoid(),
      type: "belief",
      data: { label: "" },
      position: {
        x: position.x - parentAbsolutePosition.x,
        y: position.y - parentAbsolutePosition.y,
      },
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
        target: newNode.id,
        source: parentNode.id,
        sourceHandle: parentHandleId,
        animated: true,
      };

      set({
        edges: [...get().edges, newEdge],
      });
    }
  },
}));

export default useStore;
