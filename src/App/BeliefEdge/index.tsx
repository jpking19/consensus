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
    let edgeStyle = {
      zIndex: -2,
    };
    if (childNodeData && parentNodeData) {
      if (!childNodeData.alignsWithParent) {
        return {
          ...edgeStyle,
          strokeDasharray: 5,
          stroke: ColorScheme.borderDefault,
        };
      } else if (childNodeData.alignsWithParent) {
        if (childNodeData.leftAcceptance && childNodeData.rightAcceptance) {
          if (childNodeData.supportsParent) {
            return {
              ...edgeStyle,
              stroke: ColorScheme.consensus,
            };
          } else {
            return {
              ...edgeStyle,
              stroke: ColorScheme.consensusDisagree,
            };
          }
        } else if (
          !childNodeData.leftAcceptance &&
          !childNodeData.rightAcceptance
        ) {
          return {
            ...edgeStyle,
            strokeDasharray: 5,
            stroke: ColorScheme.borderDefault,
          };
        } else if (
          sourcePosition == Position.Left &&
          parentNodeData.leftAcceptance
        ) {
          return {
            ...edgeStyle,
            stroke: ColorScheme.leftUser,
          };
        } else if (
          sourcePosition == Position.Right &&
          parentNodeData.rightAcceptance
        ) {
          return {
            ...edgeStyle,
            stroke: ColorScheme.rightUser,
          };
        } else if (
          sourcePosition == Position.Left &&
          !parentNodeData.leftAcceptance
        ) {
          return {
            ...edgeStyle,
            stroke: ColorScheme.consensusDisagree,
          };
        } else if (
          sourcePosition == Position.Right &&
          !parentNodeData.rightAcceptance
        ) {
          return {
            ...edgeStyle,
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
