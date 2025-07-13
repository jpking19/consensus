import { type Node, type Edge } from "@xyflow/react";

export type NodeData = {
  label: string;
  user: "left" | "right" | "both"; // Indicates which user this belief belongs to
  connectingUser?: "left" | "right" | "both" | null; // Indicates which user is currently connecting from this belief
  parentId?: string;
  supportsParent: boolean; // Indicates if the node supports its parent belief
  alignsWithParent: boolean; // Indicates if the node aligns with its parent belief's acceptance state
  leftAcceptance: boolean; // Indicates if the left user accepts this belief
  rightAcceptance: boolean; // Indicates if the right user accepts this belief
  origin?: [number, number]; // This is used to place the node origin in the
};

// Currently, all data needed by Edges is contained in the NodeData.
export type EdgeData = {};

export type BeliefNode = Node<NodeData, "belief">;
export type BeliefEdge = Edge<EdgeData, "beliefEdge">;
