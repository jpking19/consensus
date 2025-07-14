import { Handle, Position } from "@xyflow/react";

export function AcceptanceHandle({
  id,
  position,
  userAcceptance,
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
        background: userAcceptance ? "green" : "red",
        visibility: alignsWithParent ? "visible" : "hidden",
        left: position === Position.Left && nodeLabel == "" ? "20px" : "",
        right: position === Position.Right && nodeLabel == "" ? "20px" : "",
        zIndex: -1,
      }}
    />
  );
}
