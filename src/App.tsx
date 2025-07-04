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
      y: -540,
      supports: [
        {
          id: 1,
          text: "The Sun is the center of our solar system.",
          acceptanceLeft: false,
          acceptanceRight: false,
          x: 100,
          y: 100,
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

  // Recursively update a belief's x/y by id in a nested belief tree
  function updateBeliefPosition(
    beliefs: Belief[],
    id: number,
    x: number,
    y: number
  ): Belief[] {
    return beliefs.map((b) => {
      if (b.id === id) {
        return { ...b, x, y };
      }
      let updated = { ...b };
      if (b.supports) {
        updated.supports = updateBeliefPosition(b.supports, id, x, y);
      }
      if (b.opposes) {
        updated.opposes = updateBeliefPosition(b.opposes, id, x, y);
      }
      return updated;
    });
  }

  return (
    <div
      className="App p-4 bg-secondary position-relative"
      style={{ zIndex: 0, minHeight: "100vh", minWidth: "100vw" }}
      onMouseUp={handleBgClick}
    >
      {beliefs.map((belief) => (
        <Belief
          key={belief.id}
          belief={belief}
          handleEditingBeliefChange={handleEditingBeliefChange}
          onPositionChange={(newX, newY, id = belief.id) => {
            setBeliefs((prev) => updateBeliefPosition(prev, id, newX, newY));
          }}
        />
      ))}
    </div>
  );
}

export default App;
