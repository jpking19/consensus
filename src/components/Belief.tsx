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
  }, [text]);

  // Card sizing options
  const minWidth = 200;
  const maxWidth = 600;
  const minHeight = 64;

  // Calculate width based on text length and max lines
  const getTextWidth = (text: string) => {
    // Create a temporary span to measure text width
    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.position = "fixed";
    span.style.whiteSpace = "pre";
    span.style.font = "1rem system-ui, sans-serif";
    span.textContent = text;
    document.body.appendChild(span);
    const width = span.offsetWidth;
    document.body.removeChild(span);
    return width;
  };

  const [cardWidth, setCardWidth] = useState(minWidth);
  const [inputRows, setInputRows] = useState(1);

  React.useEffect(() => {
    if (editing) {
      // Estimate width for the input
      const width = Math.min(
        Math.max(getTextWidth(editValue) + 32, minWidth),
        maxWidth
      );
      setCardWidth(width);
      // Calculate number of rows needed
      const approxCharsPerLine = 50; // adjust as needed
      const lines = Math.ceil(editValue.length / approxCharsPerLine);
      setInputRows(lines);
    } else {
      setCardWidth(minWidth);
      setInputRows(1);
    }
  }, [editValue, editing]);

  return (
    <div className="d-flex align-items-stretch" style={{ gap: 8 }}>
      {/* Left acceptance card */}
      <div
        className={`card mb-3 d-flex flex-column justify-content-center align-items-center p-0 bg-${
          (onAcceptanceLeftChange ? acceptanceLeft : localAcceptanceLeft)
            ? "success"
            : "danger"
        } border border-light`}
        style={{
          width: 48,
          minWidth: 48,
          maxWidth: 48,
          cursor: "pointer",
          borderRadius: 8,
          transition: "background 0.2s",
          height: "100%",
        }}
        onClick={handleLeftClick}
        title={
          (onAcceptanceLeftChange ? acceptanceLeft : localAcceptanceLeft)
            ? "Accepted by Left (click to toggle)"
            : "Not accepted by Left (click to toggle)"
        }
      ></div>
      {/* Main belief card */}
      <div
        className="card bg-dark border border-light mb-3 flex-grow-1"
        style={{
          cursor: onTextChange ? "pointer" : undefined,
          borderRadius: 8,
          minWidth,
          maxWidth,
          width: editing ? cardWidth : undefined,
          minHeight,
          transition: "width 0.2s, min-width 0.2s, max-width 0.2s",
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
      {/* Right acceptance card */}
      <div
        className={`card mb-3 d-flex flex-column justify-content-center align-items-center p-0 bg-${
          (onAcceptanceRightChange ? acceptanceRight : localAcceptanceRight)
            ? "success"
            : "danger"
        } border border-light`}
        style={{
          width: 48,
          minWidth: 48,
          maxWidth: 48,
          cursor: "pointer",
          borderRadius: 8,
          transition: "background 0.2s",
          height: "100%",
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
