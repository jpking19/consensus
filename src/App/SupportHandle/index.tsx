import { Handle, Position } from "@xyflow/react";

export function SupportHandle({
  id,
  position,
  parentId,
  supportsParent,
  handleNodeParentSupportChange,
}) {
  return (
    <Handle
      id={id}
      className={`react-flow__handle_support ${position}-support-handle`}
      type="target"
      position={position}
      onClick={(event) => {
        handleNodeParentSupportChange(event);
      }}
      style={{
        background: supportsParent ? "green" : "red",
        visibility: parentId ? "visible" : "hidden",
      }}
    />
  );
}
