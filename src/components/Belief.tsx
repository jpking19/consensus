import React, { useState } from "react";

type Belief = {
  id: number;
  text: string;
  acceptanceLeft: boolean;
  acceptanceRight: boolean;
  x?: number; // Position of the belief card TODO do we need this?
  y?: number; // Position of the belief card TODO do we need this?
  supports?: Belief[];
  opposes?: Belief[];
};

function Belief({
  belief,
  handleEditingBeliefChange,
}: {
  belief: Belief;
  handleEditingBeliefChange: (id: number | null) => void;
}) {
  const [zIndex, setZIndex] = useState(3); // TODO: Z index should be lowered to base state when connected to another belief

  /*
   * #########################################################
   * Acceptance
   * #########################################################
   */
  const [localAcceptanceLeft, setLocalAcceptanceLeft] = useState(
    belief.acceptanceLeft
  );
  const [localAcceptanceRight, setLocalAcceptanceRight] = useState(
    belief.acceptanceRight
  );

  const handleLeftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalAcceptanceLeft((prev) => !prev);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalAcceptanceRight((prev) => !prev);
  };

  /*
   * #########################################################
   * Card Text Change
   * #########################################################
   */
  const minWidth = 200;
  const maxWidth = 400;
  const minHeight = 64;
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(belief.text);
  const [cardWidth, setCardWidth] = useState(minWidth);
  const [inputRows, setInputRows] = useState(1);

  // Calculate width based on text length and max lines
  const getTextWidth = (text: string) => {
    // Create a temporary span to measure text width
    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.position = "fixed";
    span.style.whiteSpace = "pre";
    span.style.font = "1rem Helvetica Neue, sans-serif";
    span.textContent = text;
    document.body.appendChild(span);
    const width = span.offsetWidth + 16; // Add padding for input
    document.body.removeChild(span);
    return width;
  };

  const handleInputBlur = () => {
    setEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value);

    // Reset acceptance states when editing text
    setLocalAcceptanceLeft(false);
    setLocalAcceptanceRight(false);
  };

  // Update card width and input rows when editing state changes
  React.useEffect(() => {
    // Set this belief as the currently edited belief
    if (editing) {
      handleEditingBeliefChange(belief.id);
    }

    // Calculate width based on text length
    const width = Math.min(
      Math.max(getTextWidth(editValue) + 32, minWidth),
      maxWidth
    );
    setCardWidth(width);

    // Calculate number of rows needed
    const approxCharsPerLine = 50; // adjust as needed
    const lines = Math.ceil(editValue.length / approxCharsPerLine);
    setInputRows(lines);
  }, [editValue, editing]);

  /*
   * #########################################################
   * Drag and Click Detection
   * #########################################################
   */

  // Track mouse position for click vs drag detection
  const [mouseDownPos, setMouseDownPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Set MouseDown position on mouse down, to  detect click vs drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Mouse down on belief card");
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    // TODO set drag source ID if on acceptance, so we can handle add from App
  };

  const handleMouseUpCard = (e: React.MouseEvent) => {
    console.log("Mouse up on belief card");
    e.stopPropagation();
    if (mouseDownPos) {
      const dx = e.clientX - mouseDownPos.x;
      const dy = e.clientY - mouseDownPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 5) {
        setEditing(true);
      }
    }
    setMouseDownPos(null);
  };

  const handleMouseUpAcceptance = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Mouse up on acceptance card");
    if (mouseDownPos) {
      const dx = e.clientX - mouseDownPos.x;
      const dy = e.clientY - mouseDownPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 5) {
        if (e.currentTarget.id === "left-acceptance-card") {
          handleLeftClick(e);
        } else {
          handleRightClick(e);
        }
      } else {
        // TODO call end of drag handler - this will be where we handle adding beliefs
        // TODO check if source belief is current
        // TODO check if source belief is already connected to this belief
        console.log("Drag detected, not toggling acceptance");
      }
      setMouseDownPos(null);
    }
  };

  /*
   * #########################################################
   * Component Structure
   * #########################################################
   */
  return (
    <div>
      <div
        id="belief-card"
        className="position-relative d-flex align-items-stretch"
        style={{ gap: 0, minHeight }}
      >
        {/* Left acceptance card (background, extends left) */}
        <div
          id="left-acceptance-card"
          className={`position-absolute top-0 bottom-0 d-flex flex-column justify-content-center align-items-end bg-${
            localAcceptanceLeft ? "success" : "danger"
          } border border-light`}
          style={{
            width: 120,
            height: minHeight,
            zIndex: zIndex - 1,
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            transition: "background 0.2s, left 0.2s",
            left: editing ? 32 : -24,
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUpAcceptance}
        ></div>
        {/* Main belief card (foreground) */}
        <div
          id="belief-content"
          className="card bg-dark border border-light mb-3 flex-grow-1 position-relative mx-auto"
          style={{
            cursor: "pointer",
            borderRadius: 8,
            minWidth,
            maxWidth,
            width: cardWidth,
            minHeight,
            zIndex: zIndex,
            boxShadow: "0 0 16px rgba(0,0,0,0.2)",
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUpCard}
        >
          <div className="card-header text-light d-flex justify-content-between align-items-center">
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              {editing ? (
                <textarea
                  className="form-control-plaintext bg-dark text-light border-0 p-0 m-0"
                  value={editValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  autoFocus
                  style={{
                    width: "100%",
                    minWidth: 0,
                    maxWidth: "100%",
                    boxShadow: "none",
                    resize: "none",
                    overflow: "hidden",
                  }}
                  onClick={(e) => e.stopPropagation()}
                  rows={inputRows}
                  wrap="soft"
                />
              ) : (
                <span style={{ whiteSpace: "pre-line" }}>{editValue}</span>
              )}
            </div>
          </div>
        </div>
        {/* Right acceptance card (background, extends right) */}
        <div
          id="right-acceptance-card"
          className={`position-absolute top-0 bottom-0 d-flex flex-column justify-content-center align-items-start bg-${
            localAcceptanceRight ? "success" : "danger"
          } border border-light`}
          style={{
            width: 120,
            height: minHeight,
            zIndex: zIndex - 1,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
            transition: "background 0.2s, right 0.2s",
            right: editing ? 32 : -24,
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUpAcceptance}
        ></div>
      </div>
      {/* Supporting Beliefs */}
      <ul>
        {belief.supports?.map((supportingBelief) => (
          <Belief
            key={supportingBelief.id}
            belief={supportingBelief}
            handleEditingBeliefChange={handleEditingBeliefChange}
          />
        ))}
      </ul>
      {/* Opposing Beliefs */}
      <ul>
        {belief.opposes?.map((opposingBelief) => (
          <Belief
            key={opposingBelief.id}
            belief={opposingBelief}
            handleEditingBeliefChange={handleEditingBeliefChange}
          />
        ))}
      </ul>
    </div>
  );
}

export default Belief;
