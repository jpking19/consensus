import { type ReactNode } from "react";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export const ButtonEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  style = {},
  markerEnd,
  children,
  onClick,
}: EdgeProps & {
  children: ReactNode;
  onClick?: (event: React.MouseEvent) => void;
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
        onClick={onClick}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            justifyContent: "center",
            opacity: selected ? 1 : 0,
            pointerEvents: selected ? "auto" : "none",
            transition: "opacity 0.2s, background 0.2s, color 0.2s ease-in-out",
          }}
        >
          {children}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
