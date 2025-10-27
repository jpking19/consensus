import { useState, useEffect, useCallback } from "react";
import type { ReactFlowInstance } from "@xyflow/react";

interface TopBarProps {
  onShowSplash: () => void;
  rfInstance: ReactFlowInstance | null;
  setNodes: (nodes: any[]) => void;
  setEdges: (edges: any[]) => void;
}

export default function TopBar({
  onShowSplash,
  rfInstance,
  setNodes,
  setEdges,
}: TopBarProps) {
  const [flowName, setFlowName] = useState("");
  const [savedFlows, setSavedFlows] = useState<string[]>([]);
  const [selectedFlow, setSelectedFlow] = useState("");

  // Load saved flow names from localStorage on mount
  useEffect(() => {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("consensus-flow-")
    );
    setSavedFlows(keys.map((key) => key.replace("consensus-flow-", "")));
  }, []);

  // Save flow with user-provided name
  const onSave = useCallback(() => {
    if (rfInstance && flowName) {
      const flow = rfInstance.toObject();
      localStorage.setItem(`consensus-flow-${flowName}`, JSON.stringify(flow));
      setSavedFlows((prev) =>
        prev.includes(flowName) ? prev : [...prev, flowName]
      );
      alert(`Flow saved as '${flowName}'`);
    } else {
      alert("Please enter a name for your flow before saving.");
    }
  }, [rfInstance, flowName]);

  // Upversion nodes whe flow is loaded
  const upversionNodes = (nodes: any[]) => {
    return nodes.map((node) => {
      if (node.data) {
        return {
          ...node,
          data: {
            ...node.data,
            stateIndex: node.data.stateIndex || 0,
            states: node.data.states || [],
          },
        };
      }
      return node;
    });
  };

  // Restore flow from selected name
  const onRestore = useCallback(() => {
    if (selectedFlow) {
      const flow = JSON.parse(
        localStorage.getItem(`consensus-flow-${selectedFlow}`) || "null"
      );
      if (flow) {
        flow.nodes = upversionNodes(flow.nodes || []);
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        // TODO restore viewport if needed
      } else {
        alert("No flow found for selected name.");
      }
    } else {
      alert("Please select a flow to restore.");
    }
  }, [selectedFlow, setNodes, setEdges]);

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 10px",
        paddingTop: 10,
        paddingBottom: 10,
        background: "#1e1e1e",
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="text"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          placeholder="Enter flow name"
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            backgroundColor: "#1e1e1e",
            color: "white",
            border: "1px solid #666",
            borderRadius: "6px",
            fontFamily:
              '"Menlo", "Lucida Console", "Monaco", "Consolas", monospace',
          }}
        />
        <button
          onClick={onSave}
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            fontWeight: "bold",
            backgroundColor: "#1e1e1e",
            color: "white",
            border: "1px solid #666",
            borderRadius: "6px",
            cursor: "pointer",
            fontFamily:
              '"Menlo", "Lucida Console", "Monaco", "Consolas", monospace',
            transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
          }}
        >
          Save Flow
        </button>
        <select
          value={selectedFlow}
          onChange={(e) => setSelectedFlow(e.target.value)}
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            backgroundColor: "#1e1e1e",
            color: "white",
            border: "1px solid #666",
            borderRadius: "6px",
            fontFamily:
              '"Menlo", "Lucida Console", "Monaco", "Consolas", monospace',
          }}
        >
          <option value="">Select saved flow</option>
          {savedFlows.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button
          onClick={onRestore}
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            fontWeight: "bold",
            backgroundColor: "#1e1e1e",
            color: "white",
            border: "1px solid #666",
            borderRadius: "6px",
            cursor: "pointer",
            fontFamily:
              '"Menlo", "Lucida Console", "Monaco", "Consolas", monospace',
            transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
          }}
        >
          Restore Flow
        </button>
      </div>
      <button
        onClick={onShowSplash}
        style={{
          padding: "8px 12px",
          fontSize: "14px",
          fontWeight: "bold",
          backgroundColor: "#2ecc71",
          color: "white",
          border: "1px solid #2ecc71",
          borderRadius: "6px",
          cursor: "pointer",
          fontFamily:
            '"Menlo", "Lucida Console", "Monaco", "Consolas", monospace',
          transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
        }}
      >
        Help
      </button>
    </div>
  );
}
