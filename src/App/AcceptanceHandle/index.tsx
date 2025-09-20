import { Handle, Position } from "@xyflow/react";
import { ColorScheme } from "../colors";
import React, { useState } from "react";

interface AcceptanceHandleProps {
  id: string;
  position: Position;
  userAcceptance: boolean;
  oppositeUserAcceptance: boolean;
  alignsWithParent: boolean;
  supportsParent: boolean;
  nodeLabel: string;
  handleNodeUserAcceptanceChange: (event: React.MouseEvent) => void;
}

export function AcceptanceHandle({
  id,
  position,
  userAcceptance,
  oppositeUserAcceptance,
  alignsWithParent,
  supportsParent,
  nodeLabel,
  handleNodeUserAcceptanceChange,
}: AcceptanceHandleProps) {
  const [hovered, setHovered] = useState(false);

  let backgroundColor = ColorScheme.unaligned;
  let borderColor = ColorScheme.unaligned;

  if (hovered) {
    backgroundColor = "#fff";
  } else if (userAcceptance && oppositeUserAcceptance) {
    if (supportsParent) {
      backgroundColor = ColorScheme.consensus;
      borderColor = ColorScheme.consensus;
    } else {
      backgroundColor = ColorScheme.consensusDisagree;
      borderColor = ColorScheme.consensusDisagree;
    }
  } else if (userAcceptance) {
    backgroundColor =
      position == Position.Left ? ColorScheme.leftUser : ColorScheme.rightUser;
    borderColor =
      position == Position.Left ? ColorScheme.leftUser : ColorScheme.rightUser;
  } else {
    backgroundColor = ColorScheme.consensusNone;
    borderColor =
      position == Position.Left ? ColorScheme.leftUser : ColorScheme.rightUser;
  }

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
        background: backgroundColor,
        borderColor: borderColor,
        borderWidth: "1px",
        visibility: alignsWithParent ? "visible" : "hidden",
        left: position === Position.Left && nodeLabel == "" ? "20px" : "",
        right: position === Position.Right && nodeLabel == "" ? "20px" : "",
        zIndex: -1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    />
  );
}
