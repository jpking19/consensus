import { BaseEdge, getBezierPath } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import "../../index.css"; // Import the CSS for styling
import type { BeliefEdge } from "../types";

function BeliefEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  animated,
  data,
}: EdgeProps<BeliefEdge>) {
  // const { id, sourceX, sourceY, targetX, targetY, animated, data } = props;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: sourcePosition,
    targetPosition: targetPosition,
  });

  let consensus_edge_class = "";
  if (!data?.alignsWithParent) {
    // TODO aligns not getting updated properly
    consensus_edge_class = "consensus_unaligned";
  } else if (data?.alignsWithParent) {
    if (data?.leftAcceptance && data?.rightAcceptance) {
      consensus_edge_class = "consensus";
    } else if (data?.leftAcceptance || data?.rightAcceptance) {
      consensus_edge_class = "consensus_possible";
    } else {
      consensus_edge_class = "consensus_none";
    }
  }

  console.log("BeliefEdge data:", data);
  console.log("BeliefEdge consensus_edge_class:", consensus_edge_class);

  return (
    <>
      <BaseEdge
        className={`react-flow__edge selectable ${consensus_edge_class}`}
        style={{
          // animation: "dashdraw 1s linear infinite",
          animationDirection: "reverse",
        }}
        path={edgePath}
      />
    </>
  );
}

export default BeliefEdge;
