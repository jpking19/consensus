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

class TreeNode {
  public beliefNode: BeliefNode | null = null;
  public parent: TreeNode | null;

  constructor(beliefNode: BeliefNode, parent: TreeNode | null) {
    this.beliefNode = beliefNode;
    this.parent = parent;
  }
}

export type RFState = {
  nodes: BeliefNode[];
  // nodeTrees: TreeNode[];
  edges: BeliefEdge[];
  onNodesChange: OnNodesChange<BeliefNode>;
  onEdgesChange: OnEdgesChange<BeliefEdge>;
  updateNodeLabel: (
    nodeId: string,
    label: string,
    resetLeftChildren: boolean,
    resetRightChildren: boolean
  ) => void;
  updateNodeUserAcceptance: (
    nodeId: string,
    side: "left" | "right",
    userAcceptance: boolean
  ) => void;
  updateNodeParentSupport: (nodeId: string, supportsParent: boolean) => void;
  updateNodeChildPosition: (nodeId: string, currentWidth: number) => void;
  addNode: (position: XYPosition) => void;
  addChildNode: (
    parentNode: InternalNode,
    position: XYPosition,
    parentHandleId: string | null
  ) => void;
  addParentNode: (
    childNode: InternalNode,
    position: XYPosition,
    user: string
  ) => void;
};

const useStore = create<RFState>((set, get) => ({
  nodes: [
    {
      id: "root",
      type: "belief",
      data: {
        label: "",
        user: "both", // Indicates this belief is shared by both users
        supportsParent: true,
        alignsWithParent: true,
        leftAcceptance: false,
        rightAcceptance: false,
      },
      position: { x: 0, y: 0 },
    },
  ],
  // nodeTrees: [new TreeNode(, null)],
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
  updateNodeLabel: (
    nodeId: string,
    label: string,
    resetLeftChildren: boolean,
    resetRightChildren: boolean
  ) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          if (resetLeftChildren || resetRightChildren) {
            // If the label has changed, reset acceptance states
            return {
              ...node,
              data: {
                ...node.data,
                label,
                leftAcceptance: false,
                rightAcceptance: false,
              },
            };
          }

          // it's important to create a new node here, to inform React Flow about the changes
          return {
            ...node,
            data: { ...node.data, label },
          };
        }

        // For each child of this parent, need to possibly reset their supportsParent and alignsWithParent states
        if (
          node.parentId === nodeId &&
          ((node.data.user === "left" && resetLeftChildren) ||
            (node.data.user === "right" && resetRightChildren))
        ) {
          return {
            ...node,
            data: {
              ...node.data,
              alignsWithParent: !node.data.alignsWithParent,
            },
          };
        }

        return node;
      }),
    });
  },
  updateNodeUserAcceptance: (
    nodeId: string,
    side: "left" | "right",
    userAcceptance: boolean
  ) => {
    set({
      nodes: get().nodes.map((node) => {
        console.log("updateNodeUserAcceptance", nodeId, side);
        if (node.id === nodeId) {
          // it's important to create a new node here, to inform React Flow about the changes
          return {
            ...node,
            data: {
              ...node.data,
              [`${side}Acceptance`]: userAcceptance,
            },
          };
        }

        if (node.parentId === nodeId && node.data.user === side) {
          // If the iterated node is a child of the node being updated, determine if it aligns with the parent's acceptance state
          return {
            ...node,
            data: {
              ...node.data,
              alignsWithParent: userAcceptance == node.data.supportsParent,
            },
          };
        }

        return node;
      }),
    });
  },
  updateNodeParentSupport: (nodeId: string, supportsParent: boolean) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // it's important to create a new node here, to inform React Flow about the changes
          return {
            ...node,
            data: {
              ...node.data,
              supportsParent,
              // If the node supports its parent, it aligns with the parent's acceptance state
              alignsWithParent: !node.data.alignsWithParent,
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
      data: {
        label: "",
        user: "both", // Indicates this belief is shared by both users
        supportsParent: true, // Initially has no parent
        alignsWithParent: true, // Initially has no parent
        leftAcceptance: false,
        rightAcceptance: false,
      },
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
    const user = parentHandleId?.split("-")[2];
    const newNode: BeliefNode = {
      id: nanoid(),
      type: "belief",
      data: {
        label: "",
        // TODO need to define USER ID globally
        user: user === "left" || user === "right" ? user : "both", // Indicates which user this belief belongs to
        supportsParent: Boolean(parentNode.data[`${user}Acceptance`]), // Depends on the User's acceptance state of the parent belief
        alignsWithParent: true, // Initially aligns with parent belief's acceptance state
        leftAcceptance: false,
        rightAcceptance: false,
      },
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
    if (parentHandleId !== null) {
      const newEdge: BeliefEdge = {
        id: nanoid(),
        type: "beliefEdge",
        target: newNode.id,
        source: parentNode.id,
        sourceHandle: parentHandleId,
        animated: true, // TODO do we need this?
      };

      set({
        edges: [...get().edges, newEdge],
      });
    }
  },
  addParentNode: (
    childNode: InternalNode,
    position: XYPosition,
    user: string
  ) => {
    // Create new parent node based on the child node's position
    const newNode: BeliefNode = {
      id: nanoid(),
      type: "belief",
      data: {
        label: "",
        user: user === "left" || user === "right" ? user : "both", // Indicates which user this belief belongs to
        supportsParent: true, // Initially has no parent
        alignsWithParent: true, // Initially has no parent
        // TODO not sure I want to force acceptance here. But I suppose yes, since we are coming from supporting belief
        leftAcceptance: user === "left" ? true : false,
        rightAcceptance: user === "right" ? true : false,
      },
      position: {
        x: position.x,
        y: position.y,
      },
      origin: user === "left" ? [0, 0.5] : [1, 0.5], // This is used to place the node origin in the center of a node
    };

    // TODO can avoid sort here by adding at front of array
    set({
      nodes: [...get().nodes, newNode],
    });

    // Update the child node to have this new node as its parent,
    // and update its position to be relative to the new parent node
    // TODO need to find correct position for child node, maybe based on parent height?
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === childNode.id) {
          return {
            ...node,
            parentId: newNode.id,
            position: {
              x: node.position.x - newNode.position.x + 10, // TODO something is off with these positions
              y: node.position.y - newNode.position.y + 21, // TODO something is off with these positions
            },
          };
        }
        return node;
      }),
    });

    // TODO define this outside, we're going to use it in multiple places
    // Recursively find all child nodes, and add them to the sorted nodes
    const addChildren = (parentId: string) => {
      get().nodes.forEach((child) => {
        if (child.parentId === parentId) {
          sortedNodes.push(child);
          addChildren(child.id);
        }
      });
    };

    // Sort nodes to ensure the new parent node is added after the child node
    // This is important for React Flow to render the edges correctly
    let sortedNodes: BeliefNode[] = [];
    get().nodes.forEach((node) => {
      if (node.parentId == null) {
        sortedNodes.push(node);
        addChildren(node.id);
      }
    });

    set({
      nodes: [...sortedNodes],
    });

    // Create edge from the new parent node to the child node
    const parentHandleId = `source-${newNode.id}-${user}`; // This is the handle ID for the parent node to connect to the child node
    const newEdge: BeliefEdge = {
      id: nanoid(),
      type: "beliefEdge",
      target: childNode.id,
      source: newNode.id,
      sourceHandle: parentHandleId,
      animated: true, // TODO do we need this?
    };

    set({
      edges: [...get().edges, newEdge],
    });
  },
}));

export default useStore;
