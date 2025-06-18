import Belief from "./components/Belief";
import React, { useState } from "react";

function App() {
  const [editingBelief, setEditingBelief] = useState<number | null>(null);
  const [wasEditingBelief, setWasEditingBelief] = useState(false);
  const [beliefs, setBeliefs] = useState<Belief[]>([
    {
      id: 0,
      text: "The Earth orbits the Sun.",
      acceptanceLeft: false,
      acceptanceRight: false,
      x: 0,
      y: 0,
    },
  ]);

  // Track mouse position for click vs drag detection
  const [mouseDownPos, setMouseDownPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleEditingBeliefChange = (id: number | null) => {
    console.log("Editing belief changed to:", id);
    // If we were editing a belief, we need to reset the state
    if (id === null) {
      setWasEditingBelief(true);
    }

    setEditingBelief(id);
  };

  const handleAddBeliefAt = (x: number, y: number) => {
    setBeliefs((prev) => {
      const newId = prev.length;
      // Add the new belief
      const newBeliefs = [
        ...prev,
        {
          id: newId,
          text: "New Belief",
          description: "",
          acceptanceLeft: false,
          acceptanceRight: false,
          x,
          y,
          locked: false,
        },
      ];
      return newBeliefs;
    });
  };

  const handleBgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target == e.currentTarget) {
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

  return (
    <div
      className="App p-4 bg-secondary min-vh-100 position-relative"
      style={{ zIndex: 0, minHeight: "100vh", minWidth: "100vw" }}
    >
      <div
        className="position-absolute w-100 h-100"
        onMouseUp={handleBgClick}
        style={{ top: 0, left: 0, zIndex: 0 }}
      >
        {beliefs.map((belief, idx) =>
          idx === 0 ? (
            <div
              className="w-100 d-flex justify-content-center"
              key={idx}
              style={{ zIndex: 1 }}
            >
              <div style={{ cursor: "grab", display: "inline-block" }}>
                <Belief
                  belief={belief}
                  handleEditingBeliefChange={handleEditingBeliefChange}
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
            >
              <Belief
                belief={belief}
                handleEditingBeliefChange={handleEditingBeliefChange}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
