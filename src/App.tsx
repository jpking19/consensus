import Belief from "./components/Belief";
import React, { useState } from "react";

function App() {
  const [editingBelief, setEditingBelief] = useState<number | null>(null);
  const [wasEditingBelief, setWasEditingBelief] = useState(false);
  const [beliefs, setBeliefs] = useState([
    {
      id: 0,
      text: "The Earth orbits the Sun.",
      description: "This is a foundational scientific fact.",
      acceptanceLeft: false,
      acceptanceRight: false,
      x: 0,
      y: 0,
      locked: true, // Lock the first belief by default
    },
  ]);

  // Track which belief is being dragged and the offset
  const [draggedBelief, setDraggedBelief] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(
    null
  );
  // Track if a drag was attempted on a locked belief
  const [dragAttemptedOnLocked, setDragAttemptedOnLocked] = useState(false);
  // Track mouse position for click vs drag detection
  const [mouseDownPos, setMouseDownPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleTextChange = (idx: number, newText: string) => {
    setBeliefs((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, text: newText } : b))
    );
  };

  const handleEditingBeliefChange = (id: number | null) => {
    console.log("Editing belief changed to:", id);
    // If we were editing a belief, we need to reset the state
    if (id === null) {
      setWasEditingBelief(true);
    }

    setEditingBelief(id);
  };

  const handleAddBeliefAt = (x: number, y: number) => {
    setBeliefs((prev) => [
      ...prev,
      {
        id: prev.length,
        text: "New Belief",
        description: "",
        acceptanceLeft: false,
        acceptanceRight: false,
        x,
        y,
        locked: false,
      },
    ]);
  };

  const handleBgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target == e.currentTarget) {
      // Prevent adding a belief if last drag was on a locked belief
      if (dragAttemptedOnLocked) {
        setDragAttemptedOnLocked(false);
        return;
      }
      // Reset editing state if we were editing a belief
      if (editingBelief !== null) {
        setEditingBelief(null);
      } else {
        // Prevent adding belief if clicking on an existing belief
        // Get click position relative to the container
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        handleAddBeliefAt(x, y);
      }
    }
  };

  // Mouse event handlers for drag and edit distinction
  const handleMouseDown = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    // Check if the belief is locked
    if (beliefs[idx].locked) {
      setDragAttemptedOnLocked(true);
      return;
    }
    setDraggedBelief(idx);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    document.body.style.userSelect = "none";
  };

  // Only allow edit if mouse up is close to mouse down (not a drag)
  const handleMouseUpOnBelief = (idx: number, e: React.MouseEvent) => {
    if (mouseDownPos) {
      const dx = e.clientX - mouseDownPos.x;
      const dy = e.clientY - mouseDownPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 5) {
        // Considered a click, allow edit
        handleEditingBeliefChange(beliefs[idx].id);
      }
    }
    setMouseDownPos(null);
  };

  React.useEffect(() => {
    if (draggedBelief === null) return;
    const handleMouseMove = (e: MouseEvent) => {
      setBeliefs((prev) =>
        prev.map((b, i) =>
          i === draggedBelief && dragOffset
            ? { ...b, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
            : b
        )
      );
    };
    const handleMouseUp = () => {
      setDraggedBelief(null);
      setDragOffset(null);
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedBelief, dragOffset]);

  return (
    <div
      className="App p-4 bg-secondary min-vh-100 position-relative"
      style={{ zIndex: 0, minHeight: "100vh", minWidth: "100vw" }}
    >
      <div
        className="position-absolute w-100 h-100"
        onClick={handleBgClick}
        style={{ top: 0, left: 0, zIndex: 0 }}
      >
        {beliefs.map((belief, idx) =>
          idx === 0 ? (
            <div
              className="w-100 d-flex justify-content-center"
              key={idx}
              style={{ zIndex: 1 }}
            >
              <div
                style={{ cursor: "grab", display: "inline-block" }}
                onMouseDown={(e) => handleMouseDown(idx, e)}
                onMouseUp={(e) => handleMouseUpOnBelief(idx, e)}
              >
                <Belief
                  id={belief.id}
                  text={belief.text}
                  onTextChange={(t) => handleTextChange(idx, t)}
                  sendEditingBelief={handleEditingBeliefChange}
                  description={belief.description}
                  acceptanceLeft={belief.acceptanceLeft}
                  acceptanceRight={belief.acceptanceRight}
                />
              </div>
            </div>
          ) : (
            <div
              className="position-absolute"
              key={idx}
              style={{
                left: belief.x,
                top: belief.y,
                zIndex: 3,
                cursor: "grab",
                display: "inline-block",
              }}
              onMouseDown={(e) => handleMouseDown(idx, e)}
              onMouseUp={(e) => handleMouseUpOnBelief(idx, e)}
            >
              <Belief
                id={belief.id}
                text={belief.text}
                onTextChange={(t) => handleTextChange(idx, t)}
                sendEditingBelief={handleEditingBeliefChange}
                description={belief.description}
                acceptanceLeft={belief.acceptanceLeft}
                acceptanceRight={belief.acceptanceRight}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
