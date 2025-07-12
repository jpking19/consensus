import { BaseEdge, getBezierPath } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import "../../index.css"; // Import the CSS for styling

function BeliefEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, animated } = props;

  const [edgePath] = getBezierPath({
    targetX,
    targetY,
    sourceX,
    sourceY,
  });

  return (
    <>
      <BaseEdge
        className="react-flow__edge animated selectable "
        style={{ animationDirection: "reverse" }}
        path={edgePath}
        // {...props}
      />
    </>
  );
}

export default BeliefEdge;
