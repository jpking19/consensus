import { type Node, type Edge } from "@xyflow/react";

export type NodeData = {
  label: string;
  parentId?: string;
  supportsParent?: boolean; // Indicates if the node supports its parent belief
  leftAcceptance?: boolean; // Indicates if the left user accepts this belief
  rightAcceptance?: boolean; // Indicates if the right user accepts this belief
  origin?: [number, number]; // This is used to place the node origin in the
};

export type EdgeData = {
  id: string;
  source: string;
  target: string;
  type: "beliefEdge";
  origin?: [number, number];
};

export type BeliefNode = Node<NodeData, "belief">;
export type BeliefEdge = Edge<EdgeData, "beliefEdge">;
