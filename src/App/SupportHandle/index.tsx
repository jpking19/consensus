import { Handle, Position } from "@xyflow/react";

export function SupportHandle({
  id,
  position,
  parentId,
  alignsWithParent,
  nodeLabel,
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
      isConnectable={!parentId}
      isConnectableEnd={false}
      style={{
        background: supportsParent ? "green" : "red",
        top: position === Position.Top && nodeLabel == "" ? "20px" : "",
        // TODO do we want to hide this?
        // visibility: parentId ? "visible" : "hidden",
      }}
    />
  );
}
