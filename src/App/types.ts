import { type Node, type Edge } from "@xyflow/react";

export type NodeData = {
  label: string;
  parentId?: string;
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
