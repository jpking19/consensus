import { useCallback, useState } from "react";
import { ReactFlow, Background, type NodeOrigin } from "@xyflow/react";
import { ColorScheme } from "../colors";
import BeliefNode from "../BeliefNode";
import BeliefEdge from "../BeliefEdge";

const nodeTypes = {
  belief: BeliefNode,
};

const edgeTypes = {
  beliefEdge: BeliefEdge,
};

// this places the node origin in the center of a node
const nodeOrigin: NodeOrigin = [0.5, 0];

interface SplashScreenProps {
  onDismiss: () => void;
}

export default function SplashScreen({ onDismiss }: SplashScreenProps) {
  // Track if left/right agree buttons have been clicked
  const [leftAgreeClicked, setLeftAgreeClicked] = useState(false);
  const [rightAgreeClicked, setRightAgreeClicked] = useState(false);

  // Track hover states for all buttons
  const [leftButtonHovered, setLeftButtonHovered] = useState(false);
  const [enterButtonHovered, setEnterButtonHovered] = useState(false);
  const [rightButtonHovered, setRightButtonHovered] = useState(false);

  const [splashNodes, setSplashNodes] = useState(() => [
    {
      id: "splash-root-1",
      type: "belief",
      position: { x: 200, y: 140 },
      data: {
        label:
          "I intend to treat my conversation partner with respect and empathy.",
        user: "both",
        supportsParent: true,
        alignsWithParent: true,
        leftAcceptance: false,
        rightAcceptance: false,
        collapsed: false,
        stateIndex: 0,
        states: [],
      },
    },
    {
      id: "splash-root-2",
      type: "belief",
      position: { x: 200, y: 250 },
      data: {
        label:
          "The purpose of this conversation is not to establish my perspective as absolute truth.",
        user: "both",
        supportsParent: true,
        alignsWithParent: true,
        leftAcceptance: false,
        rightAcceptance: false,
        collapsed: false,
        stateIndex: 0,
        states: [],
      },
    },
    {
      id: "splash-root-3",
      type: "belief",
      position: { x: 200, y: 350 },
      data: {
        label:
          "The purpose of this conversation is to both reveal the foundational beliefs we share,    and to identify precisely where our high-level beliefs begin to diverge.",
        user: "both",
        supportsParent: true,
        alignsWithParent: true,
        leftAcceptance: false,
        rightAcceptance: false,
        collapsed: false,
        stateIndex: 0,
        states: [],
      },
    },
  ]);

  const onSplashNodeClick = useCallback((event: any, node: any) => {
    const handleId = event?.target
      ? (event.target as Element).getAttribute("data-handleid")
      : null;

    setSplashNodes((nds: any[]) =>
      nds.map((splashNode) => {
        if (splashNode.id === node.id) {
          return {
            ...splashNode,
            data: {
              ...splashNode.data,
              leftAcceptance:
                handleId === `source-${node.id}-left`
                  ? !splashNode.data.leftAcceptance
                  : splashNode.data.leftAcceptance,
              rightAcceptance:
                handleId === `source-${node.id}-right`
                  ? !splashNode.data.rightAcceptance
                  : splashNode.data.rightAcceptance,
            },
          };
        }
        return splashNode;
      })
    );
  }, []);

  const agreeAllLeft = useCallback(() => {
    setLeftAgreeClicked(true);
    setSplashNodes((nds: any[]) =>
      nds.map((splashNode) => ({
        ...splashNode,
        data: {
          ...splashNode.data,
          leftAcceptance: true,
        },
      }))
    );
  }, []);

  const agreeAllRight = useCallback(() => {
    setRightAgreeClicked(true);
    setSplashNodes((nds: any[]) =>
      nds.map((splashNode) => ({
        ...splashNode,
        data: {
          ...splashNode.data,
          rightAcceptance: true,
        },
      }))
    );
  }, []);

  // Check if all beliefs are agreed with by both users
  const allBeliefsAgreedByBoth = splashNodes.every(
    (node) => node.data.leftAcceptance && node.data.rightAcceptance
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "1000px",
          height: "1030px",
          backgroundColor: "#1e1e1e",
          borderRadius: "12px",
          border: "1px solid #444",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #444",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              marginBottom: "10px",
              fontFamily: "Georgia, serif",
            }}
          >
            Welcome to Consensus
          </h1>
          <p
            style={{
              color: "#ccc",
              margin: 0,
              textAlign: "left",
              fontFamily: "Georgia, serif",
              fontSize: "22px",
              lineHeight: "1.25",
            }}
          >
            {" "}
            <br />
            Consensus is a conversation tool for visualizing conflicting belief
            systems.
            <br /> <br />
            Create Belief nodes to express why you agree or disagree with
            another Belief, by dragging from the{" "}
            <span>
              <span style={{ color: ColorScheme.leftUser, fontWeight: "bold" }}>
                left
              </span>{" "}
            </span>
            or{" "}
            <span>
              <span
                style={{
                  color: ColorScheme.rightUser,
                  fontWeight: "bold",
                }}
              >
                right
              </span>{" "}
            </span>
            side of the node. Click on the side of a Belief node to change a
            user's acceptance.
            <br />
            <br />
            When both users signal acceptance on a Belief, it will be
            highlighted as <b>Consensus</b> either in{" "}
            <span
              style={{
                color: ColorScheme.consensus,
                fontWeight: "bold",
              }}
            >
              agreement
            </span>{" "}
            or{" "}
            <span>
              <span
                style={{
                  color: ColorScheme.consensusDisagree,
                  fontWeight: "bold",
                }}
              >
                disagreement
              </span>{" "}
            </span>{" "}
            with the parent Belief.
            <br />
            <br />
            Before initiating the conversation, both users may optionally agree
            to initial statements below:
          </p>
        </div>

        <div style={{ flex: 1, position: "relative" }}>
          <ReactFlow
            nodes={splashNodes}
            edges={[]}
            onNodeClick={onSplashNodeClick}
            fitView
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            zoomOnScroll={false}
            zoomOnPinch={false}
            panOnDrag={true}
            panOnScroll={false}
            attributionPosition="bottom-left"
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodeOrigin={nodeOrigin}
            colorMode="dark"
            disableKeyboardA11y
            deleteKeyCode={[]}
            minZoom={1.5}
            maxZoom={1.5}
          >
            <Background />
          </ReactFlow>
        </div>

        <div
          style={{
            padding: "20px",
            borderTop: "1px solid #444",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "32px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <button
              onClick={agreeAllLeft}
              onMouseEnter={() => setLeftButtonHovered(true)}
              onMouseLeave={() => setLeftButtonHovered(false)}
              style={{
                padding: "12px 20px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: leftButtonHovered
                  ? "#fff"
                  : ColorScheme.consensusNone,
                color: leftButtonHovered
                  ? "#000"
                  : leftAgreeClicked
                  ? ColorScheme.leftUser
                  : "#666",
                border: leftButtonHovered
                  ? "1px solid #000"
                  : leftAgreeClicked
                  ? `1px solid ${ColorScheme.leftUser}`
                  : "1px solid #666",
                borderRadius: "6px",
                cursor: "pointer",
                fontFamily: "Georgia, serif",
                transition:
                  "background-color 0.2s, color 0.2s, border-color 0.2s",
              }}
            >
              Left Agree All
            </button>
            <button
              onClick={onDismiss}
              onMouseEnter={() => setEnterButtonHovered(true)}
              onMouseLeave={() => setEnterButtonHovered(false)}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: enterButtonHovered
                  ? "#fff"
                  : ColorScheme.consensusNone,
                color: enterButtonHovered
                  ? "#000"
                  : allBeliefsAgreedByBoth
                  ? ColorScheme.consensus
                  : ColorScheme.consensusDisagree,
                border: enterButtonHovered
                  ? "1px solid #000"
                  : allBeliefsAgreedByBoth
                  ? `1px solid ${ColorScheme.consensus}`
                  : `1px solid ${ColorScheme.consensusDisagree}`,
                borderRadius: "6px",
                cursor: "pointer",
                fontFamily: "Georgia, serif",
                transition:
                  "background-color 0.2s, color 0.2s, border-color 0.2s",
              }}
            >
              Enter Consensus
            </button>
            <button
              onClick={agreeAllRight}
              onMouseEnter={() => setRightButtonHovered(true)}
              onMouseLeave={() => setRightButtonHovered(false)}
              style={{
                padding: "12px 20px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: rightButtonHovered
                  ? "#fff"
                  : ColorScheme.consensusNone,
                color: rightButtonHovered
                  ? "#000"
                  : rightAgreeClicked
                  ? ColorScheme.rightUser
                  : "#666",
                border: rightButtonHovered
                  ? "1px solid #000"
                  : rightAgreeClicked
                  ? `1px solid ${ColorScheme.rightUser}`
                  : "1px solid #666",
                borderRadius: "6px",
                cursor: "pointer",
                fontFamily: "Georgia, serif",
                transition:
                  "background-color 0.2s, color 0.2s, border-color 0.2s",
              }}
            >
              Right Agree All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
