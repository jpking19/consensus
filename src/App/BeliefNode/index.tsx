import React, { useState, useCallback } from "react";
import { Handle } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export type NodeData = {
  label: string;
};

function BeliefNode({ id, data }: NodeProps<NodeData>) {
  return (
    <div className="belief-node react-flow__node-default">
      <input defaultValue={data.label} />
      <Handle type="source" position="top" id="top" />
      <Handle type="target" position="left" id="left" />
      <Handle type="target" position="right" id="right" />
    </div>
  );
}

export default BeliefNode;
