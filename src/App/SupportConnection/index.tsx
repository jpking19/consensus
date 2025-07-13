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
      : Position.Top, // TODO check if this is correct
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
};
