import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

import useStore from "../store";
import type { BeliefNode } from "../types";

function BeliefNode({ id, data }: NodeProps<BeliefNode>) {
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);

  return (
    <>
      <div className="react-flow__node-belief">
        <input
          id={`label-${id}`}
          className="react-flow__node-input"
          value={data.label}
          onChange={(e) => updateNodeLabel(id, e.target.value)}
        />
      </div>

      <Handle id={`source-${id}`} type="source" position={Position.Top} />
      <Handle id={`target-${id}-left`} type="target" position={Position.Left} />
      <Handle
        id={`target-${id}-right`}
        type="target"
        position={Position.Right}
      />
    </>
  );
}

export default BeliefNode;
