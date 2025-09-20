import { BaseEdge, Position, getBezierPath, useStore } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import "../../index.css"; // Import the CSS for styling
import type { BeliefEdge } from "../types";
import { useMemo } from "react";
import { ColorScheme } from "../colors";

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
}: EdgeProps<BeliefEdge>) {
  const childNodeData = useStore((state) => state.nodeLookup.get(target)?.data);
  const parentNodeData = useStore(
    (state) => state.nodeLookup.get(source)?.data
  );

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: sourcePosition,
    targetPosition: targetPosition,
  });

  // Use target node's data to get values for determing edge style
  const edgeStyle = useMemo(() => {
    if (childNodeData && parentNodeData) {
      if (!childNodeData.alignsWithParent) {
        return {
          strokeDasharray: 5,
          stroke: ColorScheme.borderDefault,
        };
      } else if (childNodeData.alignsWithParent) {
        if (childNodeData.leftAcceptance && childNodeData.rightAcceptance) {
          if (childNodeData.supportsParent) {
            return {
              stroke: ColorScheme.consensus,
            };
          } else {
            return {
              stroke: ColorScheme.consensusDisagree,
            };
          }
        } else if (
          !childNodeData.leftAcceptance &&
          !childNodeData.rightAcceptance
        ) {
          return {
            strokeDasharray: 5,
            stroke: ColorScheme.borderDefault,
          };
        } else if (
          sourcePosition == Position.Left &&
          parentNodeData.leftAcceptance
        ) {
          return {
            stroke: ColorScheme.leftUser,
          };
        } else if (
          sourcePosition == Position.Right &&
          parentNodeData.rightAcceptance
        ) {
          return {
            stroke: ColorScheme.rightUser,
          };
        } else if (
          sourcePosition == Position.Left &&
          !parentNodeData.leftAcceptance
        ) {
          return {
            stroke: ColorScheme.consensusDisagree,
          };
        } else if (
          sourcePosition == Position.Right &&
          !parentNodeData.rightAcceptance
        ) {
          return {
            stroke: ColorScheme.consensusDisagree,
          };
        }
      }
    }

    return {};
  }, [childNodeData, parentNodeData]);

  return (
    <>
      <BaseEdge
        id={id}
        className={`react-flow__edge selectable`}
        style={edgeStyle}
        path={edgePath}
      />
    </>
  );
}

export default BeliefEdge;
