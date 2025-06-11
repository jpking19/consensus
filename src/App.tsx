import Belief from "./components/Belief";
import React, { useState } from "react";

function App() {
  const [beliefText, setBeliefText] = useState("The Earth orbits the Sun.");
  return (
    <div className="App p-4 bg-secondary min-vh-100 position-relative">
      <div
        className="d-flex justify-content-center align-items-start w-100"
        style={{
          position: "absolute",
          top: "25%",
          left: 0,
          transform: "translateY(-75%)",
        }}
      >
        <Belief
          text={beliefText}
          onTextChange={setBeliefText}
          description="This is a foundational scientific fact."
          acceptanceLeft={true}
          acceptanceRight={true}
        />
      </div>
    </div>
  );
}

export default App;
