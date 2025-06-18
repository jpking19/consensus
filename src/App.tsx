import Belief from "./components/Belief";
import React, { useState } from "react";

function App() {
  const [editingBelief, setEditingBelief] = useState<number | null>(null);
  const [beliefs, setBeliefs] = useState<Belief[]>([
    {
      id: 0,
      text: "The Earth orbits the Sun.",
      acceptanceLeft: false,
      acceptanceRight: false,
      x: 0,
      y: 0,
      supports: [
        {
          id: 1,
          text: "The Sun is the center of our solar system.",
          acceptanceLeft: false,
          acceptanceRight: false,
        },
        {
          id: 2,
          text: "The Earth is a planet that revolves around the Sun.",
          acceptanceLeft: false,
          acceptanceRight: false,
          supports: [
            {
              id: 4,
              text: "The Earth has a stable orbit around the Sun.",
              acceptanceLeft: false,
              acceptanceRight: false,
            },
          ],
        },
      ],
      opposes: [
        {
          id: 3,
          text: "The Earth is flat.",
          acceptanceLeft: false,
          acceptanceRight: false,
        },
      ],
    },
  ]);

  // Track mouse position for click vs drag detection
  const [mouseDownPos, setMouseDownPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleEditingBeliefChange = (id: number | null) => {
    console.log("Editing belief changed to:", id);
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
      className="App p-4 bg-secondary position-relative"
      style={{ zIndex: 0, minHeight: "100vh", minWidth: "100vw" }}
      onMouseUp={handleBgClick}
    >
      {beliefs.map((belief, idx) =>
        idx === 0 ? (
          <div key={idx} style={{ zIndex: 1 }}>
            <Belief
              belief={belief}
              handleEditingBeliefChange={handleEditingBeliefChange}
            />
          </div>
        ) : (
          <div
            className="position-absolute"
            key={idx}
            style={{
              left: belief.x,
              top: belief.y,
              zIndex: 3,
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
  );
}

export default App;
