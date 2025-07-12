import { useLayoutEffect, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";

import useStore from "../store";
import type { BeliefNode } from "../types";

import TextareaAutosize from "react-textarea-autosize";

function BeliefNode({ id, data }: NodeProps<BeliefNode>) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);

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
      if (metrics.width < 300) {
        textAreaRef.current.style.width = `${metrics.width}px`; // Add some padding
      } else {
        textAreaRef.current.style.width = "300px"; // Set a max width
      }
    }
  }, [data.label.length]);

  return (
    <>
      <div className="react-flow__node-belief">
        {/* <input
          id={`label-${id}`}
          ref={inputRef}
          className="react-flow__node-input"
          value={data.label}
          onChange={(e) => updateNodeLabel(id, e.target.value)}
        /> */}
        {/* <textarea
          className="react-flow__node-input"
          value={data.label}
          onChange={(e) => updateNodeLabel(id, e.target.value)}
          style={{
            height: 12,
            minHeight: 0,
            resize: "none",
            // Other styling for the textarea
          }}
          // wrap={"soft"}
          ref={textAreaRef}
        /> */}

        <TextareaAutosize
          className="react-flow__node-input"
          value={data.label}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            updateNodeLabel(id, e.target.value);
          }}
          style={{
            resize: "none",
            textAlign: "left",
          }}
          // TODO placeholder
          // TODO autocorrect
          // TODO spellcheck
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
