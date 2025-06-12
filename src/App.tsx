import Belief from "./components/Belief";
import React, { useState } from "react";

function App() {
  const [beliefs, setBeliefs] = useState([
    {
      text: "The Earth orbits the Sun.",
      description: "This is a foundational scientific fact.",
      acceptanceLeft: false,
      acceptanceRight: false,
      x: 0,
      y: 0,
    },
  ]);

  const handleTextChange = (idx: number, newText: string) => {
    setBeliefs((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, text: newText } : b))
    );
  };

  const handleAddBeliefAt = (x: number, y: number) => {
    setBeliefs((prev) => [
      ...prev,
      {
        text: "New Belief",
        description: "",
        acceptanceLeft: false,
        acceptanceRight: false,
        x,
        y,
      },
    ]);
  };

  const handleBgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("Background clicked", e);
    console.log("Target:", e.target);
    console.log("Current Target:", e.currentTarget);
    if (e.target == e.currentTarget) {
      // Prevent adding belief if clicking on an existing belief
      // Get click position relative to the container
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      handleAddBeliefAt(x, y);
    }
  };

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
              style={{ zIndex: 2 }}
            >
              <Belief
                text={belief.text}
                onTextChange={(t) => handleTextChange(idx, t)}
                description={belief.description}
                acceptanceLeft={belief.acceptanceLeft}
                acceptanceRight={belief.acceptanceRight}
              />
            </div>
          ) : (
            <div
              className="position-absolute"
              key={idx}
              style={{
                left: belief.x,
                top: belief.y,
                zIndex: 2,
              }}
            >
              <Belief
                text={belief.text}
                onTextChange={(t) => handleTextChange(idx, t)}
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
