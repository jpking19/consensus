import { BaseEdge, getBezierPath, useStore } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import "../../index.css"; // Import the CSS for styling
import type { BeliefEdge } from "../types";
// import { DataEdge } from "@/components/data-edge";
import { useMemo } from "react";

function BeliefEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  animated,
}: EdgeProps<BeliefEdge>) {
  const nodeData = useStore((state) => state.nodeLookup.get(target)?.data);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: sourcePosition,
    targetPosition: targetPosition,
  });

  // Use target node's data to get values for determing edge style
  const consensus_edge_class = useMemo(() => {
    if (nodeData) {
      if (!nodeData.alignsWithParent) {
        // TODO aligns not getting updated properly
        return "consensus_unaligned";
      } else if (nodeData.alignsWithParent) {
        if (nodeData.leftAcceptance && nodeData.rightAcceptance) {
          return "consensus";
        } else if (nodeData.leftAcceptance || nodeData.rightAcceptance) {
          return "consensus_possible";
        } else {
          return "consensus_none";
        }
      }
    }

    return "";
  }, [nodeData]);

  return (
    <>
      <BaseEdge
        id={id}
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
