import { Handle, Position } from "@xyflow/react";

export function AcceptanceHandle({
  id,
  position,
  userAcceptance,
  oppositeUserAcceptance,
  alignsWithParent,
  nodeLabel,
  handleNodeUserAcceptanceChange,
}) {
  return (
    <Handle
      id={id}
      className={`react-flow__handle_acceptance ${position}-acceptance-handle`}
      type="source"
      position={position}
      onClick={(event) => {
        handleNodeUserAcceptanceChange(event);
      }}
      style={{
        background: userAcceptance
          ? oppositeUserAcceptance
            ? "#2ecc71"
            : position == Position.Left
            ? "#3498db"
            : "#e67e22"
          : "#1e1e1e",
        visibility: alignsWithParent ? "visible" : "hidden",
        left: position === Position.Left && nodeLabel == "" ? "20px" : "",
        right: position === Position.Right && nodeLabel == "" ? "20px" : "",
        zIndex: -1,
      }}
    />
  );
}
