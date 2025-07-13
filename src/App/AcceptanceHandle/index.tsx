import { Handle, Position } from "@xyflow/react";

export function AcceptanceHandle({
  id,
  position,
  userAcceptance,
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
      }}
    />
  );
}
