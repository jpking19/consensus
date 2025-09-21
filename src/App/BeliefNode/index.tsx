import { useLayoutEffect, useEffect, useRef } from "react";
import { Handle, Position, NodeToolbar } from "@xyflow/react";
import { NodeAppendix } from "@/components/node-appendix";
import type { NodeProps } from "@xyflow/react";

import useStore from "../store";
import type { BeliefNode } from "../types";
import { AcceptanceHandle } from "../AcceptanceHandle";
import { SupportHandle } from "../SupportHandle";
import { ColorScheme } from "../colors";

import TextareaAutosize from "react-textarea-autosize";

function BeliefNode({ id, parentId, data }: NodeProps<BeliefNode>) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const editingRef = useRef<Boolean>(true);
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  const updateNodeChildrenPosition = useStore(
    (state) => state.updateNodeChildPosition
  );
  const updateNodeUserAcceptance = useStore(
    (state) => state.updateNodeUserAcceptance
  );
  const updateNodeParentSupport = useStore(
    (state) => state.updateNodeParentSupport
  );

  const handleNodeUserAcceptanceChange = (e: React.MouseEvent) => {
    if ((e.target as Element).classList.contains("left-acceptance-handle")) {
      updateNodeUserAcceptance(id, "left", !data.leftAcceptance);
    } else if (
      (e.target as Element).classList.contains("right-acceptance-handle")
    ) {
      updateNodeUserAcceptance(id, "right", !data.rightAcceptance);
    }
  };

  const handleNodeParentSupportChange = (e: React.MouseEvent) => {
    updateNodeParentSupport(id, !data.supportsParent);
  };

  useEffect(() => {
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus({ preventScroll: true });
      }
    }, 1);
  }, []);

  useLayoutEffect(() => {
    if (textAreaRef.current) {
      // TODO please god put this width calculation in a util class

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        console.error("Failed to get canvas context");
        return;
      }
      const font = "12px monospace"; // Adjust as needed
      context.font = font;
      const metrics = context.measureText(data.label);
      const currentWidth = textAreaRef.current.clientWidth - 20; // 20 accounts for padding
      let newWidth = 0;

      const placeHolderMetrics = context.measureText(
        textAreaRef.current.placeholder
      );
      const placeholderWidth = Math.ceil(placeHolderMetrics.width);
      if (metrics.width < placeholderWidth) {
        // If the label is empty/smaller than placeholder, we use the placeholder width
        newWidth = Math.ceil(placeHolderMetrics.width);
      } else if (metrics.width < 300) {
        // If the label is less than 300px, we use the label width
        newWidth = Math.ceil(metrics.width);
      } else {
        newWidth = 300; // Set a max width
      }
      textAreaRef.current.style.width = newWidth + "px";

      // We need to update the position of child nodes when the label changes
      const changeInWidth = currentWidth - newWidth;
      updateNodeChildrenPosition(id, changeInWidth);
    }
  }, [data.label.length]);

  useEffect(() => {
    // When the node is selected, we focus the text area
    if (textAreaRef.current) {
      textAreaRef.current.focus({ preventScroll: true });
    }
  }, [id]);

  let borderColor = ColorScheme.borderDefault;
  let textColor = ColorScheme.textDefault;
  if (!data.alignsWithParent) {
    borderColor = ColorScheme.unaligned;
    textColor = ColorScheme.unaligned;
  } else if (data.leftAcceptance && data.rightAcceptance) {
    if (data.supportsParent) {
      borderColor = ColorScheme.consensus;
      textColor = ColorScheme.consensus;
    } else {
      borderColor = ColorScheme.consensusDisagree;
      textColor = ColorScheme.consensusDisagree;
    }
  } else if (!data.leftAcceptance && !data.rightAcceptance) {
    // root node needs to retain default colors
    if (data.user === "both") {
      borderColor = ColorScheme.borderDefault;
      textColor = ColorScheme.textDefault;
    } else {
      borderColor = ColorScheme.unaligned;
      textColor = ColorScheme.unaligned;
    }
  } else if (data.user === "left") {
    borderColor = ColorScheme.leftUser;
    textColor = ColorScheme.leftUser;
  } else if (data.user === "right") {
    borderColor = ColorScheme.rightUser;
    textColor = ColorScheme.rightUser;
  }

  return (
    <>
      <div
        className={"react-flow__node-belief"}
        data-user={data.user}
        style={{
          opacity: data.alignsWithParent ? 1 : 0.5,
        }}
      >
        <TextareaAutosize
          className={"react-flow__node-input"}
          value={data.label}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            // If the label has changed, and the node's acceptance needs to change,
            // we reset the acceptance states and the children's support states
            const labelChanged = e.target.value !== data.label;
            const resetLeftChildren =
              labelChanged && data.user == "right" && data.leftAcceptance;
            const resetRightChildren =
              labelChanged && data.user == "left" && data.rightAcceptance;
            updateNodeLabel(
              id,
              e.target.value,
              resetLeftChildren,
              resetRightChildren
            );
          }}
          style={{
            resize: "none",
            textAlign: "left",
            borderColor: borderColor,
            color: textColor,
          }}
          spellCheck="false"
          placeholder="What do you believe?"
          ref={textAreaRef}
          readOnly={!data.alignsWithParent}
        ></TextareaAutosize>
      </div>
      <SupportHandle
        id={`target-${id}`}
        position={Position.Top}
        parentId={parentId}
        user={data.user}
        alignsWithParent={data.alignsWithParent}
        leftAcceptance={data.leftAcceptance}
        rightAcceptance={data.rightAcceptance}
        nodeLabel={data.label}
        supportsParent={data.supportsParent}
        handleNodeParentSupportChange={handleNodeParentSupportChange}
      />
      <AcceptanceHandle
        id={`source-${id}-left`}
        position={Position.Left}
        userAcceptance={data.leftAcceptance}
        oppositeUserAcceptance={data.rightAcceptance}
        alignsWithParent={data.alignsWithParent}
        supportsParent={data.supportsParent}
        nodeLabel={data.label}
        handleNodeUserAcceptanceChange={handleNodeUserAcceptanceChange}
      />
      <AcceptanceHandle
        id={`source-${id}-right`}
        position={Position.Right}
        userAcceptance={data.rightAcceptance}
        oppositeUserAcceptance={data.leftAcceptance}
        alignsWithParent={data.alignsWithParent}
        supportsParent={data.supportsParent}
        nodeLabel={data.label}
        handleNodeUserAcceptanceChange={handleNodeUserAcceptanceChange}
      />
      <NodeAppendix position="bottom">
        <button
          type="button"
          className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
          onClick={() => {
            if (data.collapsedChildren?.length !== 0) {
              useStore.getState().restoreNodeBeliefs(id);
            } else {
              useStore.getState().collapseNodeBeliefs(id);
            }
          }}
        >
          Collapse Beliefs
        </button>
      </NodeAppendix>
    </>
  );
}

export default BeliefNode;
