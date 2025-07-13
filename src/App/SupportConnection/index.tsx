import { React } from "react";
import {
  Position,
  useConnection,
  useStore,
  getBezierPath,
} from "@xyflow/react";

export default ({ fromX, fromY, toX, toY }) => {
  const { fromHandle, fromNode } = useConnection();

  const nodeData = useStore((state) => state.nodeLookup.get(fromNode.id)?.data);

  // TODO change circle to be fake node (temp border) (should be red if not connectingUser)
  // TODO should change sides based on connectingUser

  console.log("connection x y ", fromX, fromY, toX, toY);

  if (fromHandle?.type == "target") {
    // Connection for creating a new parent needs to account for user being selected
    const [edgePath] = getBezierPath({
      sourceX: fromX,
      sourceY: fromY,
      targetX: toX,
      targetY: toY,
      sourcePosition: fromHandle?.position,
      targetPosition: nodeData.connectingUser
        ? nodeData.connectingUser === "left"
          ? Position.Left
          : Position.Right
        : Position.Top,
    });

    return (
      <g>
        <path
          fill="none"
          stroke={nodeData?.connectingUser ? "green" : "red"}
          opacity={nodeData?.connectingUser ? 1 : 0.5}
          strokeWidth={1.5}
          className="animated" // TODO not animated when not connectingUser
          style={{ animationDirection: "reverse" }} // TODO check on the type
          d={edgePath} //{`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
        />
        <circle
          cx={toX}
          cy={toY}
          fill="#fff"
          r={3}
          stroke={"white"}
          strokeWidth={1.5}
        />
      </g>
    );
  } else if (fromHandle?.type == "source") {
    // Connection for creating a new child belief needs to account for source Handle

    const [edgePath] = getBezierPath({
      // TODO this is half the width of the AcceptanceHandle
      sourceX: fromHandle.position == Position.Left ? fromX - 17 : fromX + 17,
      sourceY: fromY,
      targetX: toX,
      targetY: toY,
      sourcePosition: fromHandle?.position,
      targetPosition: Position.Top, // Always target the top for child beliefs
    });

    return (
      <g>
        <path
          fill="none"
          stroke={"white"}
          opacity={1}
          strokeWidth={1.5}
          className="animated"
          style={{ animationDirection: "reverse" }}
          d={edgePath}
        />
        <circle
          cx={toX}
          cy={toY}
          fill="#fff"
          r={3}
          stroke={"white"}
          strokeWidth={1.5}
        />
      </g>
    );
  } else {
    // If no handle type, return nothing
    return null;
  }
};
