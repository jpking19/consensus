import { useLayoutEffect, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

import useStore from "../store";
import type { BeliefNode } from "../types";

import TextareaAutosize from "react-textarea-autosize";

function BeliefNode({ id, data }: NodeProps<BeliefNode>) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  const updateNodeChildrenPosition = useStore(
    (state) => state.updateNodeChildPosition
  );

  useEffect(() => {
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus({ preventScroll: true });
      }
    }, 1);
  }, []);

  useLayoutEffect(() => {
    if (textAreaRef.current) {
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
      if (metrics.width == 0) {
        // If the label is empty, we use the placeholder width
        const placeHolderMetrics = context.measureText(
          textAreaRef.current.placeholder
        );
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

  return (
    <>
      <div className={"react-flow__node-belief"}>
        <TextareaAutosize
          className={"react-flow__node-input"}
          value={data.label}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            updateNodeLabel(id, e.target.value);
          }}
          style={{
            resize: "none",
            textAlign: "left",
          }}
          // TODO autocorrect
          // TODO spellcheck
          placeholder="What do you believe?"
          ref={textAreaRef}
        ></TextareaAutosize>
      </div>
      <Handle id={`source-${id}`} type="source" position={Position.Top} />
      <Handle id={`target-${id}-left`} type="target" position={Position.Left} />
      <Handle
        id={`target-${id}-right`}
        type="target"
        position={Position.Right}
      />
    </>
  );
}

export default BeliefNode;
