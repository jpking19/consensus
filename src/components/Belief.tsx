import React, { useState } from "react";

type Belief = {
  id: number;
  text: string;
  acceptanceLeft: boolean;
  acceptanceRight: boolean;
  x: number;
  y: number;
  supports?: Belief[];
  opposes?: Belief[];
};

function Belief({
  belief,
  handleEditingBeliefChange,
  onPositionChange,
}: {
  belief: Belief;
  handleEditingBeliefChange: (id: number | null) => void;
  onPositionChange?: (x: number, y: number, id?: number) => void; // <-- Accept optional id
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
    console.log("Input blurred, saving changes");
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

  // Drag state
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(
    null
  );

  // State for absolute position
  const [x, setX] = useState(belief.x);
  const [y, setY] = useState(belief.y);

  // Mouse down: record mouse and belief position, but do not start drag yet
  const handleMouseDownCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    setDragging(true);
    setDragOffset({ x: e.clientX - x, y: e.clientY - y });
  };

  const handleMouseDownAcceptance = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMouseDownPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUpCard = (e: React.MouseEvent) => {
    if (mouseDownPos) {
      const dx = e.clientX - mouseDownPos.x;
      const dy = e.clientY - mouseDownPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 5) {
        setEditing(true);
      } else {
        setDragging(true);
        setDragOffset({
          x: e.clientX - x,
          y: e.clientY - y,
        });
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
      }
      setMouseDownPos(null);
    }
  };

  // Handle mouse move for dragging belief to new position
  React.useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragOffset) return;
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setX(newX);
      setY(newY);
      if (onPositionChange) onPositionChange(dragOffset.x, dragOffset.y);
    };
    const handleMouseUp = () => {
      setDragging(false);
      setDragOffset(null);
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, dragOffset, onPositionChange]);

  React.useEffect(() => {
    // Update belief text when editing is done
    if (!editing) {
      belief.text = editValue;
      // Reset acceptance states when editing is done
      belief.acceptanceLeft = localAcceptanceLeft;
      belief.acceptanceRight = localAcceptanceRight;
      handleEditingBeliefChange(null); // Reset editing belief
    }
  }, [editing]);

  /*
   * #########################################################
   * Component Structure
   * #########################################################
   */

  return (
    <div
      className="belief-container"
      style={{
        position: "absolute",
        left: x,
        top: y,
        // ...existing container styles...
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        pointerEvents: "auto",
      }}
    >
      {/* First row: main belief card */}
      <div
        id="belief-card"
        className="position-relative d-flex align-items-stretch"
        style={{ gap: 0, minHeight }}
      >
        {/* Left acceptance card (background, extends left) */}
        <div
          id="left-acceptance-card"
          className={`position-relative top-0 bottom-0 d-flex flex-column justify-content-center align-items-end bg-${
            localAcceptanceLeft ? "success" : "danger"
          } border border-light`}
          style={{
            width: 32,
            height: minHeight,
            zIndex: zIndex - 1,
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            transition: "background 0.2s, left 0.2s",
            left: editing ? 48 : 8,
          }}
          onMouseDown={handleMouseDownAcceptance}
          onMouseUp={handleMouseUpAcceptance}
        ></div>
        {/* Main belief card (foreground) */}
        <div
          id="belief-content"
          className="position-relative card bg-dark border border-light mb-3 flex-grow-1 mx-auto"
          style={{
            cursor: "pointer",
            borderRadius: 8,
            minWidth,
            maxWidth,
            width: cardWidth,
            minHeight,
            zIndex: zIndex,
            boxShadow: "0 0 16px rgba(0,0,0,0.2)",
            userSelect: editing ? "text" : "none",
            WebkitUserSelect: editing ? "text" : "none",
            MozUserSelect: editing ? "text" : "none",
            msUserSelect: editing ? "text" : "none",
          }}
          onMouseDown={handleMouseDownCard}
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
          className={`position-relative top-0 bottom-0 d-flex flex-column justify-content-center align-items-start bg-${
            localAcceptanceRight ? "success" : "danger"
          } border border-light`}
          style={{
            width: 32,
            height: minHeight,
            zIndex: zIndex - 1,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
            transition: "background 0.2s, right 0.2s",
            right: editing ? 48 : 8,
          }}
          onMouseDown={handleMouseDownAcceptance}
          onMouseUp={handleMouseUpAcceptance}
        ></div>
      </div>
      {/* Second row: supporting and opposing beliefs */}
      {belief.supports?.length || belief.opposes?.length ? (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            marginTop: 8,
            gap: 0,
          }}
        >
          {/* Supporting beliefs (left 50%) */}
          <div
            style={{
              width: "50%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 16,
            }}
          >
            {belief.supports?.map((supportingBelief) => (
              <Belief
                key={supportingBelief.id}
                belief={supportingBelief}
                handleEditingBeliefChange={handleEditingBeliefChange}
                onPositionChange={(newX, newY) =>
                  onPositionChange &&
                  onPositionChange(newX, newY, supportingBelief.id)
                }
              />
            ))}
          </div>
          {/* Opposing beliefs (right 50%) */}
          <div
            style={{
              width: "50%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
            }}
          >
            {belief.opposes?.map((opposingBelief) => (
              <Belief
                key={opposingBelief.id}
                belief={opposingBelief}
                handleEditingBeliefChange={handleEditingBeliefChange}
                onPositionChange={(newX, newY) =>
                  onPositionChange &&
                  onPositionChange(newX, newY, opposingBelief.id)
                }
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Belief;
