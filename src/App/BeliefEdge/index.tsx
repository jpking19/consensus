import { Position, useStore } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import "../../index.css"; // Import the CSS for styling
import type { BeliefEdge } from "../types";
import { useMemo } from "react";
import { ColorScheme } from "../colors";
import { Button } from "@/components/ui/button";
import { ButtonEdge } from "@/components/button-edge";
import { default as useStoreOriginal } from "../store";

export default function BeliefEdge(props: EdgeProps<BeliefEdge>) {
  const childNode = useStore((state) => state.nodeLookup.get(props.target));
  const childNodeData = childNode?.data;
  const parentNodeData = useStore(
    (state) => state.nodeLookup.get(props.source)?.data
  );

  if (!childNodeData || !parentNodeData) {
    return null;
  }

  // Use target node's data to get values for determing edge style
  const edgeStyle = useMemo(() => {
    let edgeStyle = {
      zIndex: -2,
    };
    if (childNodeData && parentNodeData) {
      if (!childNodeData.alignsWithParent) {
        return {
          ...edgeStyle,
          strokeDasharray: 5,
          stroke: ColorScheme.borderDefault,
        };
      } else if (childNodeData.alignsWithParent) {
        if (childNodeData.leftAcceptance && childNodeData.rightAcceptance) {
          if (childNodeData.supportsParent) {
            return {
              ...edgeStyle,
              stroke: ColorScheme.consensus,
            };
          } else {
            return {
              ...edgeStyle,
              stroke: ColorScheme.consensusDisagree,
            };
          }
        } else if (
          !childNodeData.leftAcceptance &&
          !childNodeData.rightAcceptance
        ) {
          return {
            ...edgeStyle,
            strokeDasharray: 5,
            stroke: ColorScheme.borderDefault,
          };
        } else if (
          props.sourcePosition == Position.Left &&
          parentNodeData.leftAcceptance
        ) {
          return {
            ...edgeStyle,
            stroke: ColorScheme.leftUser,
          };
        } else if (
          props.sourcePosition == Position.Right &&
          parentNodeData.rightAcceptance
        ) {
          return {
            ...edgeStyle,
            stroke: ColorScheme.rightUser,
          };
        } else if (
          props.sourcePosition == Position.Left &&
          !parentNodeData.leftAcceptance
        ) {
          return {
            ...edgeStyle,
            stroke: ColorScheme.consensusDisagree,
          };
        } else if (
          props.sourcePosition == Position.Right &&
          !parentNodeData.rightAcceptance
        ) {
          return {
            ...edgeStyle,
            stroke: ColorScheme.consensusDisagree,
          };
        }
      }
    }

    return {};
  }, [childNodeData, parentNodeData]);

  return (
    <>
      <ButtonEdge {...props} style={edgeStyle}>
        <Button
          onClick={() =>
            useStoreOriginal.getState().addIntermediateNode(childNode)
          }
          className="monospace"
          size="sm"
          variant="default"
          style={{
            padding: "0 3px",
            borderRadius: "3px",
            fontSize: "11px",
            background: ColorScheme.consensusNone,
            border: `1px solid ${ColorScheme.textDefault}`,
            color: ColorScheme.textDefault,
            cursor: "pointer",
          }}
        >
          {`+`}
        </Button>
        <Button
          onClick={() =>
            useStoreOriginal.getState().addCopiedNodeForDisagreement(childNode)
          }
          className="monospace"
          size="sm"
          variant="default"
          style={{
            paddingTop: "0px",
            paddingBottom: "0px",
            paddingLeft: "4px",
            paddingRight: "4px",
            borderRadius: "3px",
            fontSize: "11px",
            background: ColorScheme.consensusDisagree,
            border: `1px solid ${ColorScheme.textDefault}`,
            color: ColorScheme.textDefault,
            cursor: "pointer",
          }}
        >
          {`-`}
        </Button>
      </ButtonEdge>
    </>
  );
}
