import { type Node, type Edge } from "@xyflow/react";

export type NodeData = {
  label: string;
  user: "left" | "right" | "both"; // Indicates which user this belief belongs to
  parentId?: string;
  supportsParent: boolean; // Indicates if the node supports its parent belief
  alignsWithParent: boolean; // Indicates if the node aligns with its parent belief's acceptance state
  leftAcceptance: boolean; // Indicates if the left user accepts this belief
  rightAcceptance: boolean; // Indicates if the right user accepts this belief
  origin?: [number, number]; // This is used to place the node origin in the
};

export type EdgeData = {
  // source: string; // Source is the Parent belief node
  // target: string; // Target is the Child belief node
  // type: "beliefEdge";
  // origin?: [number, number];
  // TODO do we need any of these?
  // animated: boolean; // Indicates if the edge is animated
  supportsParent: boolean; // Indicates if the edge supports the parent belief
  alignsWithParent: boolean; // Indicates if the edge aligns with the parent belief's acceptance state
  leftAcceptance: boolean; // Indicates if the left user accepts this belief
  rightAcceptance: boolean; // Indicates if the right user accepts this belief
};

export type BeliefNode = Node<NodeData, "belief">;
export type BeliefEdge = Edge<EdgeData, "beliefEdge">;
