import {
  type Node,
  type Edge,
  type BuiltInNode,
  type BuiltInEdge,
} from "@xyflow/react";

export type NodeData = {
  label: string;
  placeholderLabel: string;
  user: "left" | "right" | "both"; // Indicates which user this belief belongs to
  connectingUser?: "left" | "right" | "both" | null; // Indicates which user is currently connecting from this belief
  parentId?: string;
  supportsParent: boolean; // Indicates if the node supports its parent belief
  alignsWithParent: boolean; // Indicates if the node aligns with its parent belief's acceptance state
  leftAcceptance: boolean; // Indicates if the left user accepts this belief
  rightAcceptance: boolean; // Indicates if the right user accepts this belief
  origin?: [number, number]; // This is used to place the node origin in the
  collapsed: boolean; // Indicates if the node's children are collapsed
  collapsedChildren?: BeliefNode[]; // This is used to store collapsed child nodes
  stateIndex: number; // This is used to track the current state index in the states array
  states: BeliefNode[]; // This is used to store different states of the belief for versioning
};

// Currently, all data needed by Edges is contained in the NodeData.
export type EdgeData = {};

export type BeliefNode = Node<NodeData, "belief">;
export type BeliefEdge = Edge<EdgeData, "beliefEdge">;

export type CustomNodeType = BuiltInNode | BeliefNode;
export type CustomEdgeType = BuiltInEdge | BeliefEdge;
