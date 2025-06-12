import React, { useState } from "react";

/* A belife will contain
- A title (one sentence)
    - this title can contain definitions
- A description (necessary facts)
- A bool acceptance for both left and right
- a tree of children Beliefs that support
- a tree of children Beliefs that oppose
*/

interface BeliefProps {
  text: string;
  description: string;
  acceptanceLeft: boolean;
  acceptanceRight: boolean;
  supports?: BeliefProps[];
  opposes?: BeliefProps[];
  onTextChange?: (newText: string) => void;
  onAcceptanceLeftChange?: (val: boolean) => void;
  onAcceptanceRightChange?: (val: boolean) => void;
}

const Belief: React.FC<BeliefProps> = ({
  text,
  description,
  acceptanceLeft,
  acceptanceRight,
  supports = [],
  opposes = [],
  onTextChange,
  onAcceptanceLeftChange,
  onAcceptanceRightChange,
}) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const [zIndex, setZIndex] = useState(3); // Z index should be lowered to base state when connected to another belief
  const [showDescription, setShowDescription] = useState(false);

  // Local state for acceptance if handlers are not provided
  const [localAcceptanceLeft, setLocalAcceptanceLeft] =
    useState(acceptanceLeft);
  const [localAcceptanceRight, setLocalAcceptanceRight] =
    useState(acceptanceRight);

  // Keep local state in sync with props
  React.useEffect(() => {
    setLocalAcceptanceLeft(acceptanceLeft);
  }, [acceptanceLeft]);
  React.useEffect(() => {
    setLocalAcceptanceRight(acceptanceRight);
  }, [acceptanceRight]);

  const handleCardClick = () => {
    if (onTextChange) setEditing(true);
  };

  const handleInputBlur = () => {
    setEditing(false);
    if (onTextChange && editValue !== text) onTextChange(editValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
  };

  const handleToggleDescription = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDescription((prev) => !prev);
  };

  const handleLeftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAcceptanceLeftChange) {
      onAcceptanceLeftChange(!acceptanceLeft);
    } else {
      setLocalAcceptanceLeft((prev) => !prev);
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAcceptanceRightChange) {
      onAcceptanceRightChange(!acceptanceRight);
    } else {
      setLocalAcceptanceRight((prev) => !prev);
    }
  };

  // Update editValue if text prop changes externally
  React.useEffect(() => {
    setEditValue(text);
    // Reset acceptance states if text changes
    setLocalAcceptanceLeft(false);
    setLocalAcceptanceRight(false);
  }, [text]);

  // Card sizing options
  const minWidth = 200;
  const maxWidth = 400;
  const minHeight = 64;

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

  const [cardWidth, setCardWidth] = useState(minWidth);
  const [inputRows, setInputRows] = useState(1);

  React.useEffect(() => {
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

  return (
    <div
      id="belief-card"
      className="position-relative d-flex align-items-stretch"
      style={{ gap: 0, minHeight }}
    >
      {/* Left acceptance card (background, extends left) */}
      <div
        id="left-acceptance-card"
        className={`position-absolute top-0 bottom-0 d-flex flex-column justify-content-center align-items-end bg-${
          (onAcceptanceLeftChange ? acceptanceLeft : localAcceptanceLeft)
            ? "success"
            : "danger"
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
        onClick={handleLeftClick}
        title={
          (onAcceptanceLeftChange ? acceptanceLeft : localAcceptanceLeft)
            ? "Accepted by Left (click to toggle)"
            : "Not accepted by Left (click to toggle)"
        }
      ></div>
      {/* Main belief card (foreground) */}
      <div
        id="belief-content"
        className="card bg-dark border border-light mb-3 flex-grow-1 position-relative mx-auto"
        style={{
          cursor: onTextChange ? "pointer" : undefined,
          borderRadius: 8,
          minWidth,
          maxWidth,
          width: cardWidth,
          minHeight,
          zIndex: zIndex,
          boxShadow: "0 0 16px rgba(0,0,0,0.2)",
        }}
        onClick={handleCardClick}
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
            {editing && onTextChange ? (
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
              <span style={{ whiteSpace: "pre-line" }}>{text}</span>
            )}
          </div>
          {/* </div>
        <div className="card-body text-light">
          {showDescription && <p className="card-text">{description}</p>}
          {supports.length > 0 && (
            <div className="mt-3">
              <h6 className="text-info">Supports</h6>
              <div className="ms-3">
                {supports.map((belief, idx) => (
                  <Belief key={idx} {...belief} />
                ))}
              </div>
            </div>
          )}
          {opposes.length > 0 && (
            <div className="mt-3">
              <h6 className="text-warning">Opposes</h6>
              <div className="ms-3">
                {opposes.map((belief, idx) => (
                  <Belief key={idx} {...belief} />
                ))}
              </div>
            </div>
          )} */}
        </div>
      </div>
      {/* Right acceptance card (background, extends right) */}
      <div
        id="right-acceptance-card"
        className={`position-absolute top-0 bottom-0 d-flex flex-column justify-content-center align-items-start bg-${
          (onAcceptanceRightChange ? acceptanceRight : localAcceptanceRight)
            ? "success"
            : "danger"
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
        onClick={handleRightClick}
        title={
          (onAcceptanceRightChange ? acceptanceRight : localAcceptanceRight)
            ? "Accepted by Right (click to toggle)"
            : "Not accepted by Right (click to toggle)"
        }
      ></div>
    </div>
  );
};

export default Belief;
