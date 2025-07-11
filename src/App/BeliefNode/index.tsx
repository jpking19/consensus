import React, { useState, useCallback } from "react";
import { Handle } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import useStore from "../store";
import type { BeliefNode } from "../types";

function BeliefNode({ id, data }: NodeProps<BeliefNode>) {
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);

  return (
    <>
      <div className="inputWrapper">
        <div className="belief-node react-flow__node-belief ">
          <input
            id={`label-${id}`}
            className="input nodrag"
            value={data.label}
            onChange={(e) => updateNodeLabel(id, e.target.value)}
          />
        </div>
      </div>

      <Handle type="source" position="top" id="top" />
      <Handle type="target" position="left" id="left" />
      <Handle type="target" position="right" id="right" />
    </>
  );
}

export default BeliefNode;
