import { Handle, Position } from "@xyflow/react";
import { ColorScheme } from "../colors";
import React, { useState } from "react";

interface SupportHandleProps {
  id: string;
  position: Position;
  parentId: string | undefined;
  user: string;
  alignsWithParent: boolean;
  leftAcceptance: boolean;
  rightAcceptance: boolean;
  nodeLabel: string;
  supportsParent: boolean;
  handleNodeParentSupportChange: (event: React.MouseEvent) => void;
}

export function SupportHandle({
  id,
  position,
  parentId,
  user,
  alignsWithParent,
  leftAcceptance,
  rightAcceptance,
  nodeLabel,
  supportsParent,
  handleNodeParentSupportChange,
}: SupportHandleProps) {
  const [hovered, setHovered] = useState(false);

  let backgroundColor = ColorScheme.consensusNone;
  let borderColor = ColorScheme.unaligned;

  if (hovered) {
    backgroundColor = "#fff";
  } else if (leftAcceptance && rightAcceptance) {
    if (supportsParent) {
      backgroundColor = ColorScheme.consensus;
      borderColor = ColorScheme.consensus;
    } else if (!supportsParent) {
      backgroundColor = ColorScheme.consensusDisagree;
      borderColor = ColorScheme.consensusDisagree;
    }
  } else if (parentId) {
    if (supportsParent && user != "both") {
      backgroundColor =
        user === "left" ? ColorScheme.leftUser : ColorScheme.rightUser;
      borderColor =
        user === "left" ? ColorScheme.leftUser : ColorScheme.rightUser;
    } else {
      backgroundColor = ColorScheme.consensusDisagree;
      borderColor = ColorScheme.consensusDisagree;
    }
  }

  return (
    <Handle
      id={id}
      className={`react-flow__handle_support ${position}-support-handle`}
      type="target"
      position={position}
      onClick={(event) => {
        handleNodeParentSupportChange(event);
      }}
      isConnectableEnd={false}
      style={{
        background: backgroundColor,
        borderColor: borderColor,
        top: position === Position.Top && nodeLabel == "" ? "20px" : "",
        opacity: alignsWithParent ? 1 : 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    />
  );
}
