import { BaseEdge, getBezierPath } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import "../../index.css"; // Import the CSS for styling

function BeliefEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, animated } = props;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        className="react-flow__edge animated selectable"
        path={edgePath}
        // {...props}
      />
    </>
  );
}

export default BeliefEdge;
